# Rover · Nivel 2 «Herramientas» — plan de implementación

> ✅ **Completado el 2026-09-28.** Los cuatro cursos publicados (Rover `f29b2a5`), ADR-106 cerrado en la raíz (`5a48c16`). Desviaciones y hallazgos: ver el ADR-106.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publicar los cuatro cursos «Herramientas» de la Ruta 1 (Familia, Manada, Tropa, Comunidad), cada uno con un kit propio que el Rover arma y descarga, y cerrar el Nivel 2 con el ADR-106.

**Architecture:** un tipo de sección nuevo, `kit-builder`. Su validación y su HTML viven en un módulo nuevo, `05-Generador-Cursos/kit-builder.js`, que `build-course.js` usa. Su comportamiento (elegir, guardar y descargar el PDF con jsPDF) vive en `templates/engine.js`. El kit **solo se guarda en `localStorage`**. Los cursos siguen el pipeline de la casa: diseño `.md` → JSON → build → auditorías → publicación.

**Tech Stack:** Node (build sin dependencias), JS del navegador (motor de Rover), jsPDF 2.5.1 por CDN (ya está cargado para el certificado), Playwright + axe (`PRUEBAS-E2E/`), Python y pypdf para leer las fuentes.

**Spec:** `docs/superpowers/specs/2026-09-28-rover-nivel2-herramientas-design.md` (y su madre `2026-09-27-rover-ruta-servicio-design.md`).

## Global Constraints

- Público: **Rovers de 18 a 20 años** que apoyan a los dirigentes de otra rama. El Rover no es dirigente, «sinodal» ni «ayudante», y **no cuenta como adulto** (*Modelo* p. 19 y 22). Sus verbos son servir y apoyar; «acompañar» es del dirigente.
- Cursos: `herramientas-familia`, `herramientas-manada`, `herramientas-tropa`, `herramientas-comunidad`. Cada uno con `route: "grupo"`, `level: 2`, `branch` de su rama, `contentVersion: "2026-09-28"` o la fecha del cambio, ~35 minutos, bienvenida + 5 lecciones de 6 a 7 minutos.
- Lecciones: 1 Juegos · 2 Aire libre y seguridad · 3 Escuchar y hablar · 4 Buen trato y cuidado · 5 Arma tu kit.
- Técnica scout: **solo lo que dice la guía de la rama**. Técnica fuerte solo en Tropa. En las demás ramas se dice abiertamente que la técnica se aprende en el Clan o en la formación oficial.
- Fuentes: páginas **del PDF**. Las guías Interamericanas y los toolkits OMMS van solo como lectura opcional señalada.
- Quizzes: de escenario; la correcta no es la más larga, ni la única que empieza distinto, ni la única que nombra al dirigente. El quiz de la lección 5 aplica las lecciones 1 a 4 **sin repetir casos del Nivel 1**.
- Reflexiones: sin nombres de personas ni confidencias. Compromiso con fórmula: «En la ___ voy a ___, y nunca voy a ___», para tus primeras cuatro reuniones.
- Lo que no tiene fuente literal es «recomendación de este curso». Esa etiqueta nunca cubre una obligación que sí es norma, como no guardar secretos (Política ASP p. 21).
- Kit: exactamente **3 juegos**; entre 3 y 4 frases; al menos 3 puntos de cuidado; al menos 5 juegos para elegir. Solo en `localStorage['rover:kit_<courseId>']`, **nunca** por `sendToGoogleSheets`. No bloquea el avance.
- No se toca `_MOTOR/`. El motor de Rover es `05-Generador-Cursos/templates/engine.js`. Tocarlo obliga a recompilar **todos** los cursos.
- Bash en esta máquina colapsa las barras invertidas en los heredocs: escribir JSON y JS con la herramienta Write o Edit.
- Suite: **en serie, con aviso a las otras sesiones**. Primero contra el build local (`ASC_BASE_URL=http://localhost:8132/02-Plataforma-Web/`, servidor `rover` de `.claude/launch.json`) y después contra producción.
- Raíz (repo DOCS-MAESTRAS-ASC): pedir turno, hacer pull, y commit **con pathspec** solo de los archivos propios. ADR reservado: **106**.

## Review Focus

1. **Recargar la página a mitad del kit** debe devolver los juegos marcados con su texto, las frases y el cuidado. Prueba: `kit-builder.spec` «persiste al recargar» (Tarea 2).
2. **Intentar marcar un cuarto juego** no debe poder hacerse; al desmarcar uno, los demás vuelven a habilitarse. Prueba: `kit-builder.spec` «tope de 3 y se libera al desmarcar» (Tarea 2).
3. **Un curso con `kit-builder` incompleto** (le falta un texto de `labels`, trae 4 juegos o repite un id) no debe compilar en silencio. Prueba: `codigo.spec` «validateKit rechaza…» (Tarea 1).
4. **Usar el kit no debe mandar nada a la hoja.** Prueba: `kit-builder.spec` «ninguna petición al backend» (Tarea 2).
5. **Un texto con comillas o `<`** en el JSON del kit no debe romper el HTML ni el atributo. Prueba: `codigo.spec` «renderKit escapa atributos» (Tarea 1).

