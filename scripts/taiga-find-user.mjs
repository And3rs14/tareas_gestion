#!/usr/bin/env node
// Busca usuarios de Taiga por nombre, username o email. Solo lectura.
//
// Uso:
//   node scripts/taiga-find-user.mjs <texto> [otro texto...]
//   node scripts/taiga-find-user.mjs piero sinti
import { taiga } from './lib/taiga.mjs';

const q = process.argv.slice(2).map(s => s.toLowerCase());
if (!q.length) {
  console.error('Uso: node scripts/taiga-find-user.mjs <texto>');
  process.exit(1);
}
const api = await taiga();
for (const u of await api('/users')) {
  const full = await api(`/users/${u.id}`);
  const hay = `${full.full_name} ${full.username} ${full.email}`.toLowerCase();
  if (q.some(s => hay.includes(s))) console.log(`${u.id}\t${full.full_name_display}\t${full.username}\t${full.email}`);
}
