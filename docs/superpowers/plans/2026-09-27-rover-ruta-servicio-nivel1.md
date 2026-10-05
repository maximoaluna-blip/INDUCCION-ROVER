# Rover: Nivel 1 de la Ruta «Servir en el Grupo» — plan de trabajo

> ✅ **Completado el 27-09-2026.** E0 (ADR-086), E1 (ADR-091), E2 Manada (ADR-094), E3 Tropa (ADR-095) y E4 Comunidad (ADR-096), todos publicados. Lo que difirió del plan y por qué está en esos ADR. El backend terminó en `@8`, no en `@7`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** limpiar Rover de «sinodal» y de «18–22» en producción (E0), y publicar el Nivel 1 de la Ruta 1: S1, R1 y los cuatro R1-rama (E1–E4).

**Architecture:** es el mismo pipeline de la casa que en las demás líneas: diseño `.md` con fuentes, luego JSON, luego `build-course.js`, luego HTML en `02-Plataforma-Web/`. Rover tiene motor, generador, backend y suite propios. **No se toca `_MOTOR/`.** El catálogo `cursos.json` gana tres campos (`route`, `level`, `branch`) y la portada `index.html` los usa para agrupar.

**Tech Stack:** Node (`build-course.js`), HTML/JS estático en GitHub Pages, Apps Script con clasp (backend propio de Rover, producción `@7`), Playwright (`PRUEBAS-E2E/`), Python para búsquedas en PDF (pypdf).

**Spec:** `INDUCCION-ROVER/docs/superpowers/specs/2026-09-27-rover-ruta-servicio-design.md`

## Global Constraints

- Público: **Rovers de 18 a 20 años** de la **Regional Valle del Cauca**. La edad del registro es min 18 y max 21, porque la salida del Clan ocurre antes de los 21 años y 2 meses.
- Ningún texto dice que el Rover es o será «sinodal», «ayudante» o «dirigente». «Sinodal» solo aparece como el experto que asesora.
- Las reflexiones no piden nombres ni confidencias. Fórmula: «piénsalo con nombre; aquí basta su inicial» (⚠️ superada por el ADR-145: ni nombres ni iniciales).
- El certificado es regional, uno por curso, y dice lo que se completó.
- Duración de un curso nuevo: de 25 a 40 minutos.
- No se toca `_MOTOR/`, ni otras líneas, ni los portales. Los archivos compartidos de la raíz (`DECISIONES.md`, `TRAZABILIDAD.csv`, `GLOSARIO-ASC.md`, `docs/BITACORA.md`) se tocan con aviso a PJ y DI, pull antes y commit inmediato.
- Suites: primero local con `ASC_BASE_URL=http://localhost:8132/...` y después contra producción. **Aviso a PJ y DI antes y después.** Se lee el TOTAL de pruebas.
- ADR: 086 para E0. Cada entrega siguiente **pide su número en voz alta** antes de empezar (ya ocupados: 087–090).
- Se escala al dueño solo lo crítico: el despliegue del backend (T5) y el texto del certificado ya emitido (T3).

## Review Focus

1. **Quien ya se registró** en F1 o F2 con el formulario viejo vuelve y el registro tiene que seguir funcionando. El campo `motivation` cambia de etiqueta, no de nombre. Prueba: `persistence.spec.js` sigue verde.
2. **Enlaces viejos:** `/fundamentos/`, `/caracteristicas-educativas/` y `pagina-principal-menu-cursos.html` siguen llevando a un curso o a la portada, sin dar 404. Prueba: `links.spec.js` más una comprobación nueva del redirect.
3. **El certificado emitido** sigue verificándose con su código. Prueba: `verificar-certificado.html` con un código conocido, a mano, contra producción.
4. **Portada sin JS del catálogo o con el fetch fallido:** hoy muestra un mensaje de error, y debe seguir haciéndolo. Prueba: `landing.spec.js` con el catálogo bloqueado.
5. **Un curso con `branch` y sin rama elegida en el selector** no desaparece. Por defecto se muestran todas las ramas. Prueba: nueva en `landing.spec.js`.

---

## ENTREGA E0 — Limpieza (ADR-086)

### Task 1: el generador deja de decir «sinodal» y pide 18–20

