#!/usr/bin/env node
// Reemplaza texto en el título y la descripción de una user story SIN tocar lo demás.
//
// Por qué existe: reemplazar la descripción entera con `updateUserStory` borra las imágenes
// incrustadas (los links con #_taiga-refresh). Este script cambia solo los fragmentos indicados.
// Cada texto a reemplazar debe aparecer exactamente 1 vez; si no, no cambia nada.
//
// Uso:
//   node scripts/taiga-us-replace.mjs <slug> <ref> '[["texto viejo","texto nuevo"], ...]'
//   node scripts/taiga-us-replace.mjs medmind 138 '[["(Parte 1)","(Parte 1 · base)"]]'
import { taiga } from './lib/taiga.mjs';

const [, , slug, ref, json] = process.argv;
if (!json) {
  console.error(`Uso: node scripts/taiga-us-replace.mjs <slug> <ref> '[["viejo","nuevo"]]'`);
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
const us = await api.story(p.id, ref);
let { subject, description } = us;
for (const [a, b] of JSON.parse(json)) {
  const hits = subject.split(a).length - 1 + description.split(a).length - 1;
  if (hits !== 1) throw new Error(`"${a}" aparece ${hits} veces; no se cambia nada`);
  subject = subject.replace(a, b);
  description = description.replace(a, b);
}
await api(`/userstories/${us.id}`, { method: 'PATCH', body: JSON.stringify({ version: us.version, subject, description }) });
console.log(`OK #${ref}: ${subject}`);
