# H-tropa · Herramientas para la Tropa

> Diseño del curso (28-09-2026, ADR-106). JSON: `05-Generador-Cursos/borradores/herramientas-tropa.json`. Spec: `docs/superpowers/specs/2026-09-28-rover-nivel2-herramientas-design.md`. Molde: `H-Familia-Herramientas.md` y `H-Manada-Herramientas.md`. Es el único curso del Nivel 2 con **técnica fuerte**, porque la Guía de Tropa sí la trae.
>
> **Auditado** (doctrinal y pedagógica, 28-09-2026) y corregido; ver la bitácora del ADR-106.
>
> **Nace con lo que dejaron las cuatro auditorías anteriores:**
> - sin cláusula justificativa solo en los distractores;
> - sin «sin + infinitivo» solo en la correcta;
> - sin tesis única: hay preguntas donde el error es **dejarlos solos**;
> - vocabulario («dirigente», «Jefe de Tropa», «de inmediato») repartido;
> - normas fijas en el kit **solo si son norma con fuente**;
> - peligro inmediato según la *Guía de Prevención* p. 27;
> - con las familias, el avance lo cuenta el dirigente.
>
> **Qué no repite del Nivel 1** (`servir-en-tropa`): las características de 11 a 14 años, la patrulla y el guía elegido por ellos, la Aventura, la Promesa al Guía, la especialidad nueva con su sinodal, la frontera digital en tres gestos, los seis elementos de gestión del riesgo, ni sus casos (chiste sobre el estirón, «esa norma no tiene sentido», «sé tú el guía», Halcones, insignia de fotografía, acoso por chat, fotos, «va el Rover», quebrada, fiebre).

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `herramientas-tropa` |
| Ruta / nivel | Ruta 1 · Nivel 2 · Tropa (`route: grupo`, `level: 2`, `branch: tropa`) |
| Público | Rovers de 18 a 20 años que ya sirven, o van a servir, en la Tropa |
| Duración | ~40 min: bienvenida y 5 lecciones (la del kit, 12 min) |
| Fuentes | ***Guía de Dirigente de Tropa*** (ASC 2026) · ***Manual de Especialidades para Tropa*** (ASC, DNPJ, 2019) · ***Guía de Prevención y Atención del Daño*** (V3 2021) · ***Política Nacional A Salvo del Peligro*** (dic-2025): pp. 21, 26, 29 y 44. Todas las páginas son del PDF |
| Recomendado antes | `servir-en-tropa` (Nivel 1) |

## Gancho

> **«Lo importante no es darles todas las respuestas, sino enseñarles a buscar soluciones, evaluar opciones y aprender de los errores.»**

Cita literal de la Guía, p. 14. Recorre todo el curso: el juego que ellos ajustan, la técnica que aprenden haciendo, la retroalimentación que no humilla. Aparece en la bienvenida, en la lección de técnica (como cita) y en el cierre.

## Objetivos

1. **Proponer y ajustar** un juego que rete a adolescentes, con reglas que ellos puedan modificar.
2. **Acompañar** el aprendizaje de la técnica scout sin hacerlo por ellos ni dejarlos solos, y **asesorar** una especialidad por la vía que fija el Manual.
3. **Dar retroalimentación** que reconozca el esfuerzo y convierta el error en mejora.
4. **Reconocer** señales de alerta y **responder** sin investigar.
5. **Armar** tu kit.

## Decisiones de diseño

- **Técnica.** La Guía la pide (p. 33-34): campismo básico, orientación y exploración, cocina al aire libre, nudos y amarras, primeros auxilios y seguridad. El curso **no enseña los nudos** (las tablas de la *Bitácora* son imágenes): enseña **cómo acompañar** que la patrulla los aprenda, y remite a la *Bitácora Scout* y al *Manual de Especialidades*.
- **Especialidades.** Según el *Manual* 2019, entre quienes pueden asesorar una especialidad están los «Hermanos Scouts mayores o de otras ramas que ya sean especialista» (p. 6). A esa persona el Manual la llama **sinodal**: arma con el scout tareas y tiempos, lo asesora y certifica (p. 5). El curso lo dice con ese sentido —una tarea puntual, no un cargo— y el paso es que el scout se lo informe a su **Jefe de Tropa** (pp. 5-6). Lo que el Rover hace en cada fase (Descubrir, Experimentar, Compartir) es recomendación del curso.
- **Normas fijas del kit, con fuente:**
  - la estrategia 2+1, también por chat (Política p. 26);
  - no guardar una señal (Política p. 21) y el botón (p. 44);
  - ante peligro inmediato, Policía o centro de salud (*Guía de Prevención* p. 27);
  - las fotos: antes de publicar, las directrices del Grupo; si no las conoce, pregunta y no publica (Política p. 26).
