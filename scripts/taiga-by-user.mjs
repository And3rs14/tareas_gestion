#!/usr/bin/env node
// User stories asignadas a una persona en TODOS los proyectos. Solo lectura.
//
// Uso:
//   node scripts/taiga-by-user.mjs <userId>
//   (el userId se busca con taiga-find-user.mjs)
import { taiga } from './lib/taiga.mjs';

const uid = Number(process.argv[2]);
if (!uid) {
  console.error('Uso: node scripts/taiga-by-user.mjs <userId>');
  process.exit(1);
}
const api = await taiga();
for (const p of await api('/projects')) {
  const us = await api(`/userstories?project=${p.id}`);
  for (const u of us.filter(u => (u.assigned_users || []).includes(uid) || u.assigned_to === uid)) {
    const st = u.status_extra_info;
    console.log(`${p.name}\t#${u.ref}\t[${st?.name}${st?.is_closed ? ' · cerrada' : ''}]\tvence=${u.due_date ?? '-'}\t${u.subject}`);
  }
}
