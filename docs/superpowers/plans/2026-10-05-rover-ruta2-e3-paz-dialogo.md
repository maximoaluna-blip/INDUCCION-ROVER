# Rover · Ruta 2, entrega E3 «Mensajeros de la Paz: paz y diálogo» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publicar `herramientas-paz-dialogo`, el primer curso de herramientas (Nivel 2) de la Ruta 2, con su `kit-builder`, para el Rover que va a servir en la comunidad con el desafío Constructores de Paz o con el método de Diálogos por la Paz.

**Architecture:** es un curso de contenido sobre lo que ya existe.
- Toma el molde de los cuatro `herramientas-*` de la Ruta 1: bienvenida, cuatro lecciones, «Arma tu kit» y certificado.
- Usa el `kit-builder` sin cambios: sus tres partes (`games`, `phrases`, `care`) se rotulan desde `labels`.
- No hay tipos de sección nuevos, ni cambios en el motor, en el build ni en la portada.

**Tech Stack:** JSON → `05-Generador-Cursos/build-course.js` → HTML; Playwright (`PRUEBAS-E2E`); `ciega.py` en el scratchpad.

**Spec:** `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E3), §6 y §7.

## Global Constraints

- **Datos del curso:**
  - `courseId: "herramientas-paz-dialogo"`, título «Mensajeros de la Paz: paz y diálogo», `route: "comunidad"`, `level: 2`, `branch: null`, 40 min.
  - Certificado: `courseName` «MENSAJEROS DE LA PAZ: PAZ Y DIÁLOGO».
- **Fuentes:** solo de la ASC y de la OMMS.
  - *Kit de Acción Constructores de Paz* (ASC, jun-2021), en `DOCUMENTOS BASE/SCOUTS/PROGRAMA DE JOVENES/2026/`.
  - Diálogos por la Paz según el *Manual de Implementación Marco de Mundo Mejor* (2021, pp. 20–26: Escuchar – Reconocer – Hacer).
  - *Modelo* 2026 §16.1 y *Guía de Clan* §11.3.
  - **El manual Nansen queda fuera** por decisión del dueño, igual que cualquier actividad de Diálogos por la Paz que no esté en el Manual MM, porque su kit no está en el corpus.
- **Actividades para el Rover:** solo las del kit marcadas «Mayores de 18 años», con su página. A la fecha del plan son:
  - La Declaración (p. 40);
  - Creando un mapa (p. 42);
  - Empiezo a ser consciente de mis emociones (p. 44);
  - Reconociendo (p. 46);
  - las de la etapa de comunidad que digan «CLAN: + 18 años» (desde la p. 48);
  - Propuesta de proyecto (p. 67).
  - La autoevaluación de mayores de 18 está en las pp. 17–18.
- **Cuidados:** se reutilizan los seis de la memoria del conflicto de PJ (ADR-105, Curso 22), adaptados a la comunidad y rotulados como recomendación armada con fuentes. **Son norma, con su página:** no guardar secretos ante un posible delito (Política ASP p. 21) y el botón (p. 44).
- **Reglas Rover:**
  - nada de «sinodal», «ayudante» ni «dirigente» como rol del Rover, y nunca «18–22»;
  - el Rover no cuenta como adulto;
  - reflexiones sin nombres, iniciales ni confidencias; **casos, no historias propias** (el kit pide relatos de violencia y no trae salvaguardas);
  - el kit queda en el navegador.
- **Quizzes:**
  - criterios de `SKILL.md`;
  - **en cada quiz, un ítem con la polaridad invertida**: la correcta es el Rover actuando y los distractores son la tesis leída por exceso (lección del ADR-142);
  - fuga de forma en cero con `ciega.py`;
  - regla ciega medida y anotada.
- **Coordinación:**
  - ADR reservado en voz alta al empezar (el siguiente libre al escribir esto: 146);
  - suite en serie con aviso;
  - raíz con turno y commits con pathspec.

## Review Focus

1. **Una actividad del kit para menores de 18 presentada como del Rover.** El kit mezcla rangos en la misma página. La prueba en la Task 1 revisa que cada `game` cite una página que el diseño `.md` marque como «Mayores de 18».
2. **Un cuidado que el kit no trae, presentado como norma.** La prueba estática en la Task 1 revisa que toda regla fija (`rule: true`) del `care` lleve una `source` con la palabra «Política» o «Modelo», y que las demás digan «recomendación».
3. **Una reflexión que pide contar una violencia vivida.** La prueba estática en la Task 1 busca `/viviste|te pasó|tu historia|has sufrido/` en los enunciados de las reflexiones.
4. **El curso en la portada.** Debe aparecer en el Nivel 2 de la ruta comunidad sin el filtro de ramas. Lo cubren la prueba de portada que ya existe y la de `branch` (ADR-145).

---

### Task 1: diseño, JSON y pruebas

**Files:**
- Create: `01-Diseno-Cursos/R2-Herramientas-Paz-Dialogo.md`, con el molde de `H-Comunidad-Herramientas.md`.
- Create: `05-Generador-Cursos/borradores/herramientas-paz-dialogo.json`.
- Test: `PRUEBAS-E2E/tests/codigo.spec.js`, bloque `// --- E3 paz y diálogo ---` con los tests del Review Focus 1 a 3.