---

### Task 1: Validación y dibujo del `kit-builder` en el build

**Files:**
- Create: `05-Generador-Cursos/kit-builder.js`
- Modify: `05-Generador-Cursos/build-course.js` (require del módulo, `validate()`, `renderSection()` con un `case 'kit-builder'`)
- Modify: `05-Generador-Cursos/course-schema.json` (el enum de `type` de las secciones, líneas ~124-135: agregar `"kit-builder"`)
- Test: `PRUEBAS-E2E/tests/codigo.spec.js`

**Interfaces:**
- Produces: `module.exports = { validateKit(section) -> string[], renderKit(section) -> string, esc(text) -> string }`.
- El HTML producido lleva estos ganchos, que la Tarea 2 consume:
  - raíz `[data-kit-builder]` con `data-max-games="3"` y `data-pdf-title`;
  - contador `[data-kit-count]` con `aria-live="polite"`;
  - casillas de juego `input[type=checkbox][data-kit-game="<id>"]`, cada una con su `textarea[data-kit-why="<id>"]` y el atributo `hidden`;
  - frases `textarea[data-kit-phrase="<id>"]`;
  - cuidado `input[type=checkbox][data-kit-care="<id>"]` y `textarea[data-kit-care-own]`;
  - botón `button[data-kit-download]`, con `onclick="downloadKitPDF()"`.

- [x] **Step 1: Escribir las pruebas que fallan** (al final del `describe` de `codigo.spec.js`)

```js
  // --- ADR-106: kit-builder (Nivel 2) -----------------------------------------
  const KIT = require(path.join(GEN, 'kit-builder.js'));
  const kitBueno = () => ({
    type: 'kit-builder',
    labels: { title: 'T', intro: 'I', gamesTitle: 'G', gamesHelp: 'GH', gameWhyPlaceholder: 'P',
      phrasesTitle: 'F', phrasePlaceholder: 'FP', careTitle: 'C', careOwnPlaceholder: 'CO',
      download: 'D', pdfTitle: 'PDF' },
    games: [1, 2, 3, 4, 5].map((n) => ({ id: 'g' + n, name: 'J' + n, detail: 'd', source: 'Guía, p. 1' })),
    phrases: [1, 2, 3].map((n) => ({ id: 'f' + n, situation: 'S' + n })),
    care: [1, 2, 3].map((n) => ({ id: 'c' + n, text: 'C' + n, source: 'Guía, p. 2' })),
  });

  test('validateKit acepta un kit completo (ADR-106)', () => {
    expect(KIT.validateKit(kitBueno())).toEqual([]);
  });

  test('validateKit rechaza labels incompletos, pocos juegos, frases fuera de rango e ids repetidos (ADR-106)', () => {
    const a = kitBueno(); delete a.labels.pdfTitle;
    const b = kitBueno(); b.games = b.games.slice(0, 4);
    const c = kitBueno(); c.phrases = c.phrases.slice(0, 2);
    const d = kitBueno(); d.care = d.care.slice(0, 2);
    const e = kitBueno(); e.games[1].id = 'g1';
    for (const k of [a, b, c, d, e]) expect(KIT.validateKit(k).length).toBeGreaterThan(0);
  });

  test('renderKit dibuja los ganchos del motor y escapa atributos (ADR-106)', () => {
    const k = kitBueno(); k.labels.pdfTitle = 'Mi "kit" <1>'; k.labels.gameWhyPlaceholder = 'a"b';
    const html = KIT.renderKit(k);
    expect(html).toContain('data-kit-builder');
    expect(html).toContain('data-max-games="3"');
    expect((html.match(/data-kit-game="/g) || []).length).toBe(5);
    expect((html.match(/data-kit-why="/g) || []).length).toBe(5);
    expect((html.match(/data-kit-phrase="/g) || []).length).toBe(3);
    expect((html.match(/data-kit-care="/g) || []).length).toBe(3);
    expect(html).toContain('data-kit-care-own');
    expect(html).toContain('data-kit-download');
    expect(html).toContain('data-pdf-title="Mi &quot;kit&quot; &lt;1&gt;"');
    expect(html).not.toContain('placeholder="a"b"');
  });

  test('el esquema y el build de Rover conocen kit-builder (ADR-106)', () => {
    expect(leer(path.join(GEN, 'course-schema.json'))).toContain('"kit-builder"');
    expect(leer(path.join(GEN, 'build-course.js'))).toMatch(/case 'kit-builder'/);
  });
```

- [x] **Step 2: Correr y ver que fallen**

Run: `cd PRUEBAS-E2E && npx playwright test tests/codigo.spec.js -g "kit" --project=desktop-chromium`
Expected: FAIL, porque no encuentra el módulo `kit-builder.js`.

- [x] **Step 3: Crear `05-Generador-Cursos/kit-builder.js`**

