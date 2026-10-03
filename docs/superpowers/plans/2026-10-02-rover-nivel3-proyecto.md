# Rover · Nivel 3 «Proyecto» — plan de implementación

> ✅ **Completado el 2026-10-03.** Publicado (Rover `cfea585`, revisión final incluida), ADR-120 en la raíz (`5903425`, nota `db1e98b`). Las decisiones de ejecución y los menores diferidos están en el ADR-120.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** publicar el curso S2 `mi-proyecto-de-servicio` (Ruta 1, Nivel 3) con el componente `plan-builder`, con el que el Rover arma su plan de proyecto lección por lección y lo descarga en PDF, y cerrar la Ruta 1 con el ADR-120.

**Architecture:** `plan-builder` es un tipo de sección solo de Rover, con el mismo reparto que el `kit-builder`: un módulo nuevo `05-Generador-Cursos/plan-builder.js` valida (a nivel de **curso**, porque el plan cruza módulos) y dibuja el HTML; el comportamiento (guardar, filas, resumen, PDF) vive en un bloque nuevo de `templates/engine.js`. El plan se guarda en `localStorage['rover:plan_<courseId>']` y nunca va al backend.

**Tech Stack:** Node (build), JS de navegador sin dependencias + jsPDF ya cargado por el motor, Playwright (suite `PRUEBAS-E2E`), Python (scripts de la raíz).

**Spec:** `docs/superpowers/specs/2026-10-02-rover-nivel3-proyecto-design.md`

## Global Constraints

- Solo Rover: no se toca `_MOTOR/`. Un tipo de sección sin `case` rompe el build; esquema y build deben coincidir (`python verificar-motor.py` desde la raíz).
- Clave: `rover:plan_<courseId>`. **Nada del plan va al backend** (ADR-087); el bloque del motor no llama a `sendToGoogleSheets`.
- Ids de campo: únicos en el curso y `^[a-z0-9-]+$`. `kind` ∈ {`short`, `long`, `date`, `choice`, `rows`}; `rows` con `columns` y `max` ≤ 8; `choice` con `options`.
- Exactamente una sección con `"summary": true`, después de todas las de campos; una sección de campos por módulo como máximo (la `summary` puede compartir módulo, después).
- Labels de la `summary`: `title`, `intro`, `missingTitle`, `download`, `pdfTitle`, `agreementTitle`, `agreementRoles` (arreglo).
- Contenido del curso: el Rover **no cuenta como adulto** (tampoco en la custodia); no se le nombra cargo («sinodal», «ayudante», «dirigente»); verbos *servir* y *apoyar* («acompañar» es del dirigente); nunca «18–22»; reflexiones sin nombres, confidencias ni casos reales identificables; el certificado dice que se **diseñó** el plan, no que se ejecutó; reglas sin fuente literal → «recomendación de este curso», sin tapar una norma.
- Fuentes con página del PDF; la ficha OMMS *Project cycle* solo como lectura opcional.
- Suites de a una con aviso a las otras sesiones; raíz con turno (pull, commit con pathspec, push, aviso). `generar-estado.py` puede contar cursos locales de otras líneas: dejar esas líneas como en lo commiteado.

## Review Focus

1. **Texto del Rover con comillas, `<` o `&`** en cualquier campo → en el resumen se ve tal cual (nunca se interpreta como HTML) y en el PDF también. Prueba en Task 2.
2. **Fila de `rows` agregada y dejada en blanco** → no cuenta como dato: un campo `rows` obligatorio con solo filas vacías aparece en «lo que falta». Prueba en Task 2.
3. **Un campo que el curso ya no tiene, o un valor de tipo equivocado, en el guardado** (curso editado después de que el Rover empezó) → se ignora sin romper el resumen ni el guardado. Prueba en Task 2.
4. **«Editar» desde el resumen** → lleva al módulo de esa fase (no a otro, no a la bienvenida) y el campo conserva lo escrito. Prueba en Task 2.
5. **Texto muy largo y caracteres fuera de Latin-1 (emoji) en el PDF** → el PDF se genera, el texto pagina dentro del A4 y los caracteres no imprimibles se omiten sin romper. Prueba en Task 2.

---

