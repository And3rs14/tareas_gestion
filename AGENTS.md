# Gestión de tareas Taiga vía Claude Code / Codex CLI

Carpeta de trabajo para gestionar el Taiga self-hosted (`https://taiga.nuiti.org`) desde Claude Code usando un **fork parcheado** del MCP de greddy7574.

## Qué hay aquí

- `taigaMcpServer/` — fork local del MCP server. **No es el paquete npm**; es una copia editable con parches propios.
- `.claude/rules/tareas.md` — **estándar de redacción de tareas** (el "norte"). Léelo antes de escribir cualquier user story en Taiga.

## Cómo escribir tareas

Todas las tareas/user stories se redactan siguiendo el estándar en [`.claude/rules/tareas.md`](./.claude/rules/tareas.md): inspeccionar primero el repo del producto, rellenar la plantilla completa con rutas reales, y devolver un bloque Markdown listo para pegar en Taiga.

## Setup para otro admin

1. Tener Claude Code instalado.
2. Clonar este repo a una ruta local.
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

### Alternativa: usar Codex CLI (OpenAI)

MCP es un estándar abierto, así que el mismo server funciona con Codex CLI. Editar `%USERPROFILE%\.codex\config.toml` y agregar:

```toml
[mcp_servers.taiga-mcp]
command = "node"
args = ["C:/ruta/absoluta/a/taigaMcpServer/src/index.js"]

[mcp_servers.taiga-mcp.env]
TAIGA_API_URL = "https://taiga.nuiti.org/api/v1"
TAIGA_USERNAME = "tu_usuario"
TAIGA_PASSWORD = "tu_password"
```

## Parches aplicados al fork (vs. greddy7574 original)

| Tool | Cambio |
|---|---|
| `listUserStories` | Muestra `id` interno, asignado y sprint (antes solo ref + status) |
| `getUserStory` | Acepta ref `#N` + `projectIdentifier` (antes solo ID interno — fallaba siempre) |
| `createWikiPage` | Arreglado bug (`resolvedProject.id` era `undefined`). Nuevo param `sidebarTitle` para agregar al sidebar en un paso |
| `updateUserStory` | **Nuevo** — edita `subject`, `description`, `tags` |
| `updateUserStoryStatus` | **Nuevo** — cambia el estado de una user story |
| `assignUserStory` | **Nuevo** — asignar por nombre/email/id |
| `listProjectMembers` | **Nuevo** — lista miembros con `user_id` y email |
| `uploadAttachment` | Nuevos params `embedInDescription` + `embedPosition` para incrustar imagen con fragmento `#_taiga-refresh` |
| `listAttachments` | Ahora devuelve URL del adjunto |
| `moveUserStory` | **Nuevo** — reordena en kanban. Usa `POST /userstories/bulk_update_kanban_order` |
| Otros tools de wiki | Bug `resolvedProject.id undefined` arreglado globalmente |

## Uso típico

Háblale a Claude Code en lenguaje natural. Ejemplos:

- "¿Qué proyectos tengo en Taiga?"
- "Muéstrame el estado de Geresa dashboard — user stories, sprints, issues"
- "Asigna la #4 de medmind a Leoncio"
- "Crea una user story en geresa dashboard: '<título>' con esta descripción: ..."
- "Sube esta imagen a la story #15 de medmind y métela en la descripción"
- "Crea una página wiki en geresa dashboard sobre X" (usar `sidebarTitle` para que aparezca en el menú)

## Buenas prácticas

- **Usa refs + projectIdentifier** para stories/issues (más legible que IDs internos).
- Antes de editar descripciones masivamente, revisa con `getUserStory` que estás en la correcta.
- `updateUserStoryStatus` usa IDs internos, no refs — obtenerlos con `listUserStories`.
- El token de attachments caduca: embedir imágenes requiere el fragmento `#_taiga-refresh=userstory:{attachment_id}` — el tool `uploadAttachment` con `embedInDescription:true` lo maneja solo.

## Limitaciones conocidas

- `batchCreateUserStories` está roto (falla todas). Usar `createUserStory` individualmente en paralelo.
- `task` no tiene `updateTask` ni asignación genérica — solo `createTask`. Replicar el patrón de `updateUserStory` si hace falta.
- `advancedSearch` devuelve resultados vacíos con varios queries. No confiable.

## Contacto

Mantenedor: Anderson (NUITI). Si el MCP upstream de greddy7574 añade features, hay que rebasar los parches manualmente (están listados arriba).
