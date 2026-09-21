# CLAUDE.md — Rover (formación para sinodales/ayudantes)

> Contexto operativo de **este repo**. Documentos rectores compartidos del ecosistema más amplio viven en el repo raíz **`DOCS-MAESTRAS-ASC`**, pero **esta plataforma no es una de las 3 líneas nacionales** (Adultos, Desarrollo Institucional, Programa de Jóvenes) — ver estado abajo.

## 1. Qué es

Formación digital gratuita para **Rovers (18–22 años) de la Regional Valle del Cauca** que quieren ser sinodales o ayudantes en las ramas de Manada y Scouts. Distinto propósito y audiencia que las 3 líneas nacionales de adultos: no es inducción de un adulto ya en cargo, es preparación de un joven Rover hacia un rol de apoyo. En vivo: https://maximoaluna-blip.github.io/INDUCCION-ROVER/

## 2. Arquitectura (resumen; detalle en `INDICE-PROYECTO.md`)

Mismo patrón técnico que las 3 líneas nacionales — GitHub Pages + Google Apps Script/Sheets + `build-course.js` (JSON → HTML) — probablemente porque este proyecto fue el origen de ese patrón, no una copia tardía. Certificados PDF client-side (`html2pdf.js`/`jsPDF`), tema oscuro, panel administrativo y verificador de certificados propios.

## 3. Estado (ADR-020, `DECISIONES.md` raíz, 12-jul-2026)

⚠️ **Hasta el 21-sep-2026 este párrafo decía «7 cursos activos»**: son **2**, contados en `02-Plataforma-Web/cursos.json`. Y esta línea **no versiona el diseño de sus cursos** —no hay `01-Diseno-Cursos/` ni un `.md` de diseño, así que el JSON es el único original—: decisión abierta en el `DECISIONES.md` de la raíz.

**20-sep-2026 — los 2 cursos pasaron el barrido de paridad de quizzes (ADR-073):** 20 opciones reescritas, todas distractores, la correcta intacta; `contentVersion` en `2026-09-20`. Era **el peor de la plataforma**: `caracteristicas-educativas` tenía 13 de sus 20 preguntas con la correcta como extremo de longitud. ⚠️ **Sin suite E2E** (única línea), así que aquí la verificación es a mano.

**En pausa, no descontinuada.** **2 cursos activos** en producción (los otros **5** siguen en `coming-soon`), certificados y verificador funcionando con normalidad. Sin desarrollo activo desde el 19-may-2026. No compite con Adultos/DI/PJ ni se planea fusionar — sirve a una audiencia (Rovers regionales aspirantes a sinodal/ayudante) que las 3 líneas nacionales no cubren. Si se retoma desarrollo activo, ampliar este documento al patrón completo de las líneas activas.