### Task 1: `plan-builder` en el build

**Files:**
- Create: `05-Generador-Cursos/plan-builder.js`
- Modify: `05-Generador-Cursos/build-course.js` (require junto a `KIT`; `validate()` ~l.138-160; `switch` de render ~l.265)
- Modify: `05-Generador-Cursos/course-schema.json` (enum de tipos de sección)
- Test: `PRUEBAS-E2E/tests/codigo.spec.js` (bloque nuevo `// --- ADR-120: plan-builder (Nivel 3) ---`, con `require` perezoso como el del kit)

**Interfaces:**
- Produces (`plan-builder.js`, CommonJS):
  - `validatePlan(course) -> string[]` — errores de todo el curso (recorre `course.modules[].sections[]` con `type === 'plan-builder'`); `[]` si es válido o si el curso no tiene ninguna.
  - `planIndex(course) -> Array<{moduleId:number, title:string, fields:Field[]}>` — las secciones de campos en orden, para que la `summary` sepa qué mostrar y adónde «editar».
  - `renderPlanSection(section, moduleId, index) -> string` — HTML de una sección de campos o de la `summary` (`index` = resultado de `planIndex`).
  - `esc(t) -> string`, `KINDS = ['short','long','date','choice','rows']`, `MAX_ROWS = 8`.
- HTML que consume el motor (Task 2):
  - Sección de campos: `<div class="plan-builder" data-plan-section data-module="<id>">`; cada campo envuelto en `data-plan-field="<id>" data-kind="<kind>" data-required="true|false"` con su `<label for>`; `short`→`input[type=text]`, `long`→`textarea`, `date`→`input[type=date]`, `choice`→`select` con una opción vacía primero; `rows`→`<div data-plan-rows="<id>" data-max="<n>">` con una plantilla `<template data-plan-row-template>` (un input por columna con `data-col="<colId>"`), botón `[data-plan-add-row]` y en cada fila `[data-plan-remove-row]`.
  - `summary`: `<div class="plan-builder plan-summary" data-plan-summary data-pdf-title data-agreement-title data-agreement-roles='<json>'>` con un bloque por fase `[data-plan-phase="<moduleId>"]` (título, `[data-plan-value="<fieldId>"]` vacíos que llena el motor, botón `[data-plan-goto="<moduleId>"]`), `[data-plan-missing]` con `aria-live="polite"`, y `button[data-plan-download]`.
  - Todo texto del JSON en atributos pasa por `esc`.

- [x] **Step 1: Write the failing tests** en `codigo.spec.js`, con un `planBueno()` que arma un curso mínimo de 3 módulos (campos en el 2 y el 3, `summary` en el 3):
  - `validatePlan acepta un plan completo (ADR-120)` → `toEqual([])`.
  - `validatePlan rechaza lo que el contrato prohíbe`: id repetido entre módulos; id `"Mal Id"`; `kind: 'numero'`; `rows` sin `columns`; `rows` con `max: 9`; `choice` sin `options`; cero `summary`; dos `summary`; `summary` en el módulo 2 con campos en el 3; dos secciones de campos en un mismo módulo; `summary` sin `labels.agreementRoles` — cada caso `.length > 0`.
  - `validatePlan acepta campos y summary en el mismo módulo (summary después)` → `[]`.
  - `renderPlanSection escapa y deja los ganchos`: con `label: 'Qué "pasa" <ya>'` el HTML no contiene `<ya>` y sí `data-plan-field="necesidad"`, `data-plan-rows`, `data-max="8"`; la `summary` contiene `data-plan-goto="2"` y `data-plan-download`.
  - `esquema y build conocen plan-builder`: `course-schema.json` incluye `"plan-builder"` en el enum y `build-course.js` tiene `case 'plan-builder'`.
