---
name: generate-course
description: Diseña un curso de la plataforma de servicio Rover (Regional Valle del Cauca) a partir de las fuentes oficiales y lo traduce a un JSON borrador revisable. Público: Rovers de 18 a 20 años que quieren servir.
---

# Generador de Cursos — Plataforma de servicio Rover

> Fuente única de esta guía. `.claude/commands/generate-course.md` solo apunta aquí: si cambia algo, se cambia aquí.
> Reglas de contenido y trampas del repo: `CLAUDE.md` de Rover. Por qué la plataforma es así: ADR-086 y ADR-091/094–096 en `DECISIONES.md` de la raíz.

## Tu rol

Diseñas cursos para **Rovers de 18 a 20 años** que van a **servir**: en otra rama de su Grupo (Ruta 1, «Servir en el Grupo») o en la comunidad (Ruta 2, Mundo Mejor). El Rover **no es dirigente, no es «sinodal» ni «ayudante», y no cuenta como adulto** en la proporción de la unidad (*Modelo de Aplicación* p. 19 y 22). Los verbos para él son **servir** y **apoyar**; «acompañar» es del dirigente.

## Flujo

1. **Plan primero.** El curso tiene que estar en el plan (`docs/superpowers/plans/`) y en la spec (`docs/superpowers/specs/`). Sin nivel acordado no se diseña un curso suelto.
2. **Fuentes.** Las oficiales están en `DOCUMENTOS BASE/` de la raíz (Guías de Dirigente por rama 2026, *Modelo de Aplicación*, *Política A Salvo del Peligro* dic-2025). En las Guías de rama se citan **las páginas del PDF**, no las del índice impreso.
3. **Diseño** en `01-Diseno-Cursos/<Id>-<Titulo>.md`: ficha, gancho, objetivos, decisiones de diseño y, por lección, fuentes con página, reflexión y casos del quiz. Mira los de Familia, Manada, Tropa y Comunidad como molde.
4. **JSON** en `05-Generador-Cursos/borradores/<courseId>.json`, traducción del diseño.
5. **Build:** `node 05-Generador-Cursos/build-course.js <courseId>` y **leer los avisos** de las compuertas de quiz.
6. Auditoría doctrinal y pedagógica (con las instrucciones de Rover), correcciones y **re-auditoría de lo corregido**: la segunda vuelta suele cazar defectos traídos al corregir.

## Criterios pedagógicos

- **Lecciones de 5 a 7 minutos**, ~35 min por curso. Una idea central por lección, con **anclaje** en la experiencia del Rover (su Clan, su paso por la rama).
- **Quizzes de escenario**, no de memoria. Los distractores son **errores reales**, mejor si son reglas verdaderas en otro contexto (lo de R1 que en esa rama no alcanza). Que no gane la opción «prudente», la más larga, la única que empieza distinto ni **la única que nombra al dirigente** (fuga de conjunto).
- **La última lección evalúa lo que enseña** (gestión del riesgo, proyectos), no repite casos de *Servir en el Grupo* (proporción, chat privado, «va el Rover»).
- **Reflexiones:** van a la hoja del backend. **Nunca piden nombres de personas ni algo contado en confianza**; fuerzan un caso concreto («escribe, tal cual…»).
- **Compromiso con fórmula:** «En la ___ voy a ___, y nunca voy a ___», para las primeras cuatro reuniones.
- **Reglas del curso ≠ normas de la Asociación.** Lo que no tiene fuente literal se declara «recomendación de este curso»; si es una regla protectora sin fuente, **se consulta al dueño**. Y la etiqueta no puede cubrir una obligación que sí es norma (no guardar secretos, Política p. 21).
- No enseñar técnica scout sin fuente.

## Estructura del JSON

```json
{
  "courseId": "kebab-case-id",
  "title": "Título",
  "subtitle": "Ruta Servir en el Grupo · Nivel 1 · Manada",
  "description": "Para el catálogo, 2-3 oraciones",
  "contentVersion": "AAAA-MM-DD",
  "route": "tronco | grupo | comunidad",
  "level": 1,
  "branch": "familia | manada | tropa | comunidad | null",
  "registration": { "motivationLabel": "¿Por qué quieres servir en…?" },
  "icon": "emoji",
  "duration": "35 minutos",
  "totalContentModules": 5,
  "modules": [
    { "id": 1, "title": "Bienvenido/a", "emoji": "🏠", "navLabel": "Inicio", "isIntro": true, "sections": [] },
    { "id": 2, "title": "…", "emoji": "…", "navLabel": "…", "sections": [],
      "reflection": { "prompt": "…" },
      "quiz": { "title": "Evaluación - …", "questions": [ { "text": "…", "options": ["…", "…", "…"], "correctIndex": 0 } ], "nextLabel": "Continuar ➡️" } }
  ],
  "achievements": [ { "id": "achievement-1", "name": "…", "emoji": "…", "unlockOnModule": 2 } ],
  "certificate": { "courseName": "MAYÚSCULAS", "description": "…", "commitmentPrompt": "…" }
}
```

- `route`, `level` y `branch` los **copia el build al catálogo**: sin ellos el curso sale de su ruta en la portada.
- El módulo 1 es la bienvenida (`isIntro: true`, sin quiz). El registro y el certificado los genera el build.
- `correctIndex` es base 0; el motor **baraja** las opciones. 2 o 3 preguntas por lección: con eso hay que acertarlas todas.

## Tipos de sección (los 10 que dibuja el build)

`paragraph`, `heading` (`level` 3 o 4), `info-box`, `mission-box`, `blockquote` (cita: `«…»<br><small>— Fuente, p. X</small>`), `list` (`items`, `ordered`), `timeline`, `method-grid`, `course-objectives` (`items`) y `video`. Un tipo sin dibujante **rompe el build**; no inventes otros.
