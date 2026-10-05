#!/usr/bin/env node
// Resuelve el id interno de una user story (o issue/task) a partir de su ref (#N) + slug del proyecto.
//
// Por qué existe: el fork del MCP de Taiga necesita el id INTERNO en tools como
// `uploadAttachment` (param `itemId`), no el ref `#N` que se ve en la UI. Pasar el ref da 400.
// Este helper hace el paso `slug + #ref -> id interno` en un solo comando.
//
// Uso:
//   node scripts/taiga-ref-to-id.mjs <slug-proyecto> <ref> [tipo]
//   node scripts/taiga-ref-to-id.mjs medmind 103
//   node scripts/taiga-ref-to-id.mjs test_nuiti 68 issue
//
//   tipo: userstory (default) | issue | task
//
// Credenciales: se leen del ENTORNO (nunca hardcodeadas — este repo se sube a GitHub).
//   TAIGA_API_URL   (default: https://taiga.nuiti.org/api/v1)
//   TAIGA_USERNAME
//   TAIGA_PASSWORD
// Son las mismas que ya usa el MCP; si no están en tu shell, exportalas antes de correr:
//   PowerShell:  $env:TAIGA_USERNAME='...'; $env:TAIGA_PASSWORD='...'
//   Bash:        export TAIGA_USERNAME=...  TAIGA_PASSWORD=...
//
// Salida: imprime solo el id interno (ideal para capturarlo en una variable).

const BASE = process.env.TAIGA_API_URL || 'https://taiga.nuiti.org/api/v1';
const USER = process.env.TAIGA_USERNAME;
const PASS = process.env.TAIGA_PASSWORD;

const [, , slug, rawRef, rawType = 'userstory'] = process.argv;

function die(msg) {
  console.error('Error: ' + msg);
  process.exit(1);
}

if (!slug || !rawRef) {
  die('Uso: node scripts/taiga-ref-to-id.mjs <slug-proyecto> <ref> [userstory|issue|task]');
}
if (!USER || !PASS) {
  die('Faltan TAIGA_USERNAME / TAIGA_PASSWORD en el entorno (mismas credenciales del MCP).');
}

const ref = String(rawRef).replace(/^#/, '');
const endpointByType = {
  userstory: 'userstories',
  issue: 'issues',
  task: 'tasks',
};
const endpoint = endpointByType[rawType];
if (!endpoint) die(`tipo inválido: "${rawType}" (usa userstory | issue | task)`);

async function main() {
  const authRes = await fetch(BASE + '/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'normal', username: USER, password: PASS }),
  });
  if (!authRes.ok) die(`auth falló (${authRes.status})`);
  const { auth_token } = await authRes.json();
  const headers = { Authorization: 'Bearer ' + auth_token };

  const projRes = await fetch(BASE + `/projects?slug=${encodeURIComponent(slug)}`, { headers });
  const projs = await projRes.json();
  const project = Array.isArray(projs) ? projs.find((p) => p.slug === slug) : null;
  if (!project) die(`no se encontró un proyecto con slug "${slug}"`);

  const itemRes = await fetch(
    BASE + `/${endpoint}/by_ref?ref=${ref}&project=${project.id}`,
    { headers },
  );
  const item = await itemRes.json();
  if (!item || !item.id) {
    die(`no se encontró ${rawType} #${ref} en el proyecto "${slug}" (project_id=${project.id})`);
  }
  // stderr: contexto legible; stdout: solo el id (para capturar en una variable)
  console.error(`proyecto "${slug}" id=${project.id} · ${rawType} #${ref} -> id interno ${item.id}`);
  console.log(item.id);
}

main().catch((e) => die(e.message));
