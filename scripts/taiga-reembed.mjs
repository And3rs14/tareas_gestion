#!/usr/bin/env node
// Vuelve a incrustar al final de la descripción las imágenes adjuntas que ya no aparecen en ella.
//
// Para reparar una user story cuyas imágenes se perdieron al reescribir la descripción.
//
// Uso:
//   node scripts/taiga-reembed.mjs <slug> <ref>
import { taiga } from './lib/taiga.mjs';

const [, , slug, ref] = process.argv;
if (!ref) {
  console.error('Uso: node scripts/taiga-reembed.mjs <slug> <ref>');
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
const us = await api.story(p.id, ref);
const atts = await api(`/userstories/attachments?object_id=${us.id}&project=${p.id}`);
const imgs = atts.filter(a => /\.(png|jpe?g|gif|webp)$/i.test(a.name) && !us.description.includes(`userstory:${a.id}`));
if (!imgs.length) {
  console.log('Nada que incrustar.');
  process.exit(0);
}
const md = imgs.map(a => `![${a.name}](${a.url}#_taiga-refresh=userstory:${a.id})`).join('\n\n');
await api(`/userstories/${us.id}`, { method: 'PATCH', body: JSON.stringify({ version: us.version, description: us.description.trimEnd() + '\n\n' + md }) });
console.log('Incrustadas:', imgs.map(a => a.name).join(', '));