```js
// kit-builder (ADR-106): el kit propio del Nivel 2 de Rover. Aqui vive lo que el BUILD
// necesita -validar el JSON y dibujar el HTML-; el comportamiento (elegir, guardar,
// descargar) vive en templates/engine.js. El kit se guarda SOLO en localStorage: lo que
// el Rover escribe sobre su servicio no viaja a la hoja (ADR-087).
'use strict';

const LABELS = ['title', 'intro', 'gamesTitle', 'gamesHelp', 'gameWhyPlaceholder',
  'phrasesTitle', 'phrasePlaceholder', 'careTitle', 'careOwnPlaceholder', 'download', 'pdfTitle'];
const MAX_GAMES = 3;

function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function validateKit(s) {
  const e = [];
  const L = s.labels || {};
  LABELS.forEach((k) => { if (!L[k]) e.push('kit-builder: falta labels.' + k); });
  const games = s.games || [], phrases = s.phrases || [], care = s.care || [];
  if (games.length < 5) e.push('kit-builder: se necesitan al menos 5 games (hay ' + games.length + ')');
  if (phrases.length < 3 || phrases.length > 4) e.push('kit-builder: phrases debe tener 3 o 4 (hay ' + phrases.length + ')');
  if (care.length < 3) e.push('kit-builder: se necesitan al menos 3 care (hay ' + care.length + ')');
  const ids = [...games, ...phrases, ...care].map((x) => x && x.id);
  ids.forEach((id, i) => {
    if (!id) e.push('kit-builder: elemento sin id');
    else if (ids.indexOf(id) !== i) e.push('kit-builder: id repetido "' + id + '"');
  });
  games.forEach((g) => { if (!g.name || !g.source) e.push('kit-builder: juego "' + g.id + '" sin name o source'); });
  phrases.forEach((f) => { if (!f.situation) e.push('kit-builder: frase "' + f.id + '" sin situation'); });
  care.forEach((c) => { if (!c.text) e.push('kit-builder: cuidado "' + c.id + '" sin text'); });
  return e;
}

function renderKit(s) {
  const L = s.labels;
  const games = s.games.map((g) => `
                    <div class="kit-game">
                        <input type="checkbox" id="kit-game-${esc(g.id)}" data-kit-game="${esc(g.id)}">
                        <label for="kit-game-${esc(g.id)}"><strong>${g.name}</strong>${g.detail ? ' — ' + g.detail : ''} <small class="kit-source">${g.source}</small></label>
                        <textarea id="kit-why-${esc(g.id)}" data-kit-why="${esc(g.id)}" rows="2" hidden aria-label="${esc(L.gameWhyPlaceholder)}" placeholder="${esc(L.gameWhyPlaceholder)}"></textarea>
                    </div>`).join('');
  const phrases = s.phrases.map((f) => `
                    <div class="kit-phrase">
                        <label for="kit-phrase-${esc(f.id)}">${f.situation}</label>
                        <textarea id="kit-phrase-${esc(f.id)}" data-kit-phrase="${esc(f.id)}" rows="2" placeholder="${esc(L.phrasePlaceholder)}"></textarea>
                    </div>`).join('');
  const care = s.care.map((c) => `
                    <div class="kit-care-item">
                        <input type="checkbox" id="kit-care-${esc(c.id)}" data-kit-care="${esc(c.id)}">
                        <label for="kit-care-${esc(c.id)}">${c.text}${c.source ? ' <small class="kit-source">' + c.source + '</small>' : ''}</label>
                    </div>`).join('');
  return `<div class="kit-builder" data-kit-builder data-max-games="${MAX_GAMES}" data-pdf-title="${esc(L.pdfTitle)}">
                <h3>${L.title}</h3>
                <p>${L.intro}</p>
                <fieldset class="kit-games">
                    <legend>${L.gamesTitle}</legend>
                    <p>${L.gamesHelp}</p>
                    <p class="kit-count" data-kit-count aria-live="polite"></p>${games}
                </fieldset>
                <fieldset class="kit-phrases">
                    <legend>${L.phrasesTitle}</legend>${phrases}
                </fieldset>
                <fieldset class="kit-care">
                    <legend>${L.careTitle}</legend>${care}
                    <label for="kit-care-own" class="kit-care-own-label">${esc(L.careOwnPlaceholder)}</label>
                    <textarea id="kit-care-own" data-kit-care-own rows="2" placeholder="${esc(L.careOwnPlaceholder)}"></textarea>
                </fieldset>
                <button type="button" class="btn" data-kit-download onclick="downloadKitPDF()">${L.download}</button>
            </div>`;
}

module.exports = { validateKit, renderKit, esc, MAX_GAMES };
```

- [x] **Step 4: Conectar el módulo en `build-course.js`**

Después de `const path = require('path');`:

```js
const KIT = require('./kit-builder');
```

Dentro de `validate(course)`, en el `course.modules.forEach`, después de las comprobaciones del quiz:

```js
        (mod.sections || []).forEach((s) => {
            if (s.type === 'kit-builder') KIT.validateKit(s).forEach((m) => errors.push(`Modulo ${mod.id}: ${m}`));
        });
```

En `renderSection`, antes de `default:`:

```js
        case 'kit-builder':
            return KIT.renderKit(section);
```

En `course-schema.json`, agregar `"kit-builder"` al `enum` del `type` de las secciones, justo después de `"video"`.

- [x] **Step 5: Correr y ver que pasen**

