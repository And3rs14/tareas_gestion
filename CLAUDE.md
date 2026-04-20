# Gestión de tareas Taiga vía Claude Code

Carpeta de trabajo para gestionar el Taiga self-hosted (`https://taiga.nuiti.org`) desde Claude Code usando un **fork parcheado** del MCP de greddy7574.

## Qué hay aquí

- `taigaMcpServer/` — fork local del MCP server (ver [README original](./taigaMcpServer/README.md)). **No es el paquete npm**; es una copia editable con parches propios.

## Setup para otro admin

1. Tener Claude Code instalado.
2. Clonar este repo (o copiar `taigaMcpServer/`) a una ruta local.
3. `cd taigaMcpServer && npm install`.
4. Registrar el MCP (ajusta la ruta):

```bash
claude mcp add-json taiga-mcp '{
  "command": "node",
  "args": ["/ruta/absoluta/a/taigaMcpServer/src/index.js"],
  "env": {
    "TAIGA_API_URL": "https://taiga.nuiti.org/api/v1",
    "TAIGA_USERNAME": "tu_usuario",
    "TAIGA_PASSWORD": "tu_password"
  }
}'
```

5. Reiniciar Claude Code. Verificar con `/mcp` que `taiga-mcp` aparezca conectado.

> ⚠️ En Windows, si Claude Code queda con entradas duplicadas del MCP (una con `npx` y otra con `node`), editar manualmente `%USERPROFILE%\.claude.json` y dejar solo la de `node`.

### Alternativa: usar Codex CLI (OpenAI) en vez de Claude Code

MCP es un estándar abierto, así que el mismo server funciona con Codex CLI. Editar `~/.codex/config.toml` (en Windows: `%USERPROFILE%\.codex\config.toml`) y agregar:

```toml
[mcp_servers.taiga-mcp]
command = "node"
args = ["C:/ruta/absoluta/a/taigaMcpServer/src/index.js"]

[mcp_servers.taiga-mcp.env]
TAIGA_API_URL = "https://taiga.nuiti.org/api/v1"
TAIGA_USERNAME = "tu_usuario"
TAIGA_PASSWORD = "tu_password"
```

Luego `codex` — al iniciar debería cargar los 40+ tools de taiga. El lenguaje natural de uso es idéntico al de Claude Code.

## Parches aplicados al fork (vs. greddy7574 original)

| Tool | Cambio |
|---|---|
| `listUserStories` | Muestra `id` interno, asignado y sprint (antes solo ref + status) |
| `getUserStory` | Acepta ref `#N` + `projectIdentifier` (antes solo ID interno — fallaba siempre) |
| `createWikiPage` | Arreglado bug (`resolvedProject.id` era `undefined`). Nuevo param `sidebarTitle` para agregar al sidebar en un paso |
| `updateUserStory` | **Nuevo** — edita `subject`, `description`, `tags` |
| `assignUserStory` | **Nuevo** — asignar por nombre/email/id |
| `listProjectMembers` | **Nuevo** — lista miembros con `user_id` y email |
| `uploadAttachment` | Nuevos params `embedInDescription` + `embedPosition` para incrustar la imagen como markdown en la descripción con el fragmento `#_taiga-refresh` que Taiga necesita para refrescar tokens |
| `listAttachments` | Ahora devuelve URL del adjunto |
| `moveUserStory` | **Nuevo** — reordena en kanban (`top`/`bottom`/índice). Usa `POST /userstories/bulk_update_kanban_order` con `status_id` + `bulk_userstories` (lista de IDs en orden). El PATCH directo con `kanban_order` no mueve visualmente. |
| Otros tools de wiki | Bug `resolvedProject.id undefined` arreglado globalmente |

## Uso típico

Hablale a Claude Code en lenguaje natural. Ejemplos:

- "¿Qué proyectos tengo en Taiga?"
- "Muéstrame el estado de Medmind — user stories, sprints, issues"
- "Asigna la #4 de medmind a Leoncio"
- "Crea una user story en geresa dashboard: '<título>' con esta descripción: ..."
- "Sube esta imagen a la story #15 de medmind y mételo en la descripción"
- "Quién tiene asignadas las tareas in progress de geresa dashboard"
- "Crea una página wiki en geresa dashboard sobre X" (usar `sidebarTitle` para que aparezca en el menú)

## Buenas prácticas

- **Usa refs + projectIdentifier** para stories/issues (más legible que IDs internos).
- Antes de editar descripciones masivamente, revisa con `getUserStory` que estás en la correcta.
- El token de attachments caduca: embedir imágenes requiere el fragmento `#_taiga-refresh=userstory:{attachment_id}` — el tool `uploadAttachment` con `embedInDescription:true` lo maneja solo.
- Los proyectos self-hosted privados requieren ese token siempre; si haces el proyecto público, las URLs funcionan sin token.

## Limitaciones conocidas

- `batchCreateUserStories` del MCP está roto (falla las 7 de 7). Usar `createUserStory` individualmente (en paralelo desde Claude Code es rápido).
- Tareas (`task`) no tienen tool de `updateTask` ni de asignación genérica — solo `createTask`. Si hace falta, replicar el patrón de `updateUserStory`.
- `advancedSearch` devuelve resultados vacíos con varios queries. No confiable.

## Dónde quedó la última sesión (2026-04-15)

**Medmind:**
- US #1 → José Santos, #3 y #4 → Leoncio asignadas.
- Creadas #11–#17 (todas New, sin asignar): nickname, intentos simulacro, preguntas IA, categorización IA, limpiar tag, fallback Claude→OpenAI, módulo mascota/tienda/economía.
- US #15 tiene captura adjunta + embed inline (attachment id 9).

**Geresa dashboard:**
- US #32 creada y asignada a Piero Sinti: "Filtros dependientes en API de ubigeo". Deadline sugerido 2026-04-16. Descripción incluye análisis del backend: hay que crear `/api/provincias` y extender `/api/distritos` con filtro por provincia.
- Wiki page `anonimizacion-de-identificadores` creada con doc sobre HASH_SECRET y flujo de doble hashing. En sidebar.

**Pendientes discutidos pero no hechos:**
- Mover salt de NotiWeb hardcodeado a `.env` (deuda técnica mencionada en la wiki).
- Asignar US #5–#10 y #11–#17 de medmind.
- Ready for test acumulado en geresa dashboard (#24, #25, #26, #30) — nadie testea.

## Contacto

Mantenedor del fork: Anderson. Si el MCP upstream de greddy7574 añade features, hay que rebasar los parches manualmente (están listados arriba).
