# Estándar de redacción de tareas (Taiga)

> El "norte" para escribir tareas. Lo leen **programadores humanos** y **Claude Code / Codex**.
> Lo que más importa no es *cuál* formato, sino aplicarlo **siempre igual**.

## Vocabulario

En este estándar, **"tarea" = user story de Taiga** (que es como se trabaja en NUITI: US #N por proyecto). No se refiere a las `task` internas de Taiga (que además no tienen tools de edición/asignación en el fork del MCP).

## Principio guía (el "norte")

La tarea dice **qué** se quiere y **para qué**. El **cómo** lo decide el programador.

Por qué: con tareas muy detalladas (rutas, funciones, pasos de prueba) algunos programadores
ejecutan el detalle al pie de la letra sin criterio propio, y el líder no tiene tiempo de leer
descripciones largas. Al quitar el cómo, el programador tiene que pensarlo y lo deja escrito
en un plan corto que el líder revisa en un minuto.

Una tarea está bien escrita cuando se puede verificar que está hecha **leyendo solo "Listo cuando"**.

## Plantilla (formato corto, el de siempre)

Se pega en la **descripción** de la user story en Taiga (acepta Markdown):

```markdown
## Objetivo
<Para qué sirve, en una frase.>

## Dónde
- <URL de la pantalla afectada (stagging o prod)>   ← solo si aplica

## Listo cuando
- [ ] <resultado verificable>
- [ ] <resultado verificable>

> El cómo lo decides tú. Antes de empezar, comenta en la tarea tu plan en 3-5 líneas.

## Dependencias / bloqueos      ← solo si hay
- Bloqueada por #<n>: <motivo>

## Referencia                   ← solo si hay imágenes
<las imágenes se incrustan aquí con uploadAttachment embedInDescription:true>
```

Secciones opcionales (usar solo cuando aportan):
- **Dónde:** URLs de las pantallas. Es ubicación, no "cómo".
- **Contexto:** 1-2 frases cuando el título se presta a malentendido (ej. "la lista de CONAREME no es la del sistema").
- **Antes de empezar:** requisito previo del programador (ej. "comparte tu Gmail para acceso al canal de YouTube").
- **Fuera de alcance:** una línea, solo si hay riesgo real de que la tarea crezca.

**No poner:** pistas técnicas con rutas/funciones, "Cómo probar" paso a paso, alcance largo.
Excepción: un requisito técnico que el líder pide explícitamente se pone como criterio
(ej. "la tabla tiene índices", "el SVG se guarda en S3 y se sanea").

## Flujo de trabajo con el líder (cómo crear tareas)

1. El líder pasa su lista tal cual (títulos sueltos, a veces con link o captura).
2. **Una por una, de arriba a abajo.** Nunca crear varias en lote sin que lo pida.
3. Por cada tarea: mostrar el borrador en un bloque Markdown + **máximo 2-3 preguntas cortas**
   sobre lo que no se puede deducir (dónde va, qué significa un término). No crear hasta tener
   su "dale" o sus correcciones.
4. Si el líder hace una pregunta de criterio ("¿lo ves necesario?", "¿llenaría la BD?"),
   responder con opinión y recomendación concreta antes de redactar; no crear todavía.
5. Al crear: si mandó capturas, subirlas con `uploadAttachment` (`embedInDescription:true`)
   bajo `## Referencia`. El `itemId` es el id interno: `node scripts/taiga-ref-to-id.mjs <slug> <ref>`.
6. Responder con el link `https://taiga.nuiti.org/project/<slug>/us/<ref>` y pasar al borrador
   de la siguiente.
7. Asignar solo si el líder lo dice; si no, queda sin asignar.

## Metadatos en Taiga (fuera de la descripción)

- **Título:** verbo en imperativo ("Corregir…", "Añadir…", "Habilitar…").
- **Tags:** al menos una categoría (`bug`, `feature`, `mejora`, `deuda-técnica`, `docs`).
- **Estado:** New → In progress → Ready for test → Done (sin saltos).
- **Asignado:** el que indique el líder (puede quedar sin asignar hasta decidir).
- **Prioridad / puntos:** no se setean desde el MCP; a confirmación del equipo.

## Reglas de calidad

1. "Listo cuando" **verificable** o no vale. 2-4 criterios; si salen más, la tarea es grande.
2. **No dividir sin pedirlo:** un ítem de la lista = una user story, aunque tenga subítems
   (van como criterios). Dividir solo si el líder lo pide.
3. **No inventar:** lo que no se sabe y el líder no aclaró se marca `<PENDIENTE: ...>`.
4. Nunca datos reales de pacientes en capturas ni ejemplos (Ley 29733).

## Formato extendido (excepción)

Cuando el líder trae él mismo mucho detalle (ej. entregables de infraestructura con
backup/rollback/logs, como la migración Galenos → WebGalén en HRL), se puede usar la
plantilla larga: Objetivo, Alcance (Incluye / Fuera de alcance), Criterios de aceptación,
Pistas técnicas, Cómo probar, Dependencias. Aun así, preferir lo más breve posible.

## Tareas dependientes (cuando una depende de otra)

El fork del MCP de Taiga **no linkea dependencias de forma nativa**, así que la relación
se marca por convención:

- **Título con marca de dependencia:** `… (requiere #<n>)`, donde `#<n>` es el número real de la US base.
- **Sección "Dependencias / bloqueos"** en la descripción: `Bloqueada por #<n>: <motivo>`.
- **Crear primero la base** para obtener su número, y recién entonces la dependiente.
- Para una serie larga pedida explícitamente: tag compartido (ej. `soft-delete`) y títulos
  `Serie (A) — …`, `Serie (B · requiere #<n>) — …`.