**Files:**
- Modify: `05-Generador-Cursos/build-course.js`. La edad está hacia la línea 367, la motivación hacia la 385, el compromiso hacia las 535–536 y el subtítulo por defecto hacia la 594.
- Modify: `05-Generador-Cursos/course-schema.json`, `course-schema.example.json` y `preview-course.js`, que repiten los mismos valores por defecto.
- Test: `PRUEBAS-E2E/tests/codigo.spec.js`

**Interfaces:**
- Produces: el JSON de un curso admite `registration.motivationLabel` (string) y `certificate.commitmentPrompt` (string). Los dos son opcionales. Por defecto valen «¿Qué te mueve a hacer este curso?» y «Escribe tu compromiso de servicio:».

- [ ] **Step 1: la prueba que falla.** En `codigo.spec.js` se agrega:

```js
test('el generador no dice sinodal/ayudante ni 18-22 (ADR-086)', () => {
  const src = fs.readFileSync(path.join(RAIZ, '05-Generador-Cursos', 'build-course.js'), 'utf-8');
  expect(src).not.toMatch(/sinodal/i);
  expect(src).not.toMatch(/max="22"/);
  expect(src).toMatch(/min="18" max="21"/);
});
```
- [ ] **Step 2:** `cd PRUEBAS-E2E && npx playwright test codigo.spec.js -g "ADR-086"`. Esperado: FAIL.
- [ ] **Step 3:** en `build-course.js`:
  - `max="22"` pasa a `max="21"`;
  - la etiqueta pasa a `${(course.registration && course.registration.motivationLabel) || '¿Qué te mueve a hacer este curso?'}`;
  - el compromiso pasa a `${course.certificate.commitmentPrompt || 'Escribe tu compromiso de servicio:'}`, con el placeholder «Mi compromiso de servicio es...»;
  - el subtítulo por defecto pasa a `'Plataforma de servicio Rover · Regional Valle del Cauca'`.
  
  Los mismos valores por defecto van en `course-schema.json`, `course-schema.example.json` y `preview-course.js`.
- [ ] **Step 4:** se corre la prueba. Esperado: PASS.
- [ ] **Step 5:** commit con el mensaje «Generador: sin sinodal, edad 18-20 (ADR-086)».

### Task 2: compuerta de vocabulario sobre lo publicado

**Files:**
- Create: `PRUEBAS-E2E/lexico.json`
- Modify: `PRUEBAS-E2E/tests/codigo.spec.js`

- [ ] **Step 1:** crear `lexico.json`:

```json
{
  "_porQue": "ADR-086. Rover llamaba 'sinodal/ayudante' al Rover en servicio y a su publico '18-22'. En las fuentes el sinodal es el experto que asesora al joven, y la Rama Rover es de 18 a 20 anos (Modelo de Aplicacion 2026 p. 19 y 21).",
  "linea": "Rover",
  "prohibido": [
    { "patron": "sinodal(es)?\\s*(/|o|y)\\s*ayudante", "porQue": "Presenta un cargo que el Rover no tiene." },
    { "patron": "(como|ser|futuro)\\s+sinodal", "porQue": "El sinodal es quien asesora, no el Rover en servicio." },
    { "patron": "sinodalato", "porQue": "No aparece en ninguna fuente." },
    { "patron": "18\\s*(-|–|a)\\s*22\\s*a", "porQue": "La Rama Rover es de 18 a 20 anos." }
  ]
}
```
- [ ] **Step 2:** en `codigo.spec.js`, una prueba que barra el texto visible (sin `<script>`, `<style>` ni etiquetas) de cada HTML compilado de `02-Plataforma-Web/*.html` que figure en el catálogo, más `index.html`, `cursos.json` y `05-Generador-Cursos/apps-script/Código.js`, y que falle con el archivo y el patrón:

```js
test('ningun texto publicado usa el vocabulario prohibido (ADR-086)', () => {
  const lex = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lexico.json'), 'utf-8'));
  const archivos = [...CURSOS.map((c) => path.join(RAIZ, '02-Plataforma-Web', c.file)),
    path.join(RAIZ, 'index.html'), path.join(RAIZ, '02-Plataforma-Web', 'cursos.json'),
    path.join(RAIZ, '05-Generador-Cursos', 'apps-script', 'Código.js')];
  const fallos = [];
  for (const f of archivos) {
    const txt = fs.readFileSync(f, 'utf-8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
    for (const r of lex.prohibido) if (new RegExp(r.patron, 'i').test(txt)) fallos.push(`${path.basename(f)}: ${r.patron}`);
  }
  expect(fallos, fallos.join('\n')).toEqual([]);
});
```
  (`CURSOS` y `RAIZ` ya existen en el spec; si tienen otro nombre, se usa el que ya está.)
- [ ] **Step 3:** se corre. Esperado: **FAIL, con la lista de hoy**, que es la deuda que cierran las Tasks 3 a 5. Se deja fallando hasta que terminen.
- [ ] **Step 4:** commit con el mensaje «Compuerta de vocabulario (falla a proposito hasta cerrar E0)».

### Task 3: F1 y F2 corregidos, con su diseño versionado

**Files:**
- Modify: `05-Generador-Cursos/borradores/fundamentos-scout.json` y `caracteristicas-educativas.json`
- Create: `01-Diseno-Cursos/F1-Fundamentos-del-Movimiento-Scout.md` y `F2-Caracteristicas-Educativas.md`
- Regenerar: `02-Plataforma-Web/fundamentos-scout.html` y `caracteristicas-educativas.html`

- [ ] **Step 1:** los `.md` de diseño se reconstruyen desde el JSON. Cabecera: propósito (Ruta 1, Nivel 1), público (18–20) y fuentes, más un resumen por lección. **Sin reescribir el contenido**: solo se documenta lo que ya existe y lo que cambia aquí.
- [ ] **Step 2:** cambios en los JSON:
  - el `subtitle` pasa a «Ruta Servir en el Grupo · Nivel 1»;
  - `description` y `certificate.description` quedan sin cargo. Por ejemplo: «…demostrando comprensión de los fundamentos del Movimiento Scout, base para servir en el Grupo.»;
  - los objetivos que dicen «prepararte para ser sinodal/ayudante» pasan a «servir en el Grupo, apoyando a otras ramas»;
  - la caja «Para el Sinodal/Ayudante» pasa a «Para el Rover en servicio»;
  - las 4 reflexiones «como (futuro) sinodal…» pasan a «cuando sirvas en otra rama…»;
  - `registration.motivationLabel` vale «¿Por qué quieres servir en otra rama de tu Grupo?»;
  - `contentVersion` pasa a `2026-09-27`.
  
  Se revisan **todas** las reflexiones con la regla de los nombres.
- [ ] **Step 3:** `node 05-Generador-Cursos/build-course.js <json>` para cada uno. Hay que leer los avisos de las tres compuertas de quiz, que no deben aparecer nuevos.
- [ ] **Step 4:** auditoría doctrinal (agente `auditor-doctrinal-asc`) de lo cambiado, y re-auditoría si corrige algo.
- [ ] **Step 5: CRÍTICO, se consulta al dueño.** El texto del certificado de `fundamentos-scout` ya emitido cambia al descargarlo de nuevo. Se le muestra el texto viejo y el nuevo y se espera su sí. Mientras tanto se sigue con las Tasks 4 a 6.
- [ ] **Step 6:** commit con el mensaje «F1 y F2: sin sinodal, 18-20, diseno versionado (ADR-086)».

### Task 4: catálogo y una sola portada

**Files:** `02-Plataforma-Web/cursos.json`, `index.html`, `02-Plataforma-Web/pagina-principal-menu-cursos.html`, `verificar-certificado.html` (el enlace de la línea ~680), `PRUEBAS-E2E/tests/landing.spec.js`

- [ ] **Step 1: pruebas.** En `landing.spec.js`:
  - no hay ninguna tarjeta `.coming-soon`;
  - existe la sección «Servir en el Grupo» con el rótulo «Nivel 1»;
  - F1 y F2 aparecen en ella;
  - si el catálogo falla, se muestra el mensaje de error, como hoy.
  
  En `links.spec.js`: `pagina-principal-menu-cursos.html` termina en `index.html`.
