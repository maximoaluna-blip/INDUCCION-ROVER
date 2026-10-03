# INDUCCION-ROVER — Plataforma de servicio para Rovers

Asociación Scouts de Colombia · **Regional Valle del Cauca**. Formación gratuita para **Rovers de 18 a 20 años** que quieren **servir**: en otra rama de su Grupo o en la comunidad (ADR-086).

- **En vivo:** https://maximoaluna-blip.github.io/INDUCCION-ROVER/
- **Repositorio:** https://github.com/maximoaluna-blip/INDUCCION-ROVER
- **Qué cursos hay:** `02-Plataforma-Web/cursos.json` (fuente) y el `ESTADO.md` de la raíz (generado). Este índice no lleva cifras.
- **Cómo se trabaja aquí:** `CLAUDE.md`. **Cómo se diseña un curso:** `05-Generador-Cursos/SKILL.md`.
- **Hacia dónde va:** spec madre `docs/superpowers/specs/2026-09-27-rover-ruta-servicio-design.md`; una spec y un plan por nivel en `docs/superpowers/` (Nivel 2 «Herramientas», ADR-106; Nivel 3 «Proyecto», ADR-120). **La Ruta 1 está completa**; la Ruta 2 se consulta al dueño antes de abrirse.

Rover es un producto **regional**: queda fuera del portal y del panel nacionales a propósito (ADR-020), con backend, token y hoja propios.

## Estructura de la plataforma

- **Tronco común**, sobre el servicio (`route: tronco`).
- **Ruta 1 · Servir en el Grupo** (`route: grupo`), en niveles: 1 Conocer · 2 Herramientas por rama · 3 Proyecto. En el Nivel 1 hay un curso común y uno corto por rama (`branch`: familia, manada, tropa, comunidad).
- **Ruta 2 · Servir en la comunidad** (`route: comunidad`), sobre Mundo Mejor. Todavía no se ha diseñado.

La portada (`index.html`) agrupa por ruta y nivel y filtra por rama; los cursos comunes no se ocultan con el filtro.

## Arquitectura

```
Alumno → GitHub Pages (HTML estático) → Google Apps Script (token ROVER_ASC_2025) → Google Sheets
```

- Motor **propio** (`05-Generador-Cursos/templates/engine.js` + `styles.css`): Rover **no usa `_MOTOR/`**, así que los arreglos de las otras líneas no le llegan solos.
- Cursos generados con Node (`build-course.js`): JSON → un HTML autocontenido por curso.
- Dos tipos de sección propios de Rover, solo en el navegador (nada va al backend): **`kit-builder`** (Nivel 2: el kit que el Rover elige y descarga, ADR-106) y **`plan-builder`** (Nivel 3: el plan del proyecto, armado lección por lección, ADR-120). Validan en el build (`kit-builder.js`, `plan-builder.js`) y viven en `engine.js`.
- Certificado PDF en el navegador (html2canvas + jsPDF). **Solo se entrega con las lecciones aprobadas** y, donde hay plan, con el plan completo; ni la barra de navegación lo salta (ADR-120). Su pie enlaza a `verificar-certificado.html?codigo=…`, que verifica solo y **solo da por válido un código que el backend encontró** (ADR-128).
- Tema oscuro con `assets/dark-theme.css` y `assets/theme-toggle.js` (preferencia en `localStorage['rover-theme']`).

## Carpetas

```
INDUCCION-ROVER/
├── index.html                  ← portada única (por ruta y nivel, filtro de rama)
├── verificar-certificado.html  ← verificador público de certificados
├── dashboard-admin.html        ← panel del equipo (lee la hoja de Rover)
├── 404.html · assets/
├── fundamentos/ · caracteristicas-educativas/   ← redirecciones de las URL de 2025
├── 01-Diseno-Cursos/           ← diseño .md de cada curso, con fuentes por afirmación
├── 01-Documentacion-Scout/     ← PDFs fuente (fuera de git)
├── 02-Plataforma-Web/          ← cursos.json + un .html por curso
│   └── pagina-principal-menu-cursos.html  ← redirección a index.html
├── 03-Textos-Referencia/       ← textos de referencia (WOSM, Proyecto Educativo)
├── 04-Informes/                ← informe de 2025 (antecedente: habla de «sinodales», ya no aplica)
├── 05-Generador-Cursos/
│   ├── SKILL.md                ← guía de diseño de cursos (fuente única)
│   ├── build-course.js · preview-course.js · course-schema.json (+ .example)
│   ├── templates/              ← engine.js y styles.css
│   ├── borradores/             ← JSON de cada curso (fuente de verdad del motor)
│   ├── apps-script/            ← backend desplegable con clasp (Código.js)
│   ├── google-apps-script.js   ← espejo de Código.js: se cambian los dos
│   └── probar-backend.js       ← compuerta del backend, sin red
├── PRUEBAS-E2E/                ← suite Playwright + axe (ver su README)
├── docs/superpowers/           ← spec y planes
└── .github/workflows/          ← build-course.yml y pruebas-e2e.yml
```

## Comandos

```bash
node 05-Generador-Cursos/build-course.js <courseId>          # JSON → HTML y entrada del catálogo
node 05-Generador-Cursos/preview-course.js <courseId>        # vista previa
node 05-Generador-Cursos/probar-backend.js apps-script/Código.js   # compuerta del backend
```

Suite: ver `PRUEBAS-E2E/README.md` (por defecto mira **producción**; antes de publicar, contra el build local).

## Backend

- Producción es un **despliegue fijo** de Apps Script. Su versión se mide con `clasp list-deployments`, no se lee de un documento. Un `clasp push` **no** llega a los alumnos: hace falta `clasp create-deployment -i <id>`, y desplegar se consulta con el dueño.
- Acciones POST: `register`, `progress`, `quiz`, `certificate`. GET `recover` por correo y curso.
- Flujo de clasp: `05-Generador-Cursos/apps-script/README.md`.

## Persistencia en el navegador

- `courseProgress_<courseId>`: perfil, progreso, puntajes, tiempo y reflexiones.
- `commitment_<courseId>`: el compromiso de la última lección. Se restaura al volver al curso (ADR-094).
- El certificado emitido se guarda (`certificate_issued_<courseId>`) para que su código no cambie al volver. «Recuperar mi avance» lo reabre con el mismo código si la hoja ya lo tiene, y solo recupera el avance de **ese** curso (ADR-120).
- `rover:kit_<courseId>` (kit del Nivel 2) y `rover:plan_<courseId>` (plan del Nivel 3): se quedan en el navegador donde se escribieron; «Reiniciar curso» los borra.
