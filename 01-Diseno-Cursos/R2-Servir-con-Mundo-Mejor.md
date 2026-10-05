# R2 · Servir más allá del Grupo: Mundo Mejor

> Diseño del curso (04-10-2026, ADR-141). El JSON `05-Generador-Cursos/borradores/servir-con-mundo-mejor.json` es su traducción. Spec: `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §3 y §6. Las páginas son del PDF.

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `servir-con-mundo-mejor` |
| Ruta / nivel | **Servir en la comunidad** · Nivel 1 (`route: comunidad`, `level: 1`, `branch: null`) |
| Público | Rovers de 18 a 20 años de la Regional Valle del Cauca |
| Duración | ~40 min: bienvenida y 4 lecciones de 9 a 10 min |
| Certificado | «SERVIR MÁS ALLÁ DEL GRUPO: MUNDO MEJOR». Acredita haber cursado; no nombra ningún cargo |
| Recomendado antes | *El servicio Rover* (tronco). F1 y F2 no se le exigen a esta ruta (spec madre) |

## Gancho (patrón 6.1)

> **«El involucramiento comunitario no busca héroes solitarios, sino ciudadanos solidarios.»**

Cita literal de la *Guía de Dirigente de Clan* 2026, §9.1, p. 54. Se enuncia en la bienvenida, se trabaja en L1 y cierra el curso en L4.

## Objetivos

1. **Distinguir** un servicio hecho con la comunidad de uno hecho por ella.
2. **Ubicar** una necesidad de la comunidad en una de las cuatro iniciativas de Scouts por los ODS.
3. **Identificar** con quién se acuerda un servicio fuera del Grupo: Consejo de Clan, adulto acompañante y organización aliada.
4. **Aplicar** las reglas de cuidado fuera del Grupo, distinguiendo la norma de la recomendación.

## Decisiones de diseño

- **No repite S1.** S1 ya enseña el lema, los tipos de servicio (para / con) y las dos rutas. Aquí se parte de ahí («En *El servicio Rover* viste…») y se cambian los casos: el parque sin luz, la vereda, la fundación del refuerzo escolar.
- **Cuatro iniciativas, no seis.** La *Guía de Clan* §11.3 anuncia «seis iniciativas» (p. 61) pero describe cuatro (pp. 61–65), las mismas cuatro áreas del *Modelo* §16.1 (pp. 98–100) y del glosario («Las cuatro iniciativas de Scouts por los ODS»). El curso lo dice. ⚠️ **S1 cita «seis iniciativas»** (L4): no es falso como cita, pero queda para revisar (hallazgo para el dueño).
- **Health Allies y Life Leaders solo se nombran** (con esos nombres: «Aliados de la Salud» y «Líderes de Vida» eran traducciones sin fuente), con sus desafíos tal como los da la *Guía de Clan* (pp. 64–65). La Asociación no publica sus materiales.
- **El «manual de proyectos de la Asociación»** que cita la *Guía de Clan* (p. 29) no está publicado: la subcategoría DNDI › Proyectos de la biblioteca está vacía (04-10-2026). No se cita.
- **El Equipo de Bolsillo - Rover** (Comisión Nacional Rover, 2025) se cita en L3 parafraseado, sin la palabra «sinodal» de su lista (p. 17), para no pisar el léxico de la plataforma.
- **Norma frente a recomendación** (spec §6, decisión del dueño del 04-10-2026): L4 separa lo que es norma (con página) de la recomendación sobre menores que no son scouts, rotulada «Recomendación de este curso».
- **Reflexiones:** ninguna pide nombres ni iniciales; piden tipos (de personas, de organización) y situaciones. La prueba `codigo.spec` «ninguna reflexión de la Ruta 2 pide nombres ni iniciales» lo vigila.

## Lecciones

### 1 · Bienvenida (intro, sin quiz)
- Caso: el Rover que quiere arreglar algo de su barrio un sábado. Gancho y su fuente. Qué es la plataforma y esta ruta. Recomendación de hacer antes *El servicio Rover*. Cómo se avanza (sin revelar la correcta, ADR-127). Objetivos.

### 2 · Hacer con, no hacer por (~9 min)
- **Idea central:** servir en la comunidad es trabajar con ella en lo que ella necesita.
- **Fuentes:**
  - «el servicio no es “hacer por”, sino “hacer con”…» (*Modelo*, p. 16);
  - el involucramiento comunitario «no es un apéndice ni una actividad más del calendario» y lo que aprenden los jóvenes ante realidades distintas (*Guía de Clan*, §9.1, p. 54);
  - «No pierdas de vista el para quién: sin destinatario real, el desafío se vacía» (*Modelo*, p. 102).
- **Caso:** el parque pintado que necesitaba luz; el servicio alternativo (acompañar a la junta a pedir el alumbrado) es ejemplo del curso.
- **Reflexión:** una necesidad de su entorno y quiénes la viven, descritos por lo que son.
- **Quiz (2):** la junta que ya sabe lo que necesita (sumarse, no volver a preguntar); la campaña de reciclaje que necesita un para quién concreto.

### 3 · Mundo Mejor y sus iniciativas (~10 min)
- **Idea central:** Scouts por los ODS ordena el servicio en cuatro iniciativas con desafíos; elegir una da marco, método y reconocimiento.
- **Fuentes:**
  - Scouts por los ODS y su relación con el servicio comunitario (*Guía de Clan*, §11.3, p. 61);
  - las cuatro áreas focales (*Modelo*, §16.1, pp. 98–100), con ejemplos: historias barriales, memoria viva y seguridad vial en Mensajeros de la Paz (p. 99), residuos, huertas y movilidad en Tribu Tierra (p. 98);
  - desafíos por iniciativa (*Guía de Clan*, pp. 62–65): Mensajeros de la Paz 5, Tribu Tierra 4, HealthAllies 2, LifeLeaders 2;
  - autoevaluación al iniciar y al terminar (*Manual de Implementación Marco de Mundo Mejor*, ASC, 2021, p. 11);
  - insignias y distinciones «atestiguan un proceso con criterios, destinatarios, reflexión y transferencia» y los desafíos como puente con el territorio (*Modelo*, §16.2, p. 101);
  - ODS «sin convertirlo en cátedra» (*Modelo*, p. 68).
- **Lectura opcional:** las lecciones «Misión y Propósito del Movimiento Scout» y «El Impacto Global del Movimiento Scout» de *Fundamentos*, nombradas sin enlace (un enlace en un `info-box` no pasa contraste en oscuro).
- **Reflexión:** con qué iniciativa se conecta su necesidad; «no encaja» también vale.
- **Quiz (2):** el recorrido de memoria con los abuelos del barrio (Mensajeros de la Paz); la cancha sin desafío elegido (el desafío enmarca, no condiciona).

### 4 · Con quién se sirve (~10 min)
- **Idea central:** fuera del Grupo se sirve con el Clan, con un adulto acompañante y con una organización aliada.
- **Fuentes:**
  - el Consejo de Clan debe «Establecer, orientar y evaluar los proyectos en los que participa el Clan, ya sean presentados por sus integrantes, red de jóvenes, u otras organizaciones» (*Guía de Clan*, p. 29);
  - los equipos de proyecto «puede[n] también incluir a otros jóvenes externos a la Asociación» (p. 29);
  - un adulto acompañante cada 7 u 8 Rovers, máximo 5 proyectos, «para cuidar el marco ético, el cuidado y el enlace, sin interferir en la autonomía propia de la Rama» (*Modelo*, p. 22);
  - Enlazar y el ejemplo del proyecto ambiental municipal (*Modelo*, §9.2.3, pp. 59–60);
  - a quién pedir asesoría (*Equipo de Bolsillo - Rover*, 2025, p. 17).
- **Sugerencias del curso** (rotuladas): cómo llegar a una organización, y preguntar por su política de protección.
- **Reflexión:** el tipo de organización que ya trabaja en su necesidad y qué podría aportarle.
- **Quiz (2):** el equipo mixto que igual pasa por el Consejo de Clan; qué le toca al adulto acompañante (presentar y seguir al tanto).

### 5 · Cuidarte y cuidar fuera del Grupo (~9 min)
- **Idea central:** el cuidado sigue al Rover afuera; unas reglas son norma, otras recomendación.
- **Norma, con fuente** (*Política Nacional A Salvo del Peligro*, 2025):
  - alcance a colaboradores externos y «organizaciones aliadas o convenios con corresponsabilidad operativa» (p. 23);
  - aplica aunque, sin representar a la Asociación, la membresía interactúe entre sí (p. 24);
  - abuso entre particulares y miembros «con ocasión de eventos, actividades, programas, proyectos» (p. 15);
  - «no cabrá la posibilidad de guardar ningún secreto…» (p. 21) y el botón «Me Pongo A Salvo del Peligro» (p. 44);
  - práctica 2+1 (p. 26) y directrices para publicar imágenes de jóvenes (p. 26); «fotos responsables» (*Modelo*, p. 71).
- **El Rover no es el adulto a cargo** ni cuenta en la proporción de adultos (glosario; *Modelo*, pp. 19 y 22).
- **Recomendación de este curso** (spec §6): con menores que no son scouts, nunca a solas; siempre con un adulto de la organización presente; adulto acompañante del Clan al tanto; seguir la política de protección de la organización aliada.
- **Norma aparte del recuadro:** el deber de reportar un posible delito contra un niño, scout o no (p. 21: «cualquier acción que represente un posible delito»), ese mismo día, y el botón (p. 44).
- **Compromiso:** «La necesidad que vi es ___. Antes del ___ voy a preguntarle a ___ qué necesita, y lo voy a llevar a mi Consejo de Clan».
- **Reflexión:** qué situación podría dejarlo a solas con alguien y cómo evitarla.
- **Quiz (2):** la fundación que no permite fotos de los niños; el niño de la fundación que pide guardar un secreto (se reporta ese mismo día).

## Logros
1. Hacer Con · 2. Mundo Mejor · 3. Bien Acompañado · 4. Cuidado Fuera.

## Auditorías (04-10-2026)
- Doctrinal: 4 mayores (alcance de la Política p. 23 con su condición; el deber de reportar fuera del recuadro; nombres Health Allies / Life Leaders con fuente; caso del secreto) y menores, aplicados. Re-auditoría: 1 mayor (distractor de seguridad vial defendible) y 4 menores, aplicados.
- Pedagógica: regla ciega 8/8 en la primera vuelta y 3–4/4 en la segunda (fuga de tesis y de convergencia); los 8 ítems se reescribieron dos veces.

## Medición de la fuga (04-10-2026, `ciega.py`)
Tras la segunda vuelta: ningún marcador solo en la correcta (adulto, Consejo de Clan, organización, pregunt, acord, sin, solo, Política, fundación, porque, junta, comunidad); sin fuga de apertura; correcta más larga en 3 de 8; ningún quiz se aprueba eligiendo siempre la más corta.

## Validación contra el marco
Knowles adaptado a 18–20: cada lección dice para qué y parte de un caso del entorno del Rover. Lecciones de 9 a 10 minutos. Quizzes de aplicación con distractores que son errores reales (asistencialismo, decidir solo, quedarse a solas, guardar el secreto). Cierra con un compromiso conversable con el Clan.
