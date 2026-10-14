// Cliente mínimo de la API de Taiga para los scripts de esta carpeta.
//
// Credenciales: se leen del ENTORNO (nunca hardcodeadas — este repo se sube a GitHub).
//   TAIGA_API_URL   (default: https://taiga.nuiti.org/api/v1)
//   TAIGA_USERNAME
//   TAIGA_PASSWORD
//
// Siempre manda `x-disable-pagination: True`: sin ese header la API corta en 30 resultados
// y los listados (miembros, user stories) salen incompletos sin avisar.

const BASE = process.env.TAIGA_API_URL || 'https://taiga.nuiti.org/api/v1';

export async function taiga() {
  const { TAIGA_USERNAME: username, TAIGA_PASSWORD: password } = process.env;
  if (!username || !password) {
    console.error('Faltan TAIGA_USERNAME / TAIGA_PASSWORD en el entorno.');
    process.exit(1);
  }
  const auth = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'normal', username, password }),
  }).then(r => r.json());
  if (!auth.auth_token) throw new Error(`Login falló: ${JSON.stringify(auth)}`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth.auth_token}`,
    'x-disable-pagination': 'True',
  };
  const api = async (path, opt = {}) => {
    const r = await fetch(`${BASE}${path}`, { ...opt, headers });
    const t = await r.text();
    if (!r.ok) throw new Error(`${r.status} ${path}: ${t}`);
    return t ? JSON.parse(t) : null;
  };
  api.project = slug => api(`/projects/by_slug?slug=${slug}`);
  api.story = (projectId, ref) => api(`/userstories/by_ref?ref=${ref}&project=${projectId}`);
  return api;
}

export const assignees = u =>
  (u.assigned_users_extra_info?.length ? u.assigned_users_extra_info
    : u.assigned_to_extra_info ? [u.assigned_to_extra_info] : [])
    .map(x => x.full_name_display);