Run: `cd PRUEBAS-E2E && npx playwright test tests/codigo.spec.js --project=desktop-chromium`
Expected: PASS, con las 4 pruebas nuevas y todas las de antes.

Run desde la raíz del proyecto: `python verificar-motor.py`
Expected: sin desajustes entre el esquema y el build de Rover.

- [x] **Step 6: Commit**

```bash
git add 05-Generador-Cursos/kit-builder.js 05-Generador-Cursos/build-course.js 05-Generador-Cursos/course-schema.json PRUEBAS-E2E/tests/codigo.spec.js
git commit -m "kit-builder: validación y dibujo en el build de Rover (ADR-106)"
```

---

### Task 2: El kit en el motor (elegir, guardar y descargar), con curso de prueba

**Files:**
- Modify: `05-Generador-Cursos/build-course.js` (modo `--json <entrada> --salida <html>`, que no toca el catálogo)
- Modify: `05-Generador-Cursos/templates/engine.js` (funciones del kit + `initKitBuilder()` en el `DOMContentLoaded`)
- Modify: `05-Generador-Cursos/templates/styles.css` (estilos `.kit-*`)
- Create: `PRUEBAS-E2E/fixtures/kit-prueba.json`
- Create: `PRUEBAS-E2E/tests/kit-builder.spec.js`
- Modify: `PRUEBAS-E2E/.gitignore` (o crearlo) con `fixtures/*.html`

**Interfaces:**
- Consumes: los ganchos `data-kit-*` de la Tarea 1.
- Produces:
  - en el motor: `initKitBuilder()`, `saveKit()`, `loadKit() -> {games:{id:str}, phrases:{id:str}, care:[id], careOwn:str} | null`, `downloadKitPDF()`, y la clave `'rover:kit_' + COURSE_CONFIG.courseId`;
  - en el build: `node build-course.js --json <ruta.json> --salida <ruta.html>`.

- [x] **Step 1: Curso de prueba `PRUEBAS-E2E/fixtures/kit-prueba.json`** (se escribe con la herramienta Write)

```json
{
  "courseId": "kit-prueba",
  "title": "Kit de prueba",
  "description": "Curso mínimo para probar el kit-builder.",
  "icon": "🧪",
  "duration": "5 minutos",
  "totalContentModules": 1,
  "modules": [
    { "id": 1, "title": "Inicio", "emoji": "🏠", "navLabel": "Inicio", "isIntro": true,
      "sections": [ { "type": "paragraph", "text": "Prueba." } ] },
    { "id": 2, "title": "Arma tu kit", "emoji": "🧰", "navLabel": "Kit",
      "sections": [ {
        "type": "kit-builder",
        "labels": { "title": "Tu kit", "intro": "Elige y escribe.", "gamesTitle": "Mis 3 juegos",
          "gamesHelp": "Marca exactamente tres.", "gameWhyPlaceholder": "¿Por qué y cómo lo adaptarías?",
          "phrasesTitle": "Mis frases", "phrasePlaceholder": "Lo que diría, tal cual",
          "careTitle": "Mi lista de cuidado", "careOwnPlaceholder": "Agrega un punto propio",
          "download": "Descargar mi kit", "pdfTitle": "Mi kit de prueba" },
        "games": [
          { "id": "g1", "name": "Juego 1", "detail": "d", "source": "Guía, p. 1" },
          { "id": "g2", "name": "Juego 2", "detail": "d", "source": "Guía, p. 1" },
          { "id": "g3", "name": "Juego 3", "detail": "d", "source": "Guía, p. 1" },
          { "id": "g4", "name": "Juego 4", "detail": "d", "source": "Guía, p. 1" },
          { "id": "g5", "name": "Juego 5", "detail": "d", "source": "Guía, p. 1" } ],
        "phrases": [ { "id": "f1", "situation": "Situación 1" }, { "id": "f2", "situation": "Situación 2" }, { "id": "f3", "situation": "Situación 3" } ],
        "care": [ { "id": "c1", "text": "Cuidado 1", "source": "Guía, p. 2" }, { "id": "c2", "text": "Cuidado 2", "source": "Guía, p. 2" }, { "id": "c3", "text": "Cuidado 3", "source": "Guía, p. 2" } ]
      } ],
      "reflection": { "prompt": "Prueba." },
      "quiz": { "title": "Evaluación", "questions": [
        { "text": "¿Uno?", "options": ["a", "b", "c"], "correctIndex": 0 },
        { "text": "¿Dos?", "options": ["a", "b", "c"], "correctIndex": 1 } ], "nextLabel": "Certificado" } }
  ],
  "achievements": [ { "id": "achievement-1", "name": "Prueba", "emoji": "🧪", "unlockOnModule": 2 } ],
  "certificate": { "courseName": "PRUEBA", "description": "prueba" }
}
```

- [x] **Step 2: Escribir la prueba de flujo `PRUEBAS-E2E/tests/kit-builder.spec.js`**