- [x] **Step 2: Run** `npx playwright test tests/codigo.spec.js -g "plan" --project=desktop-chromium` desde `PRUEBAS-E2E`. Expected: FAIL (no existe `plan-builder.js`).
- [x] **Step 3: Implement** `plan-builder.js` con las firmas de arriba; en `build-course.js`: `const PLAN = require('./plan-builder');`, en `validate()` añadir `PLAN.validatePlan(course)` (una vez, no por sección), calcular `const PLAN_INDEX = PLAN.planIndex(course)` antes de dibujar y `case 'plan-builder': return PLAN.renderPlanSection(section, mod.id, PLAN_INDEX);` (pasar el id del módulo que se está dibujando); enum del esquema.
- [x] **Step 4: Run** el mismo comando. Expected: PASS. Y desde la raíz `python verificar-motor.py` → «12 tipos; esquema y build coinciden». Y recompilar un curso existente (`node build-course.js herramientas-tropa`) sin errores.
- [x] **Step 5: Commit** `plan-builder: validación y dibujo en el build de Rover (ADR-120)`.

### Task 2: `plan-builder` en el motor

**Files:**
- Modify: `05-Generador-Cursos/templates/engine.js` (llamar `initPlanBuilder()` junto a `initKitBuilder()` ~l.23; `restartCourse()` ~l.691; bloque nuevo al final `// --- Plan del Nivel 3 (ADR-120) ---`)
- Modify: `05-Generador-Cursos/templates/styles.css` (`.plan-*`, incluido tema oscuro y `:disabled`)
- Create: `PRUEBAS-E2E/fixtures/plan-prueba.json` (3 módulos: bienvenida; módulo 2 con `short`, `long` obligatorio y `rows` obligatorio de 2 columnas y `max: 3`; módulo 3 con `date` obligatorio, `choice` y la `summary`)
- Create: `PRUEBAS-E2E/tests/plan-builder.spec.js` (compila la fixture con `--json/--salida` en `beforeAll`, como `kit-builder.spec.js`; siembra `courseProgress_plan-prueba` con `userProfile` para entrar)
- Modify: `PRUEBAS-E2E/.gitignore` (ya ignora `fixtures/*.html`; verificar)

**Interfaces:**
- Consumes: el HTML de Task 1.
- Produces (globales del motor): `initPlanBuilder()`, `loadPlan() -> {[fieldId]: string|Array<{[colId]:string}>}` (normalizado), `savePlan()`, `renderPlanSummary()`, `planMissing() -> Array<{fieldId, label, moduleId}>`, `downloadPlanPDF()`, `_planKey()`. Búsqueda de elementos por atributo con un helper equivalente a `_kitFind` (sin armar selectores con datos).

- [x] **Step 1: Write the failing tests** en `plan-builder.spec.js` (`@solo-escritorio`):
  - `lo escrito en una lección aparece en el resumen` — llenar `necesidad` en el módulo 2, ir al 3: `[data-plan-value="necesidad"]` tiene ese texto.
  - `sobrevive a una recarga` — campos `short`, `long`, `date`, `choice` y dos filas de `rows` restaurados.
  - `el texto se muestra tal cual` — escribir `<b>x</b> & "y"`: el resumen contiene ese texto literal y `[data-plan-value] b` tiene count 0.
  - `un guardado corrupto no rompe el plan` — sembrar `rover:plan_plan-prueba` = `{"necesidad":5,"ya-no-existe":"x","actividades":"no-es-lista"}`; el resumen carga, escribir en `necesidad` y verificar que se guardó como texto.
  - `rows respeta su tope` — agregar 3 filas: `[data-plan-add-row]` queda `disabled`; sembrar 5 filas guardadas → se restauran 3.
  - `una fila en blanco no cuenta` — con solo una fila vacía en `actividades`, `[data-plan-missing]` nombra ese campo y su lección.
  - `descargar se bloquea si falta un obligatorio` — sin `fecha`, clic en descargar: no se llama `pdf.save` (espiar como en `kit-builder.spec`) y la notificación nombra el campo.
  - `descargar produce el PDF con el recuadro de acuerdo` — todo lleno: espiar `jsPDF.text`; aparecen `agreementTitle` y los tres roles; con un emoji y un texto de 3000 caracteres en `long` el `save` se llama sin excepción.
  - `editar lleva a la lección de la fase` — clic en `[data-plan-goto="2"]`: `#module-2` activo y el campo conserva su valor.
  - `ninguna petición al backend` y `el bloque del plan no llama a sendToGoogleSheets (estática)`.
  - `reiniciar el curso borra el plan` — como la prueba del kit (esperar el `load`).
