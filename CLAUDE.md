# CLAUDE.md — Rover (plataforma de servicio para Rovers)

> Contexto operativo de **este repo**. Los documentos rectores del ecosistema viven en la raíz (`DOCS-MAESTRAS-ASC`). Rover **no es una de las líneas nacionales de adultos**: es un producto **regional** (Valle del Cauca) y queda fuera del portal y del panel nacional a propósito (ADR-020).

## 1. Qué es

Formación gratuita para **Rovers de 18 a 20 años** de la **Regional Valle del Cauca** que quieren **servir**. Desde el **ADR-086 (27-sep-2026)** es una plataforma de servicio con un **tronco común** y **dos rutas**:
- **Servir en el Grupo:** en otra rama de su Grupo, de Familia de Cachorros a Comunidad.
- **Servir en la comunidad:** Mundo Mejor. Todavía no se ha diseñado.

La Ruta 1 tiene tres niveles: **1 Conocer**, **2 Herramientas por rama** y **3 Proyecto**. En vivo: https://maximoaluna-blip.github.io/INDUCCION-ROVER/

El diseño está en `docs/superpowers/specs/2026-09-27-rover-ruta-servicio-design.md` y el plan en `docs/superpowers/plans/`.

## 2. Reglas de contenido (lo que un curso de aquí NO puede hacer)

- **Nombrar un cargo para el Rover.** Ni «sinodal», ni «ayudante», ni «dirigente». En las fuentes, el **sinodal es el experto que asesora al joven** (*Guía para el Dirigente de Clan* 2018 p. 43; *Buenas Prácticas de Tropa* 2026 p. 28; *Reglamento de Grupos* art. 2.1.3). «Sinodal» solo puede aparecer con ese sentido. Lo vigila `PRUEBAS-E2E/lexico.json`, que **sí barre la prosa** de los cursos, la portada, el catálogo y los correos del backend.
- **Decir «18–22».** La Rama Rover es de **18 a 20 años** (*Modelo de Aplicación* 2026 p. 19 y 21) y se sale del Clan antes de los 21 años y 2 meses (*Guía de Clan* 2026 p. 52). El registro acepta de 18 a 21.
- **Pedir en una reflexión el nombre de una persona** (sobre todo de un menor) **o algo contado en confianza.** Las reflexiones van a la hoja del backend. Fórmula: «piénsalo con nombre; aquí basta su inicial».
- **Enseñar técnica scout sin fuente.** La política 2026 no trae nudos, amarres ni campismo. No se rellenan de memoria.
- **Presentar el servicio como formación de dirigente.** El servicio es parte de la progresión del Rover (PARCE), no un cargo.

## 3. Cómo se construye un curso aquí

- **Diseño primero:** `01-Diseno-Cursos/<Id>-<Titulo>.md`, con fuentes por afirmación. El JSON (`05-Generador-Cursos/borradores/<courseId>.json`) es su traducción. F1 y F2 tienen diseño **reconstruido desde el JSON** (ADR-086).
- El JSON declara **`route`** (`tronco`, `grupo` o `comunidad`), **`level`** (1 a 3) y **`branch`** (`familia`, `manada`, `tropa`, `comunidad` o `null`), además de `registration.motivationLabel` y `certificate.commitmentPrompt`. `build-course.js` **copia route, level y branch al catálogo**: si se quitan de ahí, recompilar saca el curso de su ruta.
- Build: `node 05-Generador-Cursos/build-course.js <courseId>`. **Leer los avisos**: las tres compuertas de quiz son copia **tal cual** de las de PJ (ADR-077). No se reescriben, se sincronizan.
- Auditoría doctrinal y luego pedagógica. La pedagógica se hace con **instrucciones de Rover** en el prompt: el público es un joven de 18 a 20 años, no un adulto con cargo, y se distingue un defecto de una brecha frente al estándar. La definición compartida del auditor no se toca.
- La portada es **una sola**: `index.html`. `02-Plataforma-Web/pagina-principal-menu-cursos.html` es una redirección.

## 4. Técnica y trampas

- **Motor propio** (`05-Generador-Cursos/templates/engine.js`). **No usa `_MOTOR/`**: los arreglos de la plataforma no le llegan solos, así que al leer un ADR de motor hay que preguntarse si aplica aquí.
- **Backend propio:** token `ROVER_ASC_2025` y hoja propia. Su clasp vive en `05-Generador-Cursos/apps-script/`. Producción está fijada en **`@8`** (27-sep-2026); medirlo con `clasp list-deployments`, no leerlo de un `.md`. Un `clasp push` **no** llega a producción: hay que hacer `clasp create-deployment -i AKfycbzHd4KB…RkfX2g`. Compuerta: `node 05-Generador-Cursos/probar-backend.js apps-script/Código.js` (19 comprobaciones) **antes y después**. `google-apps-script.js` es copia espejo de `Código.js`: se cambian los dos.
- **Suite** `PRUEBAS-E2E/` (ADR-084): por defecto **mira producción**. Antes de publicar, correrla con `ASC_BASE_URL=http://localhost:8132/02-Plataforma-Web/` (servidor `rover` del `launch.json`) y repetirla después sin la variable. Leer el **TOTAL**. Hay **dos** defaults de URL (`playwright.config.js` y `tests/_setup-cursos.js`). Con varias sesiones abiertas, **en serie y con aviso**.
- Toda spec que se registre marca `#consent` (Ley 1581, ADR-081).

## 5. Estado

Lo publicado se cuenta en `02-Plataforma-Web/cursos.json` y lo que falta en el plan (`docs/superpowers/plans/`). Por qué pasó cada cosa: `DECISIONES.md` de la raíz (ADR-020, 063, 073–077, 082, 084, **086**).