```js
// kit-builder (ADR-106): el kit del Nivel 2 se elige, se guarda SOLO en el navegador,
// sobrevive a una recarga y se descarga. Corre sobre un curso de prueba compilado aqui mismo
// (fixtures/kit-prueba.json), para no depender del contenido de ningun curso publicado.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const path = require('path');
const { pathToFileURL } = require('url');

const REPO = path.join(__dirname, '..', '..');
const FIX = path.join(__dirname, '..', 'fixtures');
const SALIDA = path.join(FIX, 'kit-prueba.html');

test.beforeAll(() => {
  execFileSync('node', [path.join(REPO, '05-Generador-Cursos', 'build-course.js'),
    '--json', path.join(FIX, 'kit-prueba.json'), '--salida', SALIDA]);
});

async function abrirKit(page) {
  await page.addInitScript(() => {
    try {
      if (!localStorage.getItem('courseProgress_kit-prueba')) {
        localStorage.setItem('courseProgress_kit-prueba', JSON.stringify({
          userProfile: { fullName: 'Rover Prueba' }, currentModule: 2,
          moduleProgress: [], quizScores: [], reflections: {}, studyTime: 0 }));
      }
    } catch (e) {}
  });
  await page.goto(pathToFileURL(SALIDA).href, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#module-2')).toHaveClass(/active/);
}

test.describe('@solo-escritorio kit-builder', () => {
  test('tope de 3 y se libera al desmarcar', async ({ page }) => {
    await abrirKit(page);
    for (const g of ['g1', 'g2', 'g3']) await page.check(`[data-kit-game="${g}"]`);
    await expect(page.locator('[data-kit-game="g4"]')).toBeDisabled();
    await expect(page.locator('[data-kit-count]')).toContainText('3');
    await expect(page.locator('[data-kit-why="g1"]')).toBeVisible();
    await expect(page.locator('[data-kit-why="g4"]')).toBeHidden();
    await page.uncheck('[data-kit-game="g2"]');
    await expect(page.locator('[data-kit-game="g4"]')).toBeEnabled();
  });

  test('persiste al recargar', async ({ page }) => {
    await abrirKit(page);
    await page.check('[data-kit-game="g2"]');
    await page.fill('[data-kit-why="g2"]', 'Porque se mueven');
    await page.fill('[data-kit-phrase="f1"]', 'Probemos otra vez');
    await page.check('[data-kit-care="c3"]');
    await page.fill('[data-kit-care-own]', 'Contarlos al cambiar de zona');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-kit-game="g2"]')).toBeChecked();
    await expect(page.locator('[data-kit-why="g2"]')).toHaveValue('Porque se mueven');
    await expect(page.locator('[data-kit-phrase="f1"]')).toHaveValue('Probemos otra vez');
    await expect(page.locator('[data-kit-care="c3"]')).toBeChecked();
    await expect(page.locator('[data-kit-care-own]')).toHaveValue('Contarlos al cambiar de zona');
  });

  test('descargar produce un PDF', async ({ page }) => {
    await abrirKit(page);
    await page.check('[data-kit-game="g1"]');
    await page.waitForFunction(() => window.jspdf && window.jspdf.jsPDF, null, { timeout: 15000 });
    const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('[data-kit-download]')]);
    expect(descarga.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('ninguna petición al backend', async ({ page }) => {
    const alBackend = [];
    page.on('request', (r) => { if (/script\.google\.com/.test(r.url())) alBackend.push(r.url()); });
    await abrirKit(page);
    await page.check('[data-kit-game="g1"]');
    await page.fill('[data-kit-why="g1"]', 'x');
    await page.fill('[data-kit-phrase="f2"]', 'y');
    await page.check('[data-kit-care="c1"]');
    await page.waitForTimeout(500);
    expect(alBackend).toEqual([]);
  });
});
```

- [x] **Step 3: Correr y ver que falle**

Run: `cd PRUEBAS-E2E && npx playwright test tests/kit-builder.spec.js --project=desktop-chromium`
Expected: FAIL en `beforeAll`, porque `build-course.js` todavía no entiende `--json`.

- [x] **Step 4: Modo `--json/--salida` en `build-course.js`**

Reemplazar el bloque «Leer argumentos» y «Leer JSON del curso», hasta `const course = …`, por:

```js
// --- Leer argumentos ---
// `node build-course.js <curso>` compila borradores/<curso>.json y actualiza el catalogo.
// `node build-course.js --json <entrada.json> --salida <salida.html>` compila un curso de
// PRUEBA a una ruta propia y NO toca el catalogo (lo usa PRUEBAS-E2E/tests/kit-builder.spec).
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const MODO_PRUEBA = argv.includes('--json');
const courseName = MODO_PRUEBA ? null : argv[0];
if (!MODO_PRUEBA && !courseName) {
    console.error('❌ Uso: node build-course.js <nombre-curso>');
    console.error('   Ejemplo: node build-course.js fundamentos-scout');
    console.error('\n   Cursos disponibles en borradores/:');
    try {
        const files = fs.readdirSync(BORRADORES_DIR).filter(f => f.endsWith('.json'));
        files.forEach(f => console.error('   - ' + f.replace('.json', '')));
    } catch (e) { console.error('   (ninguno)'); }
    process.exit(1);
}

// --- Leer JSON del curso ---
const jsonPath = MODO_PRUEBA ? path.resolve(opt('--json')) : path.join(BORRADORES_DIR, courseName + '.json');
if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró: ' + jsonPath);
    process.exit(1);
}
```