- [x] **Step 2: Run** `npx playwright test tests/plan-builder.spec.js --project=desktop-chromium`. Expected: FAIL (no existe `initPlanBuilder`).
- [x] **Step 3: Implement** el bloque del motor y los estilos. Valores fijados: normalización de `loadPlan` (JSON ilegible → `removeItem`; solo ids presentes en el DOM; `rows` → arreglo de objetos con solo `columns` conocidas, recortado a `data-max`; el resto, `String` solo si el tipo guardado es texto, si no se ignora); `rows` vacía = todas sus celdas en blanco tras `trim`; resumen con `textContent`; aviso de faltantes `«Te falta: <label> (lección «<título>»)»`; PDF A4 con `splitTextToSize`, salto con `y > 280`, título de fase con 12 mm libres o página nueva, saneo `replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '')`, recuadro final con `agreementTitle` y una línea por rol con «Fecha: ____  Firma: ____», nombre de archivo `Plan-<courseId>.pdf`; `restartCourse` añade `localStorage.removeItem('rover:plan_' + COURSE_CONFIG.courseId)`. «Editar» llama `showModule(<id del módulo>)` (comprobar en el motor que ese es el índice que espera).
- [x] **Step 4: Run** el mismo comando → PASS; luego `kit-builder.spec.js` y `codigo.spec.js` → PASS (no se rompió el kit).
- [x] **Step 5: Commit** `plan-builder en el motor: guardar en el navegador, resumen y PDF con el acuerdo (ADR-120)`.

### Task 3: El curso S2 — diseño y JSON

**Files:**
- Create: `01-Diseno-Cursos/S2-Mi-Proyecto-de-Servicio.md` (molde: `H-Comunidad-Herramientas.md`: ficha, gancho, objetivos, decisiones de diseño, lecciones con fuentes y quiz, logros)
- Create: `05-Generador-Cursos/borradores/mi-proyecto-de-servicio.json`
- Modified by build: `02-Plataforma-Web/mi-proyecto-de-servicio.html`, `02-Plataforma-Web/cursos.json`

**Interfaces:**
- Consumes: `plan-builder` (Tasks 1-2).
- Produces: el curso con `route: "grupo"`, `level: 3`, `branch: null`, `registration.motivationLabel`, `certificate.courseName: "MI PROYECTO DE SERVICIO"`, `certificate.commitmentPrompt: "Voy a acordar mi proyecto con ___ antes del ___, y lo voy a evaluar con ___"`. Campos del plan (ids): `rama` (choice: Familia, Manada, Tropa, Comunidad), `tipo` (short) en la bienvenida; `necesidad` (long), `con-quien` (short), `que-dijeron` (long) en L2; `objetivo` (long), `actividades` (rows: qué, cuándo, con quién), `recursos` (long) en L3; `riesgos` (rows: qué puede pasar, qué haré), `acuerdo-con` (short), `fecha-acuerdo` (date) en L4; `como-sabre` (long), `fecha-evaluacion` (date), `evalua-con` (short) y la `summary` en L5. `agreementRoles`: `["Jefe de Grupo", "Jefe de la rama", "Dirigente del Clan"]`.

- [x] **Step 1: Leer las fuentes** con página del PDF antes de escribir cada lección: *Guía de Dirigente de Clan* 2026 §4.3, §4.4, §8.7–8.9, cap. 11 (texto en el scratchpad `clan26.txt`); *Modelo de Aplicación* 2026, proyectos y proporción (pp. 19 y 22); Política ASP pp. 21, 26, 44; los JSON de `servicio-rover` (servicio como proyecto, «con» y no «para») y `servir-en-el-grupo` (las cinco preguntas del acuerdo) para no repetir sus casos.
- [x] **Step 2: Escribir el diseño `.md`** con fuentes por afirmación, y el JSON según la tabla de lecciones de la spec §2: idea central por lección, quizzes de escenario (2-3 por lección; distractores que sean errores reales; correctas que a veces **actúan o hablan**, no solo «preguntar» o «pasárselo al dirigente»), reflexiones que no piden nada identificable del proyecto real, compromiso y logros.
- [x] **Step 3: Build** `node build-course.js mi-proyecto-de-servicio` → sin avisos de compuertas.
- [x] **Step 4: Medir la fuga** con el `ciega.py` del scratchpad, con la lista de vocabulario ampliada (`dirigente`, `Jefe de Grupo`, `Clan`, `pregunt`, `acord`, `sin `, `tú`, `ya `, `solo`, `ellos`, `después`, `de inmediato`), más la más larga, la más corta por quiz y la tesis del curso. Expected: ningún marcador solo en la correcta; correcta más larga en ≤ 4 de N y nunca 0; ningún quiz aprobado eligiendo siempre la más corta.
- [x] **Step 5: Commit** (sin push) `mi-proyecto-de-servicio: diseño y JSON (ADR-120)`. El curso no se publica hasta Task 5: si hay que pushear antes, sacar su entrada de `cursos.json`.

