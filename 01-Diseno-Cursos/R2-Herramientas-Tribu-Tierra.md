# R2 · Tribu de la Tierra: el ambiente con tu comunidad (E5)

> Diseño del curso (12-10-2026, ADR-154). El JSON `05-Generador-Cursos/borradores/herramientas-tribu-tierra.json` es su traducción y **manda**. Spec: `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E5), §6 y §7. Plan: `docs/superpowers/plans/2026-10-12-rover-ruta2-e5-tribu-tierra.md`. Páginas del PDF.

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `herramientas-tribu-tierra` |
| Ruta / nivel | **Servir en la comunidad** · Nivel 2 (`route: comunidad`, `level: 2`, `branch: null`) |
| Público | Rovers de 18 a 20 años de la Regional Valle del Cauca |
| Duración | ~40 min: bienvenida, 4 lecciones de 8–9 min y «Arma tu kit» |
| Certificado | «TRIBU DE LA TIERRA: EL AMBIENTE CON TU COMUNIDAD» |
| Recomendado antes | *Servir más allá del Grupo: Mundo Mejor* (E1) |

## Gancho

> **«Tribu Tierra es la iniciativa que convoca a los jóvenes a asumir un compromiso activo con el cuidado del planeta y la acción climática.»** — *Guía de Dirigente de Clan*, 2026, p. 63.

Hilo: la quebrada del barrio que baja llena de plástico cada vez que llueve, y la junta de acción comunal que le pide ayuda al Clan. Cierra con «limpiar un sábado es fácil».

## Fuentes

- ***Kit de Acción · Desafío Champions for Nature*** (OMMS, jun-2020, en español, 69 pp.; en `SCOUTS/PROGRAMA DE JOVENES/MUNDO MEJOR/`): viaje y reconocimiento (pp. 8–9); Sé consciente · Coopera · Actúa, tres actividades para Rovers (pp. 10–12); autoevaluación 15+ (pp. 13, 18–19); fichas de 15+ y 14+ (pp. 34, 36–38, 60, 62).
- ***Kit de Acción · Desafío Tide Turners Plastic*** (OMMS, jun-2020, en español, 69 pp.): para quién (p. 6); autoevaluación del uso de plástico y cinco actividades desde los 11 (p. 11); lista por edad (p. 21); fichas de 15+ (pp. 47, 48, 50, 54, 56); formulario de la encuesta (p. 52); ideas de Coopera y Actúa (pp. 60–62).
- ***Earth Tribe – Manual de Implementación*** (OMMS, 2020, español): invitación a scouts y no scouts y el viaje (p. 14).
- ***Manual de Implementación Marco de Mundo Mejor*** (ASC, 2021): cuatro rutas (p. 47); Champions y Plastic Tide Turners (p. 48); Scouts Go Solar (pp. 49–52); YUNGA (pp. 52–55); porte (p. 67).
- ***Guía de Dirigente de Clan*** 2026: proyectos con metas SMART y alianzas (p. 37); los cuatro desafíos (p. 63).
- ***Características Esenciales del Movimiento Scout*** (OMMS): el Movimiento no se identifica con partidos políticos (p. 34).
- Política ASP 2025 (pp. 21, 26, 44), *Protocolo Nacional de Transporte* (CNGR-022-1) y Kit HeForShe (p. 43), para las reglas fijas, iguales a las de la E4.

## Decisiones de diseño

- **Los kits OMMS de 2020 son fuente de las actividades** (decisión del dueño, 12-10-2026): el Manual de la ASC remite a ellos (pp. 47–49).
- **Solo actividades cuya ficha abre la edad Rover:** cinco de Champions (pp. 34, 36, 38, 60 y 62) y cinco de Tide Turners (pp. 47, 48, 50, 54 y 56). La edad del cartel (p. 56) la da la lista (p. 21), porque la ficha no la trae. Manda el nombre de la **ficha**: «¿Cuál es tu posición sobre…?» (la lista dice «opinión») y «Regular el uso de plásticos» (la lista dice «Controlar»). Mapa cerrado en `codigo.spec`.
- **Fuera:** las de 7–14 y 11–14; *Caminando con gafas de alimentos puestas* (11+), *Descubriendo la naturaleza con iNaturalist* (13+) y *Nuestro planeta* (11+, pide Netflix) no entran al kit para dejarlo en diez.
- **Cuántas pide cada desafío:** Champions, tres para Rovers; Tide Turners, cinco desde los 11. El kit elige tres «para empezar», y lo dice.
- **Scouts Go Solar** (decisión del dueño: según el Manual): el Manual trae proceso y reconocimiento, así que se presenta como desafío sin actividades. El Rover, para ser Explorador Solar, participa en un Taller Solar **y lo replica** (p. 50). **YUNGA** se nombra (Manual pp. 52–55; *Guía de Clan* p. 63).
- **Incidencia ante autoridades** (decisión del dueño: entra con cuidado): con el adulto acompañante y la organización aliada (recomendación) y sin tomar partido (**con fuente**: *Características Esenciales*, p. 34).
- **Encuestas sin datos:** el formulario del kit trae nombre (opcional) y edad (p. 52). El curso dice que se quiten: es **recomendación** del curso. La vigila `codigo.spec`.
- **Residuos y orillas:** guantes, nada cortante con la mano, nunca solo en una orilla. **Recomendación del curso sin fuente** que protege: **queda para el dueño** (spec §6 no la cubre).
- **Kit (`kit-builder`):** 10 actividades (se eligen 3, «elegidas»), 4 frases, 8 cuidados: las mismas 4 reglas fijas de la E4 y 4 elegibles (no tomar partido, encuestas sin datos, residuos y orillas, lluvia de ideas).
- **Quizzes:** el plan del protagonista está **bien** en la 1.1, la 2.2, la 4.2 y la 5.2; sin personaje que objeta ni trío exceso / defecto / término medio.

## Lecciones

1. **La Tribu y su viaje** (~8 min): cuatro rutas y cuatro desafíos; el viaje (`timeline`); lo que pide cada desafío; lo que pudo cambiar desde 2020 y el porte.
2. **Mejores decisiones y naturaleza** (~9 min): Champions; `method-grid` de cinco; facilitar y pasar a la acción.
3. **Planeta sano: menos plástico** (~9 min): Tide Turners; `method-grid` de cinco; ideas de proyecto para la edad.
4. **Cuidados en el terreno** (~9 min): encuestas sin datos; autoridades sin tomar partido (`blockquote`); residuos, orillas, menores, imágenes, viajes y reporte.
5. **Arma tu kit** (~8 min): `kit-builder`; cierre con la quebrada; compromiso; puente al Nivel 3.

## Medición de la fuga (12-10-2026, `ciega.py`)

Ningún marcador solo en la correcta (los de siempre, más partido, Bien, Mal y Seguir). Correcta más larga en 1 de 10; ningún quiz se aprueba con la más corta ni con la más larga.
