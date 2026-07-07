# Gestión de tareas Taiga vía Claude Code

Carpeta de trabajo para **redactar y gestionar tareas** del Taiga self-hosted de NUITI (`https://taiga.nuiti.org`) desde Claude Code / Codex, usando un fork parcheado del MCP de greddy7574.

## Cómo escribir tareas (el "norte")

@.claude/rules/tareas.md

Siempre que redactes una tarea/user story, seguí ese estándar: inspeccioná primero el repo del producto correspondiente, rellená la plantilla completa con rutas reales, y devolvé un bloque Markdown listo para pegar en Taiga.

## Guía del MCP (setup, parches, buenas prácticas)

@AGENTS.md

## Reglas de trabajo

- **Estrategia antes que código:** revisá restricciones y el terreno, proponé enfoque, y solo entonces implementá.
- **No inventar:** rutas, funciones y datos deben ser reales; lo desconocido se marca como `<PENDIENTE: ...>`.
- Cambios reales en el repo esperan aprobación explícita.

## Estado de sesiones

El estado de dónde quedó cada sesión vive en [`bitacora-sesiones.md`](./bitacora-sesiones.md) (no se carga automáticamente; consultar bajo demanda).
