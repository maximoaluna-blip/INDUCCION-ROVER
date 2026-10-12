# Rover · Ruta 2, entrega E4 «Mensajeros de la Paz: género y patrimonio» — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** publicar `herramientas-genero-patrimonio`, el segundo curso de herramientas (Nivel 2) de la Ruta 2, con su `kit-builder`, para el Rover que va a servir en su comunidad con los desafíos **HeForShe** o **Patrimonito**.

**Architecture:** curso de contenido sobre lo que ya existe, con el molde de la E3 (`herramientas-paz-dialogo`): bienvenida, cuatro lecciones, «Arma tu kit» y certificado. `kit-builder` sin cambios: rótulos en `labels`, incluido `missingGames` si lo que se elige no son «juegos». Sin tipos nuevos ni cambios de motor, build o portada.

**Tech Stack:** JSON → `build-course.js` → HTML; Playwright; `ciega.py`.

**Spec:** `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E4), §6 y §7.

## Global Constraints

- **Datos del curso:** `courseId: "herramientas-genero-patrimonio"`, título «Mensajeros de la Paz: género y patrimonio», `route: "comunidad"`, `level: 2`, `branch: null`, 40 min. Certificado: «MENSAJEROS DE LA PAZ: GÉNERO Y PATRIMONIO».
- **Fuentes, solo de la ASC y la OMMS:**
  - *Kit de Acción HeForShe* (ASC con ONU Mujeres, jun-2021, 86 pp.).
  - *Kit de Acción Patrimonito* (ASC, jun-2021, 26 pp.).
  - *Manual de Implementación Marco de Mundo Mejor* (2021): §4.3 HeForShe, pp. 27–37; §4.4 Patrimonito, pp. 38–46; porte de insignias, p. 67.
  - *Modelo* 2026: cap. 14 Coeducación, pp. 90–91; Mensajeros de la Paz, p. 99; consentimiento informado, p. 71.
  - Política ASP 2025.
  - **Referencia ya auditada:** los Cursos 23 y 24 de PJ (`kit-heforshe-genero`, `kit-patrimonito-patrimonio`), con sus discrepancias registradas.
- **Foco de HeForShe, por decisión del dueño (Curso 23, ADR-108):** igualdad, estereotipos, prevención de violencias basadas en género y masculinidades. La identidad de género y los derechos sexuales y reproductivos (parte B del Clan, pp. 75–78) **se nombran, no se enseñan**. Si una actividad para mayores de 18 va más allá de ese foco en un tema divisivo, **se para y se consulta**.
- **Actividades para el Rover:** solo las que los kits marcan para Clan o mayores de 18, con su página. Se verifican en la Task 1. HeForShe ya trae «Resistimos callando» y «Feria del género» (p. 69) y «Caminos de prevención» (p. 71). En Patrimonito, la edad es de 15 años hasta la Rama Rover (Kit p. 4).
- **Patrimonito:**
  - solo en sitios reconocidos por la UNESCO, incluida la lista tentativa (Kit p. 6 y p. 8; Manual p. 42);
  - 80 horas de servicio en el sitio (p. 6);
  - el curso dice qué sitios hay en el Valle del Cauca o cerca, **solo si una fuente del corpus los nombra**;
  - viajar y pernoctar se rige por el Protocolo Nacional de Transporte y el protocolo del Grupo o la Región, igual que en el Curso 24;
  - la seguridad en el sitio, sin fuente, es **recomendación**.
- **Requisitos del que acompaña:**
  - el Manual pide el **taller nacional HeForShe** y el curso A Salvo del Peligro (p. 29);
  - se presentan como lo que pide el Manual, igual que en la E3 (ADR-146), y se le reporta al dueño.
- **Cuidados con norma:**
  - ante una revelación de violencia, no se guarda el secreto y se reporta: Política p. 21 y botón p. 44;
  - casos inventados, no historias propias: el Kit pide relatos de violencias vividas en otras ramas (Curso 23, discrepancia 6);
  - con no scouts, un adulto de la organización presente; con menores scouts, la estrategia 2+1, en la que el Rover no cuenta como adulto;
  - imágenes: el Kit manda publicar con #HeForSheASC, pero pide autorización (p. 43); se aplican las directrices de la Política p. 26.
- **Reglas Rover:**
  - nada de «sinodal», «ayudante» ni «dirigente» como rol del Rover; nunca «18–22»;
  - el Rover no cuenta como adulto;
  - las reflexiones no piden nombres, iniciales, confidencias ni violencias vividas;
  - el kit queda en el navegador.
- **Quizzes:**
  - criterios de `SKILL.md`;
  - fuga de forma en cero (`ciega.py`);
  - **sin personaje que objeta y siempre se equivoca**, y **sin el patrón exceso / defecto / término medio**: son las lecciones de la E3.
  - **Regla ciega:** se mide con dos lectores nuevos de modelos distintos (ADR-148) y se registra; no se persigue más allá de una vuelta de ajuste.
- **Coordinación:**
  - ADR reservado en voz alta al empezar (el siguiente libre al escribir esto es el 150);
  - suite en serie con aviso;
  - raíz con turno y commit con pathspec.

## Review Focus

1. **Una actividad del Kit HeForShe de la parte B o de otra rama, presentada como del Rover.** La prueba de la Task 1 compara página y nombre contra un mapa cerrado, en el kit y en la lista de la lección, como en la E3.
2. **Un tema divisivo enseñado en vez de nombrado** (derechos sexuales y reproductivos, identidad de género). La prueba estática de la Task 1 busca en las secciones los términos que el foco solo nombra; la auditoría doctrinal confirma el contexto.
3. **Un sitio de Patrimonito sin reconocimiento de la UNESCO presentado como válido.** Lo revisa la auditoría doctrinal con la lista del Kit (p. 8).
4. **Una reflexión, el registro o el compromiso que piden contar una violencia vivida.** Se reutiliza la red de la E3 (`VIVIDA`) sobre los tres textos.
5. **Una recomendación presentada como regla fija.** La fuente de cada regla tiene que empezar por la norma, como en la E3.

---

### Task 1: diseño, JSON y pruebas

**Files:**
- Create: `01-Diseno-Cursos/R2-Herramientas-Genero-Patrimonio.md`.
- Create: `05-Generador-Cursos/borradores/herramientas-genero-patrimonio.json`.
- Test: `PRUEBAS-E2E/tests/codigo.spec.js`, bloque `// --- E4 género y patrimonio ---`, con los puntos 1, 2, 4 y 5 del Review Focus.

