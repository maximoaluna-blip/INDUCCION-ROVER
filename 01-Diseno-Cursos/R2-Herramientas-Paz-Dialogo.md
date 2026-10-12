# R2 · Mensajeros de la Paz: paz y diálogo (E3)

> Diseño del curso (12-10-2026, ADR-146). El JSON `05-Generador-Cursos/borradores/herramientas-paz-dialogo.json` es su traducción y **manda**. Spec: `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E3), §6 y §7. Plan: `docs/superpowers/plans/2026-10-05-rover-ruta2-e3-paz-dialogo.md`. Páginas del PDF.

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `herramientas-paz-dialogo` |
| Ruta / nivel | **Servir en la comunidad** · Nivel 2 (`route: comunidad`, `level: 2`, `branch: null`) |
| Público | Rovers de 18 a 20 años de la Regional Valle del Cauca |
| Duración | ~40 min: bienvenida, 4 lecciones de 8–9 min y «Arma tu kit» |
| Certificado | «MENSAJEROS DE LA PAZ: PAZ Y DIÁLOGO» |
| Recomendado antes | *Servir más allá del Grupo: Mundo Mejor* (E1) |

## Gancho

> **«El objetivo del diálogo es superar los malentendidos y disipar los estereotipos para aumentar la comprensión mutua.»** — *Manual de Implementación Marco de Mundo Mejor*, ASC, 2021, p. 21. Cierra con su continuación: comprender no es estar de acuerdo (p. 21).

Hilo: la junta de un barrio donde los de la parte alta y los de la parte baja no se ponen de acuerdo sobre el salón comunal.

## Fuentes

- ***Kit de Acción Constructores de Paz*** (ASC, jun-2021, 69 pp.; en `SCOUTS/PROGRAMA DE JOVENES/2026/`): qué es y a quién va (p. 5); tres etapas (pp. 5, 8–9); viaje con acuerdo mutuo jóvenes–adultos (pp. 6–7); tres actividades desde los 11 (p. 9); actividades opcionales y adaptables (p. 19); áreas personal y comunidad (pp. 21, 48); autoevaluación de mayores de 18 (pp. 17–18); **las siete actividades marcadas «Mayores de 18 años»**: La Declaración (p. 40), Creando un mapa (p. 42), Empiezo a ser consciente de mis emociones (p. 44, con la práctica de p. 45), Reconociendo (p. 46), Punto en el conflicto (p. 62), ¿Qué lugar ocupan las emociones? (p. 64), Propuesta de proyecto (p. 67).
- ***Manual de Implementación Marco de Mundo Mejor*** (ASC, 2021): Diálogos por la Paz (pp. 20–26): qué es el diálogo y qué no (pp. 21–22), Escuchar – Reconocer – Hacer (p. 22), desde los 7 hasta Rover (p. 21); su kit **no está en el corpus**. Recomendaciones de uso: haber completado el curso A Salvo del Peligro para acompañar sus actividades, posición de poder y preguntas abiertas (p. 6); reglas con quienes participan (p. 29, **de las recomendaciones para HeForShe**, que aquí también sirven); porte de la insignia solo con reconocimiento de la Comisión Nacional (p. 67).
- ***Política Nacional A Salvo del Peligro*** (2025): revictimización (p. 15), no guardar secretos ante un posible delito (p. 21), botón (p. 44), práctica 2+1 e imágenes (p. 26).
- ***Modelo de Aplicación*** 2026: consentimiento informado (p. 71).
- **Curso 22 de PJ** (`kit-constructores-paz`, ADR-105): los seis cuidados de la memoria, **adaptados** a la comunidad: con quien no es scout, **un adulto de la organización** presente (spec §6); con un menor scout, la **estrategia 2+1**, en la que el Rover no cuenta como adulto (Política p. 26).

## Decisiones de diseño

- **Solo actividades del Clan.** El Kit mezcla rangos en la misma página; el curso solo ofrece las siete marcadas «Mayores de 18». Lo vigila `codigo.spec` («las actividades del kit de paz y diálogo son las del Clan»).
- **Manual Nansen fuera** (decisión del dueño, ADR-141); de Diálogos por la Paz se enseña solo lo que trae el Manual.
- **El Kit no trae salvaguardas** para la memoria del conflicto: los cuidados son recomendación con fuentes y se dice. El deber de reportar un posible delito va **aparte, como norma** (p. 21, decisión del dueño, ADR-145).
- **Insignia:** procedimiento no escrito → comisión de Mundo Mejor (como el Curso 22).
- **Kit (`kit-builder`):** 7 actividades (se eligen 3, como pide el Kit), 4 frases de facilitación, 8 cuidados: 4 reglas fijas con Política/Modelo y 4 elegibles con Kit, Manual o «recomendación». Lo vigila `codigo.spec`.
- **Reflexiones:** casos y no historias propias; ninguna pide una violencia vivida (lo vigila `codigo.spec`), nombres ni iniciales.
- **Quizzes:** en cada quiz un ítem con la polaridad invertida (la correcta es el Rover actuando; los distractores, la tesis por exceso): empezar sin esperar a la comisión; adaptar el test; ayudar a escribir el acuerdo; mantener la memoria; mantener la regla de reportar.

## Lecciones

1. **El desafío y su ruta** (~8 min): qué es; tres etapas (`timeline`); cómo se recorre (acuerdo, autoevaluación de +18, tres actividades, proyecto); reconocimiento; Diálogos por la Paz como otro desafío.
2. **Las actividades para mayores de 18** (~9 min): `method-grid` de las siete con página y tiempo; del Clan a la comunidad (adaptar, p. 19); las dos que piden más cuidado.
3. **Facilitar el diálogo** (~9 min): definición (p. 21, `blockquote`); lo que no es; Escuchar – Reconocer – Hacer; reglas con ellos, preguntas no sentencias, después de escuchar, hacer.
4. **Cuidar a quien recuerda** (~9 min): revictimización; cinco cuidados adaptados; lo que no es recomendación (reportar, botón; no eres terapeuta ni el adulto a cargo).
5. **Arma tu kit** (~8 min): `kit-builder`; compromiso «Antes del ___ voy a usar ___ con ___, y nunca voy a ___».

## Auditorías (12-10-2026)
- **Doctrinal:** 5 mayores (un adulto de la organización; pista para distinguir qué se reporta en un taller de memoria; la p. 29 es de HeForShe; el curso ASP que pide el Manual p. 6 —se presenta como lo que dice el Manual, para el dueño—; glosario) y 8 menores. Re-auditoría: 2 mayores (las actividades +18 también sirven de 15 a 18; la 2+1 con menores scouts, sin contar al Rover) y 4 menores, aplicados.
- **Pedagógica:** regla ciega 5/5 en dos vueltas (y un lector Haiku 10/10 dos veces): «el que objeta en el enunciado se equivoca», la correcta en el término medio y la oveja negra de actitud. Se reescribieron 8 ítems y luego se hizo un cambio por quiz; la propia auditoría la da por **estructural** en un curso de tesis única.
- Info-box nuevo sobre la edad del grupo; registro sin historias; objetivo «Ubicar»; «Reglas y cuidados fijos».

## Regla ciega final (12-10-2026, ADR-148: dos lectores nuevos de modelos distintos)
- **Haiku: 4 de 5 quizzes (9/10).** Solo falló el ítem con la correcta «A medias».
- **Sonnet: 5 de 5 (10/10).**
- Se registra, no se persigue: en un curso de tesis única (no tomar partido, no sacar el relato, nunca a solas) la opción matizada gana a ciegas. Es el mismo techo que DI y PJ.

## Medición de la fuga (12-10-2026, `ciega.py`)
Ningún marcador solo en la correcta (adulto, organización, pregunt, acord, sin, Política, porque, junta, comunidad, Kit, grupo); correcta más larga en 3 de 10; ningún quiz se aprueba con la más corta.