Y en «Generar y guardar»:

```js
const html = buildHTML(course);
const outputPath = MODO_PRUEBA ? path.resolve(opt('--salida')) : path.join(OUTPUT_DIR, course.courseId + '.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log('✅ Curso generado: ' + outputPath);
if (MODO_PRUEBA) process.exit(0);
```

- [x] **Step 5: Funciones del kit en `templates/engine.js`**

En el `DOMContentLoaded`, justo después de `loadProgress();`:

```js
    initKitBuilder();
```

Y al final del archivo:

```js
// --- Kit del Nivel 2 (ADR-106) ---
// Se guarda SOLO en localStorage: nada de esto pasa por sendToGoogleSheets (ADR-087).
function _kitKey() { return 'rover:kit_' + COURSE_CONFIG.courseId; }
function _kitRoot() { return document.querySelector('[data-kit-builder]'); }

function loadKit() {
    try { return JSON.parse(localStorage.getItem(_kitKey())) || null; } catch (e) { return null; }
}

function saveKit() {
    var root = _kitRoot();
    if (!root) return;
    var kit = { games: {}, phrases: {}, care: [], careOwn: '' };
    root.querySelectorAll('[data-kit-game]').forEach(function (cb) {
        if (!cb.checked) return;
        var id = cb.getAttribute('data-kit-game');
        var ta = root.querySelector('[data-kit-why="' + id + '"]');
        kit.games[id] = ta ? ta.value : '';
    });
    root.querySelectorAll('[data-kit-phrase]').forEach(function (ta) {
        kit.phrases[ta.getAttribute('data-kit-phrase')] = ta.value;
    });
    root.querySelectorAll('[data-kit-care]').forEach(function (cb) {
        if (cb.checked) kit.care.push(cb.getAttribute('data-kit-care'));
    });
    var own = root.querySelector('[data-kit-care-own]');
    kit.careOwn = own ? own.value : '';
    try { localStorage.setItem(_kitKey(), JSON.stringify(kit)); } catch (e) {}
}

function _kitRefresh() {
    var root = _kitRoot();
    if (!root) return;
    var max = parseInt(root.getAttribute('data-max-games'), 10) || 3;
    var boxes = root.querySelectorAll('[data-kit-game]');
    var n = 0;
    boxes.forEach(function (cb) { if (cb.checked) n++; });
    boxes.forEach(function (cb) {
        if (!cb.checked) cb.disabled = n >= max; else cb.disabled = false;
        var ta = root.querySelector('[data-kit-why="' + cb.getAttribute('data-kit-game') + '"]');
        if (ta) ta.hidden = !cb.checked;
    });
    var count = root.querySelector('[data-kit-count]');
    if (count) count.textContent = n + ' de ' + max + ' elegidos';
}

function initKitBuilder() {
    var root = _kitRoot();
    if (!root) return;
    var kit = loadKit();
    if (kit) {
        Object.keys(kit.games || {}).forEach(function (id) {
            var cb = root.querySelector('[data-kit-game="' + id + '"]');
            var ta = root.querySelector('[data-kit-why="' + id + '"]');
            if (cb) cb.checked = true;
            if (ta) ta.value = kit.games[id] || '';
        });
        Object.keys(kit.phrases || {}).forEach(function (id) {
            var ta = root.querySelector('[data-kit-phrase="' + id + '"]');
            if (ta) ta.value = kit.phrases[id] || '';
        });
        (kit.care || []).forEach(function (id) {
            var cb = root.querySelector('[data-kit-care="' + id + '"]');
            if (cb) cb.checked = true;
        });
        var own = root.querySelector('[data-kit-care-own]');
        if (own) own.value = kit.careOwn || '';
    }
    root.addEventListener('change', function () { _kitRefresh(); saveKit(); });
    root.addEventListener('input', function () { saveKit(); });
    _kitRefresh();
}

function downloadKitPDF() {
    var root = _kitRoot();
    if (!root) return;
    saveKit();
    var JsPDF = (window.jspdf && window.jspdf.jsPDF) || (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!JsPDF) { showNotification('La librería de PDF no cargó. Verifica tu conexión.'); return; }
    var pdf = new JsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, M = 18, y = 20, ancho = W - 2 * M;
    function linea(texto, tam, negrita) {
        pdf.setFont('helvetica', negrita ? 'bold' : 'normal');
        pdf.setFontSize(tam);
        _wrapText(pdf, texto, ancho).forEach(function (l) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(l, M, y); y += tam * 0.45;
        });
        y += 1.5;
    }
    var textoDe = function (el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
    linea(root.getAttribute('data-pdf-title') || 'Mi kit', 16, true);
    var nombre = (userProfile && userProfile.fullName) ? userProfile.fullName : '';
    linea([nombre, COURSE_CONFIG.title, new Date().toLocaleDateString('es-CO')].filter(Boolean).join(' · '), 10, false);
    y += 3;
    linea(textoDe(root.querySelector('.kit-games legend')), 13, true);
    root.querySelectorAll('[data-kit-game]').forEach(function (cb) {
        if (!cb.checked) return;
        var id = cb.getAttribute('data-kit-game');
        linea('• ' + textoDe(root.querySelector('label[for="kit-game-' + id + '"]')), 11, true);
        var ta = root.querySelector('[data-kit-why="' + id + '"]');
        if (ta && ta.value.trim()) linea(ta.value.trim(), 11, false);
    });
    y += 3;
    linea(textoDe(root.querySelector('.kit-phrases legend')), 13, true);
    root.querySelectorAll('[data-kit-phrase]').forEach(function (ta) {
        var id = ta.getAttribute('data-kit-phrase');
        linea(textoDe(root.querySelector('label[for="kit-phrase-' + id + '"]')), 11, true);
        linea(ta.value.trim() ? '«' + ta.value.trim() + '»' : '—', 11, false);
    });
    y += 3;
    linea(textoDe(root.querySelector('.kit-care legend')), 13, true);
    root.querySelectorAll('[data-kit-care]').forEach(function (cb) {
        if (cb.checked) linea('[x] ' + textoDe(root.querySelector('label[for="' + cb.id + '"]')), 11, false);
    });
    var own = root.querySelector('[data-kit-care-own]');
    if (own && own.value.trim()) linea('[x] ' + own.value.trim(), 11, false);
    pdf.save('Kit-' + COURSE_CONFIG.courseId + '.pdf');
    showNotification('Kit descargado 📥');
}
```

