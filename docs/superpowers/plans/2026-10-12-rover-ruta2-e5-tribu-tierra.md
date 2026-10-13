# Rover · Ruta 2, entrega E5 «Tribu de la Tierra» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publicar `herramientas-tribu-tierra`, el tercer y último curso de herramientas (Nivel 2) de la Ruta 2, con su `kit-builder`, para el Rover que va a servir en su comunidad con los desafíos de la Tribu de la Tierra: **Champions for Nature** y **Tide Turners Plastic**. Con él la Ruta 2 queda completa.

**Architecture:** el molde de la E3 y la E4: bienvenida, cuatro lecciones, «Arma tu kit» y certificado. `kit-builder` sin cambios de motor: rótulos en `labels`, con `missingGames` y `countLabel` («Te faltan actividades», «elegidas»). Sin tipos nuevos ni cambios de motor, build o portada.

**Tech Stack:** JSON → `build-course.js` → HTML; Playwright; `ciega.py`.

**Spec:** `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E5), §6 y §7.

## Lo que cambió desde la spec

La spec decía que la E5 era «la de fuente más delgada» y que faltaban los kits de acción con las descripciones de las actividades. **Los dos kits están en el corpus**, en `DOCUMENTOS BASE/SCOUTS/PROGRAMA DE JOVENES/MUNDO MEJOR/`:

- *Kit de Acción · Desafío Champions for Nature* (OMMS, jun-2020, en español): `Kit de Accion Campeones por la Naturaleza.pdf`.
- *Kit de Acción · Desafío Tide Turners Plastic* (OMMS, jun-2020, en español): `Kit de Accion Mareas Plasticas.pdf`.

El *Manual de Implementación Marco de Mundo Mejor* (ASC, 2021) remite a ellos: «el manual de implementación y el kit de acción… los encuentras aquí» (pp. 47–49).

Por eso el curso **enseña actividades, como la E3 y la E4**, y no solo el proceso que preveía la spec. Esto se le avisa al dueño antes de diseñar (Task 0).

## Global Constraints

- **Datos del curso:**
  - `courseId: "herramientas-tribu-tierra"`;
  - título «Tribu de la Tierra: el ambiente con tu comunidad»;
  - `route: "comunidad"`, `level: 2`, `branch: null`, 40 min;
  - certificado: «TRIBU DE LA TIERRA: EL AMBIENTE CON TU COMUNIDAD».
- **Fuentes de la ASC y la OMMS**, con fecha:
  - *Manual de Implementación Marco de Mundo Mejor* (ASC, 2021):
    - §5 Tribu de la Tierra: cuatro rutas de aprendizaje (p. 47);
    - Campeones por la Naturaleza y Plastic Tide Turners (pp. 48–49);
    - Scouts Go Solar (p. 49 y siguientes);
    - porte de insignias (p. 67).
  - *Kit Champions for Nature* (OMMS, 2020):
    - para quién: desde los 7 años (p. 7);
    - viaje y reconocimiento (pp. 8–9);
    - Sé consciente · Coopera · Actúa (pp. 10–12): **tres actividades para Rovers** (p. 11);
    - autoevaluación «15+» (pp. 18–19);
    - banco de actividades (pp. 22–64).
  - *Kit Tide Turners Plastic* (OMMS, 2020):
    - para quién (p. 6);
    - **cinco actividades desde los 11 años** y autoevaluación del uso de plástico antes de empezar (p. 11);
    - banco «de 15 años en adelante» (p. 21 y pp. 47–57);
    - ideas de Coopera y Actúa por edad (pp. 59–62).
  - *Earth Tribe – Manual de Implementación* (OMMS, 2020, español):
    - el viaje y el acuerdo mutuo; el adulto entrega el pin (pp. 14–15);
    - red colaborativa con Scouts y no Scouts (p. 26).
  - *Guía de Dirigente de Clan* 2026: el Clan formula proyectos de Tribu Tierra con alianzas (p. 37).
  - Política ASP 2025 y *Modelo* 2026: los cuidados, como en la E3 y la E4.
  - Los manuales OMMS en inglés (`Champions for Nature Challenge Manual_ES`, `Tide Turners Plastic Challenge Manual_ES`) son los manuales del desafío y se cotejan en la Task 1. Los `.pptx` y `.docx` de la carpeta, no.
- **Actividades para el Rover:** solo las que el kit marca con un rango que **incluye los 18 a 20 años** («de 15 años en adelante», «11 años o más», «13 años o más», «de 14 años en adelante»), con su página. Se verifican en la Task 1 contra la ficha de cada actividad, no solo contra la grilla.
  - **Primera lectura (12-10-2026)**, a confirmar:
    - Champions, Mejores Decisiones: ¿Cuál es tu posición sobre…? (p. 34), Cuatro esquinas (p. 36), Pirámide de alimentos (p. 38), Caminando con gafas de alimentos puestas (p. 28, 11+).
    - Champions, Naturaleza y Biodiversidad: Descubriendo la naturaleza con iNaturalist – Siguiente nivel (p. 56, 13+), Nuestro planeta (p. 58, 11+), S.E.E. los enlaces (p. 60, 14+), Contando historias – El discurso Pixar (p. 62).
    - Tide Turners, Planeta Sano: Audita tus hábitos de uso de plásticos y averigua a dónde van tus residuos (p. 47), Basura… ¿por qué es importante? (p. 48), Operación contra la basura (p. 50), Regular el uso de plásticos (p. 54), Confeccionar un cartel sobre contaminación marina (p. 56, edad por confirmar).
    - Tide Turners, Coopera y Actúa: Sorpresas de plástico (p. 61), Revolución en la gestión de residuos (p. 62), Preséntalo a los gobiernos locales (p. 60, 11+).
  - **Nombres que no coinciden entre la grilla y la ficha** (Champions p. 22 «¿Cuál es tu opinión…?» frente a p. 34 «¿Cuál es tu posición…?»; Tide Turners p. 21 «Controlar el uso de plásticos» frente a p. 54 «Regular el uso de plásticos»): manda la **ficha**, y se registra la discrepancia.
- **El número de actividades no es igual en los dos desafíos:** Champions pide tres para Rovers (p. 11) y Tide Turners, cinco desde los 11 años (p. 11). El `kit-builder` elige tres. El curso lo dice: el kit son las tres con las que empiezas, no el desafío completo.
- **Energía Limpia (Scouts Go Solar):** el Manual lo describe (p. 49 y siguientes), pero su kit no está en el corpus.
  - Como Diálogos por la Paz en la E3, se enseña **solo lo que trae el Manual**.
  - Si el Manual trae su proceso y su reconocimiento, se presenta como desafío.
  - Si no, solo se nombra como cuarta ruta.
- **Reconocimiento:**
  - El kit habla de insignia y certificado del desafío (Champions p. 9) y de convertirse en miembro de la Tribu de la Tierra.
  - Según *Earth Tribe* (p. 15), el adulto dirigente entrega el pin.
  - Quién otorga en Colombia no está escrito: se remite a la comisión de Mundo Mejor, como en la E3.
  - Porte: Manual p. 67.
  - «Compartir en scout.org y en el SDG Hub» es de 2020: se remite a la comisión (spec §7).
- **Cuidados, por lo que estas actividades piden de verdad:**
  - **Encuestas a personas en la calle** (Operación contra la basura, p. 50; el formulario de p. 52 pide nombre «(opcional)» y edad). Datos personales, Ley 1581: sin nombres ni datos que identifiquen. Es **recomendación del curso con fuente** (ADR-081 y ADR-087 de la plataforma) y se consulta al dueño si se presenta como regla.
  - **Contacto con autoridades** (Preséntalo a los gobiernos locales, p. 60; Revolución en la gestión de residuos, p. 62). Se hace con el adulto acompañante y la organización aliada. Si una fuente de la ASC dice algo de la neutralidad política del Movimiento, se usa; si no, **se consulta al dueño**.
  - **Manipular residuos y salidas de campo** (Audita… y averigua a dónde van tus residuos, p. 47; iNaturalist, p. 56). La seguridad sin fuente es **recomendación**; si protege a alguien y no la cubre spec §6, se consulta al dueño.
  - Imágenes, menores, 2+1, deber de reportar y transporte: las mismas reglas fijas que la E4.
- **Reglas Rover:**
  - nada de «sinodal», «ayudante» ni «dirigente» como rol del Rover; nunca «18–22»;
  - el Rover no cuenta como adulto;
  - las reflexiones no piden nombres, iniciales ni confidencias;
  - el kit queda en el navegador.
- **Quizzes:**
  - criterios de `SKILL.md`; fuga de forma en cero (`ciega.py`);
  - **lo que dejó la E4:**
    - el plan del protagonista del enunciado tiene que estar **bien** en al menos dos ítems;
    - sin absolutos solo en los distractores;
    - sin el trío exceso / defecto / término medio;
    - sin personaje que objeta.
  - **Regla ciega:** dos lectores nuevos de modelos distintos (ADR-148); se registra y no se persigue más allá de una vuelta.
- **Coordinación:**
  - ADR reservado en voz alta al empezar (al escribir esto: 150 Rover, 151 a 153 PT; el siguiente libre sería el 154);
  - suite en serie con aviso;
  - raíz con turno y commit con pathspec;
  - `ESTADO.md` se regenera solo si ninguna otra línea tiene cambios locales sin publicar.

## Review Focus

1. **Una actividad para menores presentada como del Rover.** Muchas fichas dicen «7 - 14» u «11-14» en la misma página que una de 15+. La prueba de la Task 1 compara nombre, página y rango contra un mapa cerrado, en el kit y en las lecciones.
2. **Un nombre de la grilla en lugar del de la ficha.** El mapa cerrado usa el de la ficha.
3. **Una plataforma o un procedimiento de 2020 presentado como vigente** (scout.org, SDG Hub, quién entrega la insignia). Lo revisa la auditoría doctrinal; el curso remite a la comisión.
4. **Una encuesta o un registro que recoge datos de personas.** Red estática sobre el JSON: el curso no pide nombre ni edad de terceros. Revisión doctrinal de cómo se presenta el formulario del kit.
5. **Una recomendación presentada como regla fija.** La fuente de cada regla empieza por la norma, como en la E3 y la E4.

---

### Task 0: visto bueno y paradas antes de diseñar

- [x] **Avisar al dueño** de lo que cambió desde la spec (los kits sí están) y pedir su visto bueno a este plan.
- [x] **Preguntas para el dueño:**
  - ¿Los kits OMMS de 2020, a los que remite el Manual de la ASC, sirven como fuente de las actividades, igual que los kits de la ASC en la E3 y la E4?
  - ¿Las actividades de incidencia con autoridades (pp. 60 y 62) entran, y con qué cuidado?
  - ¿Scouts Go Solar entra como desafío o solo se nombra? Depende de lo que traiga el Manual.

### Task 1: diseño, JSON y pruebas

**Files:**
- Create: `01-Diseno-Cursos/R2-Herramientas-Tribu-Tierra.md`.
- Create: `05-Generador-Cursos/borradores/herramientas-tribu-tierra.json`.
- Test: `PRUEBAS-E2E/tests/codigo.spec.js`, bloque `// --- E5 Tribu de la Tierra ---`, con los puntos 1, 2, 4 y 5 del Review Focus. Se agrega `herramientas-tribu-tierra` a la prueba de `countLabel` de `kit-builder.spec.js`.