- **Criterio del costo del error** (recomendación del curso, auditoría pedagógica H3): error barato → dejarlos equivocarse y conversar al evaluar (Guía p. 26); error que toca salud o seguridad → una pregunta a tiempo y, si no lo ven, avisar al dirigente (p. 33).

## Lecciones

### 1 · Bienvenida (intro)

### 2 · Juegos que retan (~7 min)
- **Fuentes:**
  - cómo cambia el juego a esta edad y sus tipos: estrategia, roles y simulación, cooperativos con elementos competitivos, con tecnología (p. 25);
  - «los juegos con claves les encantarán» (p. 14);
  - facilitarlo «como adolescentes, no como niños», dejar que modifiquen reglas, conectar con objetivos y facilitar la reflexión (p. 25);
  - actividades diversas (p. 25).
- **Cuando el juego no funciona** (recomendación del curso): «es de niños»; la competencia se vuelve burla; quieren cambiar las reglas.
- **Quiz (2):** la patrulla que gana y se burla (un reto cooperativo contra el reloj; distractores: que la perdedora cambie las reglas a su gusto, repetir con sermón); y el juego terminado sin cierre (preguntar qué estrategia funcionó; distractores: charla, pasar de largo).

### 3 · Técnica: aprender haciendo (~7 min)
- **Fuentes:**
  - la naturaleza como laboratorio: cocinar, armar la carpa, orientarse con brújula (p. 33);
  - las cinco áreas de técnica y su valor: «autonomía, trabajo en equipo, confianza…» (pp. 33-34);
  - acompañar sin sobreproteger (p. 26);
  - el gancho (p. 14);
  - campamentos de bajo impacto (p. 34);
  - especialidades: fases Descubrir, Experimentar y Compartir; quién puede acompañar; el paso por el Jefe de Tropa (*Manual* pp. 4-6).
- **Quiz (3):** la carpa floja con lluvia anunciada (error caro: una pregunta a tiempo); la cocina lejos del agua (error barato: dejarlos y conversar al evaluar); y el scout en Descubrir que pide «cuéntame tú todo» (armar con él sus preguntas).

### 4 · Hablar para que crezcan (~6 min)
- **Fuentes:**
  - escuchar sin minimizar emociones, lenguaje positivo, retroalimentación constructiva y espacios de diálogo (p. 58);
  - reconocerlos «por lo que son y no solo por lo que hacen» (p. 14);
  - decidir y asumir las consecuencias (p. 15);
  - con las familias, el dirigente informa (p. 58).
- **Quiz (2):** el amarre que se suelta frente a todos (reconocer lo logrado y mostrar aparte qué ajustar); y la ruta larga que eligió la patrulla y el guía que dice «tenías razón» (preguntarles qué les dejó y qué decidirían ahora).

### 5 · Cuidar: lo que ves y lo que haces (~7 min)
- **Fuentes:**
  - A Salvo del Peligro en la Tropa (p. 66);
  - vida digital: ciberacoso y pérdida de privacidad (p. 15);
  - señales (*Guía de Prevención* pp. 24-27): temor al contacto físico con adultos (p. 24), llanto constante, agresividad con otros, extrema falta de confianza (p. 25); los cambios de ánimo de la edad (Guía de Tropa p. 14) solos no son señal (recomendación: mirar lo que se repite);
  - peligro inmediato (p. 27);
  - primeros auxilios psicológicos (pp. 20-23);
  - Política pp. 21, 29 y 44.
- **Quiz (2):** el scout conversador que lleva cuatro reuniones callado y se sobresalta al contacto de un adulto (contarlo de inmediato, tal como lo vio); y el corte con navaja y la vergüenza (avisar para curarlo y quedarse a su lado).

### 6 · Arma tu kit (~12 min)
- **`kit-builder`:**
  - 7 juegos o tipos de juego con fuente;
  - 4 situaciones (una por lección: pedir que se lo hagas, la discusión en la cocina, «soy un inútil», el miedo en la caminata nocturna);
  - 4 normas fijas y 3 puntos a elegir.
- **Compromiso:** «En la Tropa voy a proponer ___ y a decir ___, y nunca voy a ___».
- **Quiz (2):** el juego con claves de tu kit que dos patrullas resuelven en diez minutos (subir el reto y orientar a la tercera con una pregunta); y cuál juego del kit llevar a un salón pequeño para practicar decidir (el de estrategia con una regla que cambia cada patrulla).

## Logros
1. Juego que Reta · 2. Mano que Enseña · 3. Palabra que Construye · 4. Mirada que Cuida · 5. Siempre Listo.