- [x] **Step 1: Leer las fuentes con página.**
  - Kit HeForShe: lo del Clan y los mayores de 18, la parte B, pp. 7–14 y 80–83.
  - Kit Patrimonito, completo.
  - Manual pp. 27–46 y 67.
  - Diseños y JSON de los Cursos 23 y 24 de PJ.
  - Armar el mapa cerrado página → nombre de las actividades del Rover.
- [x] **Step 2: Escribir las pruebas que deben fallar** y verlas fallar porque el curso no existe.
- [x] **Step 3: Escribir el diseño y el JSON.**
  - L1: los dos desafíos y su ruta (Emisor y Embajador; insignia de Patrimonito y sus 80 h).
  - L2: igualdad y coeducación con las actividades de HeForShe.
  - L3: patrimonio con la comunidad, con las herramientas de Patrimonito.
  - L4: cuidados.
  - L5: «Arma tu kit».
- [x] **Step 4: Build, pruebas y fuga.** Build sin avisos, pruebas en PASS, `ciega.py` en cero.
- [x] **Step 5: Commit**, sin push.

### Task 2: auditorías y re-auditorías

- [x] Doctrinal y pedagógica en paralelo, con las instrucciones de Rover. Cursos hermanos: la E3 y los Cursos 23 y 24 de PJ.
- [x] Aplicar, re-auditar y aplicar.
- [x] Regla ciega final con dos lectores, Haiku y Sonnet: se registra.
- [x] **Paradas para el dueño:**
  - un tema divisivo fuera del foco;
  - una regla protectora sin fuente que no esté en spec §6;
  - el requisito del taller nacional HeForShe para el Rover.

### Task 3: publicar

- [ ] Suite local, push, Pages, suite en producción, raíz (ADR, glosario si hace falta, trazabilidad, ledger, estado, bitácora) y docs de Rover.

### Task 4: revisión final

- [ ] Revisor nuevo con este Review Focus.
- [ ] Los hallazgos críticos e importantes se arreglan con una prueba que falle primero. Los menores se reportan al dueño.
