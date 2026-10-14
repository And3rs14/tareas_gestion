#!/usr/bin/env node
// Estado de un rango de user stories: estado, fecha límite, asignados y último comentario del equipo.
// Solo lectura. Sirve para revisar si comentaron su plan y si están atrasadas.
//
// Uso:
//   node scripts/taiga-status.mjs <slug> <refDesde> [refHasta]
//   node scripts/taiga-status.mjs medmind 136 155
import { taiga, assignees } from './lib/taiga.mjs';

const [, , slug, from, to = from] = process.argv;
if (!from) {
  console.error('Uso: node scripts/taiga-status.mjs <slug> <refDesde> [refHasta]');
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
for (let ref = Number(from); ref <= Number(to); ref++) {
  const u = await api.story(p.id, ref).catch(() => null);
  if (!u?.id) {
    console.log(`#${ref}\t(no existe)`);
    continue;
  }
  const hist = await api(`/history/userstory/${u.id}?type=comment`);
  const team = hist.filter(h => h.comment && !h.delete_comment_date && h.user?.username !== 'admin');
  const last = team.at(-1);
  console.log([
    `#${ref}`, u.status_extra_info?.name, `vence=${u.due_date ?? '-'}`, assignees(u).join(', ') || '-',
    `comentarios=${team.length}`, u.subject.slice(0, 70),
    last ? `ÚLTIMO ${last.user?.full_name_display ?? last.user?.name}: ${last.comment.replace(/\s+/g, ' ').slice(0, 160)}` : '',
  ].join('\t'));
}
