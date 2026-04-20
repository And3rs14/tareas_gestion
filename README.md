# taiga-mcp-nuiti

Fork parcheado del [taigaMcpServer de greddy7574](https://github.com/greddy7574/taigaMcpServer) adaptado para el Taiga self-hosted de NUITI (`https://taiga.nuiti.org`).

Permite gestionar proyectos, user stories, tareas, wikis y adjuntos de Taiga directamente desde Claude Code o Codex CLI usando lenguaje natural — sin abrir el navegador.

## Qué incluye

- **`taigaMcpServer/`** — servidor MCP con parches propios sobre el fork original
- **`AGENTS.md`** — guía de setup, parches aplicados y buenas prácticas para admins

## Inicio rápido

```bash
git clone <este-repo>
cd taigaMcpServer && npm install
```

Luego registrar el MCP en Claude Code con tus credenciales de Taiga. Ver instrucciones completas en [AGENTS.md](./AGENTS.md).

## Parches sobre el original

El fork agrega y corrige varios tools: `getUserStory` por ref, `updateUserStory`, `assignUserStory`, `updateUserStoryStatus`, `listProjectMembers`, `moveUserStory`, embed de imágenes en descripciones, y corrección de bugs en todos los tools de wiki. Ver tabla completa en [AGENTS.md](./AGENTS.md).