- [x] **Step 6: Estilos al final de `templates/styles.css`**

```css
/* --- Kit del Nivel 2 (ADR-106) --- */
.kit-builder { margin: 24px 0; }
.kit-builder fieldset { border: 1px solid #c8d6e0; border-radius: 10px; padding: 12px 16px; margin: 16px 0; }
.kit-builder legend { font-weight: 700; padding: 0 6px; }
.kit-game, .kit-phrase, .kit-care-item { margin: 10px 0; }
.kit-builder textarea { width: 100%; box-sizing: border-box; margin-top: 6px; padding: 8px; border-radius: 6px; border: 1px solid #b0c0cc; font: inherit; }
.kit-source { color: #4a5a66; }
.kit-count { font-weight: 600; }
html[data-theme="dark"] .kit-builder fieldset { border-color: #4a6275; }
html[data-theme="dark"] .kit-source { color: #cfe3f2; }
```

Y crear o ampliar `PRUEBAS-E2E/.gitignore` con la línea `fixtures/*.html`.

- [x] **Step 7: Correr y ver que pase**

Run: `cd PRUEBAS-E2E && npx playwright test tests/kit-builder.spec.js --project=desktop-chromium`
Expected: 4 passed.

- [x] **Step 8: Recompilar los ocho cursos y correr la suite local completa** (avisar antes a las otras sesiones)

Run desde `05-Generador-Cursos`: `for c in fundamentos-scout caracteristicas-educativas servicio-rover servir-en-el-grupo servir-en-familia servir-en-manada servir-en-tropa servir-en-comunidad; do node build-course.js $c | grep "⚠\|❌"; done`
Expected: sin avisos ni errores.
Run: `cd PRUEBAS-E2E && ASC_BASE_URL=http://localhost:8132/02-Plataforma-Web/ npx playwright test`
Expected: 0 failed. El total sube con las 8 pruebas nuevas de las Tareas 1 y 2.

- [x] **Step 9: Commit**

```bash
git add 05-Generador-Cursos PRUEBAS-E2E 02-Plataforma-Web
git commit -m "kit-builder en el motor: elegir 3, guardar solo en el navegador, descargar PDF (ADR-106)"
```

---

### Task 3: E5 · `herramientas-familia`

**Files:**
- Create: `01-Diseno-Cursos/H-Familia-Herramientas.md`
- Create: `05-Generador-Cursos/borradores/herramientas-familia.json`
- Generated: `02-Plataforma-Web/herramientas-familia.html`, `02-Plataforma-Web/cursos.json`
- Modify (raíz, con turno): `TRAZABILIDAD.csv` y `ESTADO-AUDITORIA.md`

**Interfaces:**
- Consumes: el tipo `kit-builder` (Tareas 1 y 2) y el curso de Nivel 1 `servir-en-familia` (qué ya enseñó; no repetirlo).
- Produces: el molde de los cursos H, que siguen las Tareas 4 a 6.

- [x] **Step 1: Extraer la fuente.** Con pypdf, *Guía del Dirigente de Familia de Cachorros* (2026): pp. 8, 26-27, 47-49, 63-66, 72-80. Y *Guía de Prevención y Atención del Daño* (2021): pp. 20-28 y 35-38. Guardar en el scratchpad como `familia-n2.txt`, marcando la página. Releer `borradores/servir-en-familia.json` y anotar qué ya se enseñó.
- [x] **Step 2: Diseño `.md`** con el molde del Nivel 1: ficha, gancho, objetivos, decisiones de diseño, y por lección fuentes con página, reflexión y casos del quiz. La lección 5 incluye el contenido completo del kit: al menos 5 juegos o tipos de juego con fuente, 3 o 4 situaciones para las frases, y al menos 3 puntos de cuidado con fuente (custodia, baño, contacto físico, 2+1: pp. 76-80).
- [x] **Step 3: JSON** según la plantilla de `SKILL.md`, con la sección `kit-builder` en la lección 5.
- [x] **Step 4: Build.**
  Run: `node 05-Generador-Cursos/build-course.js herramientas-familia`
  Expected: sin «⚠» ni «❌». Si aparecen avisos de quiz, corregir los **distractores**, no la correcta.