### Task 4: Auditorías y re-auditorías

**Files:** Modify: el diseño `.md` y el JSON del curso.

- [x] **Step 1:** lanzar en paralelo `auditor-doctrinal-asc` y `auditor-pedagogico-asc`, con las **instrucciones de Rover** en el prompt (público de 18 a 20 sin cargo, no cuenta como adulto, defecto frente a brecha, reflexiones sin datos identificables) y los cursos hermanos para detectar plantilla hermana (`servicio-rover`, `servir-en-el-grupo`, los cuatro `herramientas-*`).
- [x] **Step 2:** aplicar los hallazgos con scripts de Python escritos con la herramienta Write (no heredocs de bash con barras); recompilar; volver a medir la fuga (Task 3 Step 4).
- [x] **Step 3:** re-auditoría de lo corregido (las dos), aplicar, recompilar, medir. Sincronizar el diseño `.md`.
- [x] **Step 4: Commit** `mi-proyecto-de-servicio: auditorías y re-auditorías aplicadas (ADR-120)`.

### Task 5: Publicar y cerrar la Ruta 1

**Files:**
- Modify (raíz): `TRAZABILIDAD.csv`, `ESTADO-AUDITORIA.md`, `DECISIONES.md` (ADR-120 encima del 119, pie de versión), `docs/BITACORA.md`, `ESTADO.md` (generado), `GLOSARIO-ASC.md` solo si aparece un término nuevo (pedir la versión libre).
- Modify (Rover): `05-Generador-Cursos/SKILL.md` (12 tipos, `plan-builder`), `CLAUDE.md` (§5 estado y autonomía), `PRUEBAS-E2E/README.md` (fila `plan-builder`), spec y plan marcados completos.
- Modify (memoria): `linea-rover.md`, `autonomia-cursos-rover.md`, `MEMORY.md`.

- [x] **Step 1:** pedir la suite a las otras sesiones; `ASC_BASE_URL="http://localhost:8132/02-Plataforma-Web/" npx playwright test` con el servidor `rover` levantado (`preview_start rover`). Expected: todo en verde, total = 192 + las pruebas nuevas.
- [x] **Step 2:** commit del catálogo, `git push`; esperar Pages (`gh api repos/maximoaluna-blip/INDUCCION-ROVER/pages/builds/latest`); `curl` del curso → 200; `npx playwright test` contra producción → mismo total. Soltar la suite.
- [x] **Step 3:** turno de raíz: filas de trazabilidad, `ESTADO-AUDITORIA`, ADR-120, bitácora, `python generar-estado.py` (restaurar las líneas de otras líneas que solo estén en local), `python verificar-consistencia.py` (sin errores de Rover), `python verificar-corpus.py`; commit con pathspec y push; soltar la raíz.
- [x] **Step 4:** docs de Rover y memoria; commit y push.

### Task 6: Revisión final

- [x] **Step 1:** revisor nuevo en el modelo más capaz sobre el código de `plan-builder` (`git diff <base>..HEAD` de `plan-builder.js`, `build-course.js`, `engine.js`, `styles.css`, `course-schema.json`, `PRUEBAS-E2E`), con la Review Focus de este plan.
- [x] **Step 2:** los hallazgos críticos e importantes (regraduados por efecto) se arreglan con una prueba que falle primero, suite verde, push y suite en producción; los menores se reportan al dueño.