- [x] **Step 1: Leer las fuentes con página.**
  - Los dos kits completos: la ficha de cada actividad, con su rango.
  - Manual MM pp. 47–55 y 67.
  - *Earth Tribe* pp. 14–15 y 26.
  - *Guía de Clan* p. 37.
  - Los manuales de cada desafío, para el reconocimiento.
  - Armar el mapa cerrado nombre → página → rango.
- [x] **Step 2: Escribir las pruebas que deben fallar** y verlas fallar porque el curso no existe.
- [x] **Step 3: Escribir el diseño y el JSON.**
  - **L1, la Tribu y su viaje:** cuatro rutas; acuerdo mutuo; autoevaluación de 15+; cuántas actividades pide cada desafío; proyecto comunitario; reconocimiento y a quién preguntar; Energía Limpia según lo que traiga el Manual.
  - **L2, Mejores Decisiones y Naturaleza:** las actividades de Champions; de la conversación a la acción con la comunidad.
  - **L3, Planeta Sano:** las actividades de Tide Turners y sus ideas de Coopera y Actúa; la autoevaluación del uso de plástico.
  - **L4, cuidados:** salidas, residuos, encuestas sin datos, autoridades, menores e imágenes.
  - **L5, «Arma tu kit»:** `missingGames` y `countLabel`.
