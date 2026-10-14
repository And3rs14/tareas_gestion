#!/usr/bin/env node
// Lista roles y miembros de un proyecto, o agrega un miembro con un rol.
//
// Para asignar una user story la persona tiene que ser miembro del proyecto.
// Agregar miembros da acceso al proyecto: hacerlo solo con el visto bueno del líder.
//
// Uso:
//   node scripts/taiga-members.mjs <slug>                     → lista roles y miembros
//   node scripts/taiga-members.mjs <slug> <userId> "<Rol>"    → agrega al usuario con ese rol
//   node scripts/taiga-members.mjs medmind 46 "Frontend"
import { taiga } from './lib/taiga.mjs';

const [, , slug, userId, roleName] = process.argv;
if (!slug) {
  console.error('Uso: node scripts/taiga-members.mjs <slug> [userId] ["Rol"]');
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
if (!userId) {
  console.log('ROLES:', p.roles.map(r => `${r.id}:${r.name}`).join(', '));
  console.log(`MIEMBROS (${p.members.length}):`);
  for (const m of p.members) console.log(`${m.id}\t${m.full_name_display}\t${m.role_name}`);
} else {
  const role = p.roles.find(r => r.name === roleName);
  if (!role) throw new Error(`El rol "${roleName}" no existe. Roles: ${p.roles.map(r => r.name).join(', ')}`);
  const u = await api(`/users/${userId}`);
  const res = await api('/memberships/bulk_create', {
    method: 'POST',
    body: JSON.stringify({ project_id: p.id, bulk_memberships: [{ role_id: role.id, username: u.email }] }),
  });
  for (const m of res) console.log(`OK ${m.full_name} → ${m.role_name}`);
}
