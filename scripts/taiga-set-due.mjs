#!/usr/bin/env node
// Pone fecha límite (due_date) a varias user stories de un proyecto.
//
// Uso:
//   node scripts/taiga-set-due.mjs <slug> '{"<ref>":"YYYY-MM-DD", ...}'
//   node scripts/taiga-set-due.mjs medmind '{"136":"2026-10-06","137":"2026-10-07"}'
import { taiga } from './lib/taiga.mjs';

const [, , slug, json] = process.argv;
if (!json) {
  console.error(`Uso: node scripts/taiga-set-due.mjs <slug> '{"<ref>":"YYYY-MM-DD"}'`);
  process.exit(1);
}
const api = await taiga();
const p = await api.project(slug);
for (const [ref, date] of Object.entries(JSON.parse(json))) {
  const us = await api.story(p.id, ref);
  const r = await api(`/userstories/${us.id}`, { method: 'PATCH', body: JSON.stringify({ version: us.version, due_date: date }) });
  console.log(`#${ref}\tvence=${r.due_date}`);
}
