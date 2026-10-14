#!/usr/bin/env node
// User stories de un proyecto agrupadas por asignado (últimas 12 de cada uno). Solo lectura.
//
// Uso:
//   node scripts/taiga-us-by-person.mjs <slug>
import { taiga, assignees } from './lib/taiga.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Uso: node scripts/taiga-us-by-person.mjs <slug>');
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
const by = {};
for (const u of await api(`/userstories?project=${p.id}`)) {
  const names = assignees(u);
  for (const n of names.length ? names : ['(sin asignar)']) (by[n] ||= []).push(`#${u.ref} [${u.status_extra_info?.name}] ${u.subject}`);
}
for (const [n, l] of Object.entries(by).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n== ${n} (${l.length})`);
  console.log(l.slice(-12).join('\n'));
}
