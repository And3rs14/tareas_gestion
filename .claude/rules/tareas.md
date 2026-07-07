# Estándar de redacción de tareas (Taiga)

> El "norte" para escribir tareas. Lo leen **programadores humanos** y **Claude Code / Codex**.
> Lo que más importa no es *cuál* formato, sino aplicarlo **siempre igual**.

## Vocabulario

En este estándar, **"tarea" = user story de Taiga** (que es como se trabaja en NUITI: US #N por proyecto). No se refiere a las `task` internas de Taiga (que además no tienen tools de edición/asignación en el fork del MCP).

## Principio guía (el "norte")

Una tarea está bien escrita cuando **un programador puede terminarla sin preguntar nada**, y se puede verificar que está hecha **leyendo solo los criterios de aceptación**.

## Plantilla

Se pega en la **descripción** de la user story en Taiga (acepta Markdown). Usar estos encabezados exactos y en este orden:

```markdown
## Objetivo
<Una o dos frases: qué queremos lograr y por qué. El "para qué", no el "cómo".>

## Alcance
Incluye:
- <qué SÍ entra en esta tarea>
Fuera de alcance:
- <qué NO entra — evita que la tarea crezca sin control>

## Criterios de aceptación (Definition of Done)
- [ ] <resultado verificable 1>
- [ ] <resultado verificable 2>
- [ ] <resultado verificable 3>

## Pistas técnicas
- Archivos/módulos: `<ruta/al/archivo>`, función `<nombre>()`
- Endpoints / tablas / configs relevantes: <...>
- Enfoque sugerido (opcional): <si ya se sabe por dónde va, decirlo; si no, omitirlo>

## Cómo probar
1. <paso concreto para verificar el resultado>
2. <comando, ruta o dato de prueba>

## Dependencias / bloqueos
- <ninguna | depende de la tarea #X | bloqueada por Y>
```

## Metadatos obligatorios en Taiga (fuera de la descripción)

- **Título:** verbo en imperativo ("Corregir…", "Añadir…", "Refactorizar…").
- **Tags:** al menos una categoría (`bug`, `feature`, `mejora`, `deuda-técnica`, `docs`).
- **Estado:** New → In progress → Ready for test → Done (sin saltos).
- **Asignado:** siempre una persona.
- **Prioridad:** Alta / Media / Baja (impacto + urgencia).
- **Puntos:** estimación relativa (1, 2, 3, 5, 8). *Dejar a confirmación del equipo.*

## Reglas de calidad

1. Criterios de aceptación **verificables** o no valen.
2. **Una tarea = un resultado** (si hay un "y" que une dos cosas, son dos tareas).
3. El alcance protege al programador: **"Fuera de alcance" es tan importante como "Incluye"**.
4. **Pistas técnicas con rutas reales, nunca inventadas.**
5. Si falta información, se marca `<PENDIENTE: ...>`, **no se rellena adivinando**.

## Cómo debe redactar Claude una tarea

1. **Inspecciona el repo del producto primero** y usa archivos/funciones/rutas reales en "Pistas técnicas".
2. Rellena la plantilla completa, con esos encabezados exactos y en ese orden.
3. Criterios de aceptación como checklist verificable (`- [ ]`).
4. Declara siempre "Fuera de alcance".
5. Ante datos que no puedas determinar, escribe `<PENDIENTE: ...>` en vez de adivinar.
6. Devuelve la tarea en un **bloque de código Markdown** listo para pegar en Taiga.
7. Sugiere aparte los metadatos (título, tags, prioridad, puntos), dejando la estimación de puntos a confirmación del equipo.