- [x] **Step 5: Auditorías en paralelo.** `auditor-doctrinal-asc` y `auditor-pedagogico-asc`, con las instrucciones de Rover en el prompt: público de 18 a 20 años; reflexiones sin nombres; DEFECTO frente a BRECHA; el quiz final no repite el Nivel 1; fuga de conjunto por palabra.
- [x] **Step 6: Aplicar las correcciones** con un script en el scratchpad, recompilar sin avisos y lanzar la **re-auditoría acotada** de lo corregido, las dos, en paralelo. Repetir hasta que den APTO o APTO CON MENORES, y aplicar esos menores.
- [x] **Step 7: Suite local**, avisando antes.
  Run: `cd PRUEBAS-E2E && ASC_BASE_URL=http://localhost:8132/02-Plataforma-Web/ npx playwright test`
  Expected: 0 failed. El landing muestra el grupo «Nivel 2 · Herramientas».
- [x] **Step 8: Commit, push y producción.**
  - `git add 01-Diseno-Cursos 05-Generador-Cursos/borradores 02-Plataforma-Web && git commit && git push`.
  - Esperar a que el build de Pages termine en `built`.
  - `curl` a la página del curso y a `cursos.json`: esperar 200.
  - Suite sin `ASC_BASE_URL`: esperar 0 failed.
- [x] **Step 9: Raíz, con turno.** Agregar las filas de trazabilidad (una por afirmación o cita) y la fila en `ESTADO-AUDITORIA.md`. Commit con pathspec y push.

### Task 4: E6 · `herramientas-manada`

Mismos pasos que la Tarea 3, con `herramientas-manada` y `01-Diseno-Cursos/H-Manada-Herramientas.md`. Las fuentes son:
- *Guía de Manada*, pp. 9-10, 34-36, 54, 58-60 y 64-65;
- *Manual de Presentación y Buen Orden de la Manada*, pp. 9-20;
- *Guía de Prevención* (2021), pp. 20-28 y 35-38.

La lección 3 **va más allá** de «firmeza con ternura», que ya enseñó `servir-en-manada`: mediar sin resolver por ellos, las preguntas de cierre y corregir en privado. El kit toma sus juegos de lo que nombra la guía; incluye los juegos democráticos de la p. 54 y las tradiciones del *Buen Orden*.

### Task 5: E7 · `herramientas-tropa`

Mismos pasos que la Tarea 3, con `herramientas-tropa` y `01-Diseno-Cursos/H-Tropa-Herramientas.md`. Las fuentes son:
- *Guía de Dirigente de Tropa*, pp. 14-15, 25-26, 33-34, 58 y 66;
- *Bitácora Scout* (`PROGRAMA DE JOVENES/HERRAMIENTAS POR RAMA/TROPA/`);
- *Manual de Especialidades* 2019;
- *Guía de Buenas Prácticas para Jefes de Tropa*, que es **de 2023**: pp. 20-30;
- *Guía de Prevención* (2021).

La lección 2 lleva la **técnica fuerte**: especialidades y lo que la *Bitácora* tiene con texto extraíble. Las tablas de nudos son imágenes, así que no se transcriben: se remite a la *Bitácora*. «Sinodal» se usa solo con el sentido de quien asesora una especialidad.

### Task 6: E8 · `herramientas-comunidad` y cierre del Nivel 2

Mismos pasos que la Tarea 3, con `herramientas-comunidad` y `01-Diseno-Cursos/H-Comunidad-Herramientas.md`. Las fuentes son:
- *Guía de Comunidad*, pp. 7, 13, 22-23, 25, 42-43 y 46-47;
- *Guía de Prevención* (2021).

La lección 2 dice abiertamente que la técnica se aprende en el Clan. Si la guía no da 5 juegos concretos, el kit usa tipos de juego.

Después, el cierre:

- [x] **ADR-106** en `DECISIONES.md`, insertado arriba del ADR descendente inmediatamente menor que exista. Subir la versión del pie, sin cambiar el conteo de abiertas salvo que se abra o cierre alguna. Glosario, si hizo falta (pedir número de versión a las otras sesiones). Entrada en `docs/BITACORA.md`. `python generar-estado.py`. Commit con pathspec y push.
- [x] **Docs de Rover:**
  - `SKILL.md`, para que documente el tipo `kit-builder` (11 tipos);
  - `CLAUDE.md`, con la línea de autonomía;
  - README de la suite, con la fila `kit-builder`;
  - plan y spec marcados como completados.
  - Commit y push.
- [x] **Memoria:** `linea-rover.md`, `autonomia-cursos-rover.md` (agotada) y `MEMORY.md`. Preguntar al dueño antes de abrir el Nivel 3 o la Ruta 2.