- [ ] **Step 1: Leer las fuentes con página.**
  - El kit completo, en especial pp. 5–19 (etapas, viaje, autoevaluación), 21, 40–47, 48 y siguientes, y 67.
  - Manual MM pp. 20–26.
  - Los seis cuidados del Curso 22 de PJ (ADR-105, en `DECISIONES.md`) y su JSON.
  - El kit, `herramientas-comunidad.json`, para el molde y los límites del `kit-builder`.
- [ ] **Step 2: Escribir las pruebas que deben fallar** (los tres del Review Focus) y verlas fallar porque el curso todavía no existe.
- [ ] **Step 3: Escribir el diseño y el JSON.**
  - L1: el desafío y su ruta (etapas Toma conciencia – Comparte – Actúa, acuerdo mutuo, autoevaluación y reconocimiento).
  - L2: actividades para mayores de 18.
  - L3: facilitar el diálogo (Escuchar – Reconocer – Hacer, preguntas abiertas, no tomar partido).
  - L4: cuidados de la memoria del conflicto.
  - L5: «Arma tu kit».
- [ ] **Step 4: Build, pruebas y fuga.** El build tiene que salir sin avisos; la prueba en PASS; `ciega.py` en cero.
- [ ] **Step 5: Commit**, sin push.

### Task 2: auditorías y re-auditorías

- [ ] Auditoría doctrinal y pedagógica en paralelo, con las instrucciones de Rover. Los cursos hermanos son `herramientas-comunidad`, `servir-con-mundo-mejor` y el Curso 22 de PJ.
- [ ] Aplicar las correcciones y medir de nuevo la fuga.
- [ ] Re-auditoría de lo corregido, aplicar los cambios y hacer commit.
- [ ] **Paradas para el dueño:**
  - una regla protectora sin fuente que no esté en spec §6 ni en los seis cuidados;
  - un contenido del kit que va más allá del foco en un tema divisivo.

### Task 3: publicar

- [ ] Suite local, push, Pages y suite contra producción.
- [ ] Turno de raíz:
  - ADR, glosario si aparece un término nuevo, trazabilidad, ledger, `generar-estado.py`, bitácora y verificadores;
  - commit con pathspec y aviso al soltar.
- [ ] Docs de Rover y memoria.

### Task 4: revisión final

- [ ] Revisor nuevo sobre el diff (sin los HTML compilados), con este Review Focus.
- [ ] Los críticos e importantes se arreglan con una prueba que falle primero. Los menores se reportan al dueño.