- [x] **Step 4: Build, pruebas y fuga.** Build sin avisos, pruebas en PASS, `ciega.py` en cero. `cursos.json` en `draft` en local hasta publicar.
- [x] **Step 5: Commit**, sin push.

### Task 2: auditorías y re-auditorías

- [x] Doctrinal y pedagógica en paralelo, con las instrucciones de Rover. Cursos hermanos: la E3, la E4 y el Curso 21 de PJ (`marco-mundo-mejor-ods`).
- [x] Aplicar, re-auditar y aplicar.
- [x] Regla ciega final con dos lectores nuevos, Haiku y Sonnet: se registra.
- [x] **Paradas para el dueño:**
  - una regla protectora sin fuente que no esté en spec §6;
  - la incidencia con autoridades;
  - la recolección de datos en encuestas, si se presenta como regla.

### Task 3: publicar

- [x] Suite local, push, Pages, suite en producción.
- [x] Raíz: ADR, glosario (Tribu de la Tierra y los dos desafíos, si no tienen entrada), trazabilidad, ledger, bitácora y `ESTADO.md` si no hay cambios ajenos sin publicar.
- [x] Docs de Rover: `CLAUDE.md`, spec y memoria. **La Ruta 2 queda completa.**

### Task 4: revisión final

- [ ] Revisor nuevo con este Review Focus.
- [ ] Los hallazgos críticos e importantes se arreglan con una prueba que falle primero. Los menores se reportan al dueño.
