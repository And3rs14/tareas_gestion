# Gestión de tareas Taiga vía Claude Code / Codex CLI

Carpeta de trabajo para gestionar el Taiga self-hosted (`https://taiga.nuiti.org`) desde Claude Code usando un **fork parcheado** del MCP de greddy7574.

## Qué hay aquí

- `taigaMcpServer/` — fork local del MCP server. **No es el paquete npm**; es una copia editable con parches propios.
- `.claude/rules/tareas.md` — **estándar de redacción de tareas** (el "norte"). Léelo antes de escribir cualquier user story en Taiga.

## Cómo escribir tareas

Todas las tareas/user stories se redactan siguiendo el estándar en [`.claude/rules/tareas.md`](./.claude/rules/tareas.md): formato corto (Objetivo + Listo cuando; el cómo lo decide el programador), creadas una por una con el visto bueno del líder.

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
| `createWikiPage` | Arreglado bug (`resolvedProject.id` era `undefined`). Nuevo param `sidebarTitle` para agregar al sidebar en un paso. Valida que el link del sidebar apunte a la página real: Taiga ignora el `href` y lo deriva del **título**, así que si el slug del título no coincide con el de la página el link se descarta y se avisa (antes quedaba un link a una página vacía) |
| `updateUserStory` | **Nuevo** — edita `subject`, `description`, `tags` |
| `updateUserStoryStatus` | **Nuevo** — cambia el estado de una user story |
| `assignUserStory` | **Nuevo** — asignar por nombre/email/id |
| `listProjectMembers` | **Nuevo** — lista miembros con `user_id` y email |
| `uploadAttachment` | Nuevos params `embedInDescription` + `embedPosition` para incrustar imagen con fragmento `#_taiga-refresh` |
| `listAttachments` | Ahora devuelve URL del adjunto |
| `uploadAttachment` + `listAttachments` | Aceptan `itemType: "wiki_page"` (adjuntos en páginas wiki). `itemId` admite el id numérico o el **slug** de la página (con `projectIdentifier`) |
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
- **Ref (#N) → id interno:** `uploadAttachment` (y otras tools) piden el `itemId` **interno**, no el ref `#N` (el ref da 400). Helper para resolverlo en un paso:
  `node scripts/taiga-ref-to-id.mjs <slug> <ref> [userstory|issue|task]` → imprime el id interno (lee credenciales del entorno; ver el header del script).
- **Para editar una tarea que ya tiene imágenes, no reemplazar la descripción entera** (ver trampas abajo): usar `scripts/taiga-us-replace.mjs`.

## Scripts de apoyo (`scripts/`)

Cubren lo que el MCP no hace o hace mal. Todos leen `TAIGA_API_URL`, `TAIGA_USERNAME` y
`TAIGA_PASSWORD` del entorno (las mismas del MCP; nunca hardcodearlas, este repo es público)
y comparten el cliente `scripts/lib/taiga.mjs`. Cada script explica su uso en el header.

| Script | Qué hace |
|---|---|
| `taiga-ref-to-id.mjs <slug> <ref>` | Ref `#N` → id interno (para `uploadAttachment`, `updateUserStoryStatus`, `addComment`) |
| `taiga-us-replace.mjs <slug> <ref> '[["viejo","nuevo"]]'` | Edita fragmentos de título/descripción sin perder las imágenes incrustadas |
| `taiga-reembed.mjs <slug> <ref>` | Vuelve a incrustar imágenes adjuntas que se perdieron de la descripción |
| `taiga-status.mjs <slug> <desde> [hasta]` | Estado, fecha límite, asignados y último comentario del equipo (¿comentaron su plan?) |
| `taiga-set-due.mjs <slug> '{"<ref>":"YYYY-MM-DD"}'` | Pone fechas límite en lote |
| `taiga-us-by-person.mjs <slug>` | Tareas del proyecto agrupadas por persona |
| `taiga-by-user.mjs <userId>` | Tareas de una persona en todos los proyectos |
| `taiga-find-user.mjs <texto>` | Busca usuarios por nombre, username o email → `user_id` |
| `taiga-members.mjs <slug> [userId "Rol"]` | Lista roles y miembros, o agrega un miembro (solo con visto bueno del líder) |

## Trampas conocidas (aprendidas en uso)

- **`updateUserStory` con `description` borra las imágenes incrustadas.** Reemplaza el texto
  completo y se pierden los links `#_taiga-refresh`. Editar con `taiga-us-replace.mjs`; si ya
  pasó, reparar con `taiga-reembed.mjs`.
- **Paginación de 30.** La API devuelve 30 resultados si no se manda `x-disable-pagination: True`.
  `listProjectMembers` y `assignUserStory` (que busca por nombre entre los miembros) fallan o
  no encuentran a la persona en proyectos con más de 30 miembros. Workaround: buscar el
  `user_id` con `taiga-find-user.mjs` y asignar por id.
- **Para asignar, la persona debe ser miembro del proyecto.** Si `assignUserStory` falla,
  revisar con `taiga-members.mjs <slug>`.
- **`updateUserStoryStatus` / `addComment` piden el id interno.** Nunca pasar el número de la
  tarea sin `#` como si fuera id: apunta a otra user story.
- **`addComment` responde "無內容" (sin contenido)** aunque el comentario sí se guarda. Es un bug
  cosmético del formateo; verificar en Taiga si hace falta.
- Los estados de Medmind se escriben `In progress` (p minúscula), `Ready for test`, `Done`.

## Git flow de los repos de Medmind

Útil para nombrar la rama base correcta al redactar tareas.

- Repos: `medmind.backend` y `medstudio-app`. Ramas: `main` (producción), `soporte` (espejo de
  producción, correcciones) y `developer` (integración del desarrollo).
- Los devs sacan rama de `developer` (o de `soporte` si es soporte) y hacen PR a la misma rama
  de la que salieron; ellos resuelven los conflictos. Nadie pushea a `main` ni usa `--force`.
- Solo Anderson hace PRs a `main` y actualiza `developer` con `soporte`.
- Nombres de rama: `feat/us<N>-descripcion-kebab`, `fix/us<N>-...`.
- Detalle en la wiki: https://taiga.nuiti.org/project/medmind/wiki/manejo-de-ramas

## Limitaciones conocidas

- `batchCreateUserStories` está roto (falla todas). Usar `createUserStory` individualmente en paralelo.
- `task` no tiene `updateTask` ni asignación genérica — solo `createTask`. Replicar el patrón de `updateUserStory` si hace falta.
- `advancedSearch` devuelve resultados vacíos con varios queries. No confiable.

## Contacto

Mantenedor: Anderson (NUITI). Si el MCP upstream de greddy7574 añade features, hay que rebasar los parches manualmente (están listados arriba).