- [ ] **Step 2:** se corren. Esperado: FAIL.
- [ ] **Step 3:** cambios.
  - `cursos.json`: se quitan los 5 `coming-soon` y a F1 y F2 se les agrega `"route":"grupo","level":1,"branch":null`.
  - `index.html`: el render agrupa por `route` (con el orden `tronco`, `grupo`, `comunidad` y los títulos «El servicio», «Servir en el Grupo», «Servir en la comunidad»), luego por `level` («Nivel 1 · Conocer», «Nivel 2 · Herramientas», «Nivel 3 · Proyecto»). Si hay cursos con `branch`, aparece un selector con Todas, Familia, Manada, Tropa y Comunidad; «Todas» va por defecto. Los grupos vacíos no se pintan.
  - `pagina-principal-menu-cursos.html` pasa a ser una redirección con `<meta http-equiv="refresh" content="0; url=../index.html">` y un enlace visible.
  - El verificador apunta a `index.html`.
  - Las meta de SEO de `index.html` quedan sin «sinodales».
- [ ] **Step 4:** se corren. Esperado: PASS.
- [ ] **Step 5:** commit con el mensaje «Catalogo por ruta y nivel, una sola portada (ADR-086)».

### Task 5: correos del backend y despliegue @8 (CRÍTICO)

**Files:** `05-Generador-Cursos/apps-script/Código.js` (líneas ~162 y ~204), `05-Generador-Cursos/google-apps-script.js` (la copia espejo)

- [ ] **Step 1:** las dos frases pasan a «Este curso te prepara para servir mejor en tu Grupo.» y «¡Ahora estás mejor preparado/a para servir en tu Grupo Scout!».
- [ ] **Step 2:** `node 05-Generador-Cursos/probar-backend.js`. Esperado: todo en verde.
- [ ] **Step 3: se consulta al dueño**, porque es un despliegue a producción. Con su sí:
  - se avisa a PJ y DI;
  - `cd 05-Generador-Cursos/apps-script && clasp push`;
  - `clasp create-deployment -i AKfycbzHd4KB4MafCKKPp8kEf9V-vLnlsCKUhmqR6eMFB-Qvz2f03xy9bYSx86eGUuS5RkfX2g -d "ADR-086 correos sin sinodal"`;
  - `clasp list-deployments` para confirmar `@8`;
  - `probar-backend.js` otra vez;
  - se avisa a PJ y DI que terminó.
- [ ] **Step 4:** commit con el mensaje «Backend: correos sin sinodal, @8 (ADR-086)».

### Task 6: publicar E0

- [ ] **Step 1:** avisar a PJ y DI y correr la suite local: `ASC_BASE_URL=http://localhost:8132/INDUCCION-ROVER/ npx playwright test`. Se levanta el servidor del `launch.json` de Rover. Esperado: TOTAL = passed, con la compuerta del vocabulario en verde.
- [ ] **Step 2:** `git push` en Rover, esperar a GitHub Pages y correr la suite contra producción sin la variable. Tiene que dar el mismo TOTAL. Avisar a PJ y DI.
- [ ] **Step 3: documentación.** Se avisa a las otras sesiones, se hace pull en la raíz y se escribe el **ADR-086** en `DECISIONES.md`, justo antes del ADR más alto del bloque descendente. Se **cierran** dos decisiones abiertas («sinodal» y «Rover no versiona diseños») y se actualiza la nota del recuento. Luego se actualizan el `CLAUDE.md` de Rover, `INDICE-PROYECTO.md` y `docs/BITACORA.md`. Se commitea y se avisa.
- [ ] **Step 4:** se actualizan las memorias `decisiones-abiertas-asc` y `compuertas-calidad-asc`.

---

## ENTREGAS E1–E4 — un curso por Task, con el mismo pipeline

Cada curso sigue estos pasos. PJ tiene un precedente de curso por rama en `INDUCCION-PROGRAMA-JOVENES/CREAR-CURSO.md` §5.C.

1. **Reservar el ADR en voz alta**, al empezar cada entrega.
2. **Fuentes:** se extrae de los PDF (pypdf) lo que el curso va a afirmar, con página. Luego se buscan frases del contenido, no palabras sueltas, porque basta una tilde para no encontrar algo.
3. **Diseño** `01-Diseno-Cursos/<Id>-<Titulo>.md`:
   - gancho de 80 palabras o menos;
   - de 5 a 6 lecciones de 5 a 7 minutos, con los 7 bloques de `CREAR-CURSO.md` §6.3;
   - quizzes de comprensión y aplicación;
   - reflexiones sin nombres;
   - un compromiso;
   - una tabla de fuentes por afirmación.
4. **Filas en `TRAZABILIDAD.csv`**: aviso, pull, solo agregar y commit inmediato.
5. **JSON** en `05-Generador-Cursos/borradores/<courseId>.json`, con `route`, `level`, `branch`, `registration.motivationLabel`, `certificate.courseName`, `certificate.description` y `certificate.commitmentPrompt`. Luego build, leyendo los avisos de las compuertas.
6. **Auditoría doctrinal**, luego **auditoría pedagógica con las instrucciones de Rover**. Se corrige lo que salga y se re-audita.
7. **Catálogo:** la entrada en `cursos.json`, `status: active`.
8. **Suite local y suite contra producción, en serie, con aviso.** Publicación, ADR, bitácora y `CLAUDE.md` de Rover.

### Task 7 (E1): S1 · El servicio Rover — `servicio-rover`, `route: tronco`, `level: 1`
Fuentes: *Guía de Dirigente de Clan* 2026 (p. 28, 31, 33, 36, 42, 61); *Modelo de Aplicación* (p. 19, 21, 49); guía de Clan 2018 (p. 49, tipos de servicio: se cita como antecedente y se dice que fue reemplazada); *Manual Mundo Mejor* (para presentar la Ruta 2 como escenario).
Lecciones:
1. Servir es el lema.
2. Tipos de servicio y servicio prolongado.
3. Los escenarios: el Grupo y la comunidad.
4. El servicio en tu PARCE.
5. El Clan va primero.
6. Tu compromiso de servicio.

### Task 8 (E1): R1 · Servir en el Grupo — `servir-en-el-grupo`, `route: grupo`, `level: 1`
Fuentes: *Modelo de Aplicación* (secciones y ramas, p. 19–24); *Reglamento de Grupos* (Equipo de Jefatura, arts. 6.x); *Política Nacional A Salvo del Peligro* (lo básico, con la fuente que usa `entornos-seguros-politica-asp` en Transversales); guía de Clan 2018 (p. 50, solo como antecedente de «apoyar no es dirigir»).
Lecciones:
1. El Grupo por dentro.
2. Apoyar no es dirigir.
3. Cómo se acuerda tu servicio.
4. A Salvo del Peligro: lo que no se negocia.
5. Tu primera semana de servicio.

### Task 9 (E1): R1-familia · Servir en la Familia de Cachorros — `servir-en-familia`, `branch: familia`
Fuente: *Guía del Dirigente de Familia* 2026 (83 pp.). El molde de lecciones está en el spec §3. En Familia **manda su Guía** (regla del dueño, registrada en la memoria de PJ).

### Task 10 (E1): portada con rutas visible y publicación de E1
Se verifica en el navegador (captura) que el tronco y la Ruta 1 muestran S1, F1, F2, R1 y R1-familia, y que el selector de rama filtra.

### Task 11 (E2): R1-manada — `servir-en-manada`, fuente *Guía de Dirigente de Manada* 2026 (69 pp.) y *Buen Orden de la Manada*
### Task 12 (E3): R1-tropa — `servir-en-tropa`, fuente *Guía de Dirigente de Tropa* 2026 (68 pp.) y *Guía de Buenas Prácticas* 2026
### Task 13 (E4): R1-comunidad — `servir-en-comunidad`, fuente *Guía de Dirigente de Comunidad* 2026 (48 pp.)

Cada una sigue los pasos 1 a 8 del pipeline, con el molde del spec §3 y **su propio ADR**.

### Task 14: cierre del Nivel 1
- Actualizar `CLAUDE.md` de Rover (estado: Ruta 1, Nivel 1 completo), `ESTADO` si existe y la memoria `autonomia-cursos-rover`.
- **Se detiene la autonomía**: se pregunta al dueño antes de abrir el Nivel 2 (H-rama).
