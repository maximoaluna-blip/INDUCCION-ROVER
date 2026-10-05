# Ruta 2 «Servir en la comunidad» (Mundo Mejor) — diseño

**Fecha:** 2026-10-04 · **Estado:** aprobado por el dueño sección por sección (sesión «Curso de inducción Rover»), pendiente de su lectura de este documento · **Spec madre:** `2026-09-27-rover-ruta-servicio-design.md` · **ADR:** cada entrega reserva el suyo en voz alta (el siguiente libre al escribir esto: 141).

## 1. Qué se construye y para qué

La segunda ruta de la plataforma de servicio Rover (ADR-086): para el Rover de 18 a 20 años que quiere **servir en su comunidad, fuera del Grupo**, con las iniciativas de Mundo Mejor. Debe salir sabiendo qué es servir *con* la comunidad, en qué iniciativa enmarca su servicio, con quién lo acuerda, cómo cuida a las personas con las que trabaja, y con un plan de proyecto acordado.

**Decisiones del dueño (04-10-2026):**

| Pregunta | Decisión |
|---|---|
| Forma de la ruta | Espejo de la Ruta 1: Nivel 1 Conocer, Nivel 2 Herramientas, Nivel 3 Proyecto |
| Nivel 1 | Un solo curso general (la diferencia por edades que justificó un curso por rama en la Ruta 1 aquí no existe) |
| Nivel 2 | Tres cursos **alineados con la agrupación oficial** (*Modelo* §16.1, pp. 98–100): Tribu Tierra; Mensajeros de la Paz · paz y diálogo; Mensajeros de la Paz · género y patrimonio |
| Nivel 3 | **Curso hermano** de S2, no S2 con dos escenarios: no toca el motor, ni el S2 publicado, ni sus certificados |
| Menores que no son scouts | **Recomendación declarada** (ver §6) |
| Manual Nansen | **Fuera.** Está en el corpus sin origen conocido, no es de la ASC ni de la OMMS y ningún documento ASC lo cita |
| Orden de entrega | **Los extremos primero**: general, proyecto, y luego los ejes |

Esto **corrige la spec madre** en un punto: el Nivel 3 de la Ruta 2 deja de ser «S2 con escenario en la comunidad» y pasa a ser el curso hermano. El ADR de la E2 lo registra.

## 2. Estructura y catálogo

| Entrega | Nivel | `courseId` | Título | Duración |
|---|---|---|---|---|
| E1 | 1 | `servir-con-mundo-mejor` | Servir más allá del Grupo: Mundo Mejor | 40 min |
| E2 | 3 | `mi-proyecto-en-la-comunidad` | Mi proyecto de servicio en la comunidad | 45 min |
| E3 | 2 | `herramientas-paz-dialogo` | Mensajeros de la Paz: paz y diálogo | 40 min |
| E4 | 2 | `herramientas-genero-patrimonio` | Mensajeros de la Paz: género y patrimonio | 40 min |
| E5 | 2 | `herramientas-tribu-tierra` | Tribu Tierra: ambiente | 40 min |

- Todos con `route: "comunidad"` y `branch: null`. La portada ya pinta la ruta `comunidad` cuando tiene un curso activo; con tres tarjetas en el Nivel 2 no hace falta filtro por eje, así que **la portada no cambia**.
- Ningún título usa «Comunidad» a secas: es el nombre de una rama (y de un curso de la Ruta 1, «Servir en la Comunidad»).
- Componentes: `kit-builder` en los ejes y `plan-builder` en el proyecto, **sin cambios**. Ningún tipo de sección nuevo.
- Ningún curso bloquea otro (ADR-019): con E1 y E2 la ruta ya se recorre de punta a punta; los ejes se suman como herramientas.
- La parte de F1 sobre misión e impacto global se ofrece desde la E1 como lectura opcional (spec madre).

## 3. E1 · Servir más allá del Grupo: Mundo Mejor

Molde de «El servicio Rover»: bienvenida con caso, cuatro lecciones con quiz y reflexión, resumen con compromiso, certificado.

- **Bienvenida:** un Rover ve una necesidad en su barrio y quiere «ir a ayudar»; el curso lo lleva de la buena intención al servicio bien hecho.
- **L1 · Hacer con, no hacer por.** El servicio comunitario «no es un apéndice» y «no busca héroes solitarios, sino ciudadanos solidarios» (*Guía de Clan* 2026, cap. 9); la ciudadanía global se materializa en el servicio (*Guía de Clan* p. 31); «no “hacer por”, sino “hacer con”» (*Modelo* 2026 p. 16); «sin destinatario real, el desafío se vacía» (*Modelo* p. 102).
- **L2 · Mundo Mejor y sus iniciativas.** Las cuatro iniciativas y sus desafíos (*Modelo* §16.1): Tribu Tierra (Campeones de la Naturaleza, Tide Turners, Scouts Go Solar, YUNGA), Mensajeros de la Paz (Constructores de Paz, Diálogos por la Paz, HeForShe, Patrimonito, Diálogo Interreligioso), Health Allies y Life Leaders. Las dos últimas **solo se nombran**: el corpus no trae nada de ellas. ODS «sin convertirlo en cátedra» (*Modelo* p. 68). Autoevaluación al iniciar y al terminar (Manual de Implementación Mundo Mejor). Remite a los tres cursos de eje.
- **L3 · Con quién se sirve.** El Consejo de Clan establece, orienta y evalúa los proyectos, también los presentados por sus integrantes u otras organizaciones (*Guía de Clan* p. 29); un equipo de proyecto puede incluir jóvenes externos a la Asociación (p. 29); el adulto **enlaza** al Rover con instituciones (*Modelo* §9.2.3, ejemplo del proyecto ambiental municipal). Cómo acercarse a una organización aliada y qué acordar con ella.
- **L4 · Cuidarte y cuidar fuera del Grupo.** Ver §6.
- **Resumen y compromiso:** qué necesidad vi, con quién la trabajaré, qué iniciativa la enmarca. El compromiso queda en el navegador.

**Hueco que se declara:** la *Guía de Clan* (p. 29) remite al «manual de proyectos de la Asociación», que no está en el corpus. Se busca en la biblioteca antes del diseño `.md` de la E1; si no aparece, el curso no lo cita.

## 4. E2 · Mi proyecto de servicio en la comunidad

El armazón de S2 (`mi-proyecto-de-servicio`): bienvenida y cuatro lecciones, cada una llena una parte del plan; el resumen exige el plan completo antes del certificado. Plan en `localStorage['rover:plan_mi-proyecto-en-la-comunidad']`, descargable en PDF; **no viaja a la hoja**.

**Campos que se conservan de S2:** `tipo`, `necesidad`, `que-preguntaras`, `que-dijeron`, `objetivo`, `actividades` (filas, máx. 5), `recursos`, `riesgos` (filas, máx. 6: qué puede pasar / qué se hará / quién), `fecha-acuerdo`, `como-sabre`, `fecha-evaluacion`, `evalua-con`, `presentacion`, con su obligatoriedad de S2.

**Campos que cambian:**

| S2 | Curso hermano | Obligatorio | Fuente o razón |
|---|---|---|---|
| `rama` (choice, 4) | `iniciativa` (choice): Tribu Tierra · Mensajeros de la Paz · Health Allies (Salud y Bienestar) · Life Leaders (Habilidades para la Vida) · Todavía no la sé | sí | *Modelo* §16.1; no forzar el encaje (*Modelo* p. 68) |
| — | `desafio` (short) | no | El desafío, si ya lo eligió |
| `con-quien` | `organizacion` (short): la organización o el grupo de la comunidad | sí | «Hacer con» (*Modelo* p. 16) |
| — | `cuidados` (long, en L3): cómo cuidarás a las personas con las que trabajas | sí | Lleva a la práctica §6 |
| `acuerdo-con` + `agreementRoles` | Acuerdo con **Consejo de Clan · Adulto acompañante del Clan · Responsable de la organización aliada** | sí | *Guía de Clan* p. 29 |

**Lecciones, sobre los siete pasos del *Modelo* (p. 101):**
1. **Ver la necesidad con quien la vive** — para quién y qué producto (paso 1): iniciativa, desafío, organización, necesidad, preguntas y respuestas.
2. **Objetivo y actividades** — los 2 a 4 criterios de calidad (paso 2) se enseñan dentro de `como-sabre`, sin campo nuevo; actividades y recursos.
3. **Riesgos, cuidados y acuerdo** — Política ASP y §6; acuerdo a tres con fecha.
4. **Evaluar y mostrar** — reflexión y evidencias con «fotos responsables» (paso 5), presentación pública (paso 6), autoevaluación de inicio y cierre de Mundo Mejor. El paso 7 (registro de insignias y competencias) depende del Clan y de la comisión: se nombra, no se gestiona.

## 5. E3–E5 · Cursos de eje

Molde del Nivel 2 de la Ruta 1, con bienvenida y cuatro lecciones más «Arma tu kit»:
1. el desafío y su ruta: pasos, autoevaluación y el reconocimiento con quién lo otorga;
2. actividades del kit para mayores de 18, cada una con fuente y página;
3. facilitar con la comunidad;
4. cuidados propios del tema;
5. `kit-builder`: 3 actividades, frases y lista de cuidado. Sus rótulos se cambian en `labels`.

**E3 · Paz y diálogo.**
- **Fuentes:** *Kit de Acción Constructores de Paz* (ASC, 2021):
  - «La Declaración» (p. 40);
  - «Creando un mapa» (p. 42);
  - «Propuesta de Proyecto» (p. 67);
  - autoevaluación para mayores de 18 (pp. 17–18).
- **Diálogos por la Paz:** se enseña su método Escuchar–Reconocer–Hacer (Manual Mundo Mejor p. 22). Su kit no está en el corpus y no se describe.
- **Cuidados:** se reutilizan los seis de la memoria del conflicto que armó PJ (ADR-105), adaptados a la comunidad. Son una recomendación armada con fuentes.

**E4 · Género y patrimonio.**
- **HeForShe** (*Kit de Acción*, ASC con ONU Mujeres, 2021):
  - «Resistimos callando» y «Feria del género» (p. 69);
  - «Caminos de prevención» (p. 71);
  - Embajador: proyecto de 8 meses o más, solicitado a la comisión regional de Mundo Mejor (pp. 81–82).
  - **Foco:** el que fijó el dueño para el Curso 23 de PJ: igualdad, violencias basadas en género y masculinidades. La identidad de género y los derechos sexuales y reproductivos se nombran, no se enseñan (ADR-108).
- **Patrimonito** (*Manual y Kit de Acción*, ASC, 2021):
  - 80 horas de servicio en el sitio y solicitud a la comisión (p. 6), solo en sitios declarados por la UNESCO;
  - mapeo social (p. 25);
  - autoevaluación para 18 a 21 años (pp. 11–12).
- **Cuidados:** una revelación de violencia se reporta (Política ASP p. 21). La seguridad en el sitio no tiene fuente: va como recomendación declarada.

**E5 · Tribu Tierra.** Es la de fuente más delgada.
- **En el corpus:**
  - viaje y acuerdo mutuo (*Earth Tribe* pp. 14–15) y red colaborativa (p. 26);
  - fases Cooperar y Actuar con metas SMART y aliados (*Campeones* p. 15; *Tide Turners* pp. 15–16);
  - el Clan formula proyectos de Tribu Tierra con alianzas (*Guía de Clan* p. 37).
- **Lo que falta:** los kits de acción con las descripciones de las actividades.
- **Antes de diseñar:** buscarlos en la biblioteca de la ASC.
  - Si no aparecen, el curso enseña el **proceso** en vez de actividades, y en el kit el Rover diseña sus 3 acciones.
  - **Se avisa al dueño antes de diseñar.**
  - Nunca se describe de memoria una actividad.

## 6. Cuidado fuera del Grupo (E1 L4, y en la E2 y los ejes)

- **Norma, con su fuente:**
  - la Política Nacional A Salvo del Peligro (dic-2025) también alcanza a las organizaciones aliadas y a los proyectos (pp. 15, 23–24);
  - reportar sin guardar secretos (p. 21);
  - directrices para publicar imágenes (p. 26).
- **Recomendación de este curso** (sin fuente literal; decisión del dueño del 04-10-2026, ADR-096):
  - con menores que no son scouts, nunca a solas;
  - siempre con un adulto de la organización presente;
  - el adulto acompañante del Clan al tanto del proyecto;
  - seguir la política de protección de la organización aliada.
- **Siempre:** el Rover no es el «adulto a cargo» ni cuenta en la proporción de adultos.

## 7. Reglas de contenido de los cinco cursos

- Ningún cargo para el Rover: ni «sinodal», ni «ayudante», ni «dirigente». Nunca «18–22». Lo vigila `lexico.json`.
- Las reflexiones se responden por rol o por tipo de organización: nunca piden nombres, iniciales de personas ni confidencias. El plan, el kit y el compromiso se quedan en el navegador.
- Lo que no tiene fuente se declara «recomendación de este curso». Si protege a alguien y no lo cubre §6, se consulta al dueño.
- Se dicen las fechas de los kits (2021) y de los manuales OMMS (2020). Para lo que pudo cambiar (plataformas, registro en scout.org), se remite a la comisión de Mundo Mejor.
- **Fuera:** Scouts del Mundo y Héroes Mensajeros de la Paz (solo aparecen en el Manual de 2021), y el manual Nansen.
- Los quizzes siguen los criterios de `SKILL.md` y pasan la regla ciega en cada vuelta de corrección.

## 8. Lo que no se toca

- **El backend.** No tiene lista de cursos: registra cualquier `courseId`, así que no se despliega nada.
- **El motor y el esquema.**
- **La portada.**
- **El portal y el panel nacionales**, por el ADR-020.
- **`verificar-certificado.html`.**
- **El S2 publicado.**

## 9. Pruebas

- El helper `_plan.js` llena los obligatorios de cualquier plan, y `plan-builder.spec.js` prueba el componente con su curso `plan-prueba`. Ninguno de los dos cambia.
- Los flujos genéricos (e2e, certificado y a11y) cubren cada curso nuevo en cuanto entra en `cursos.json`. Hay que verificar en cada entrega que de verdad lo recorren.
- **E2 agrega una prueba** que recorre el curso hermano real:
  - el certificado se niega con el plan incompleto;
  - con el plan completo se emite;
  - el resumen muestra los tres roles del acuerdo.
- `codigo.spec` + `lexico.json` sobre los cursos nuevos.
- **Suite:**
  - primero local (`ASC_BASE_URL=http://localhost:8132/02-Plataforma-Web/`), en serie y avisando a las demás sesiones;
  - después, contra producción;
  - se lee el TOTAL.

## 10. Proceso por entrega

1. Reservar el ADR en voz alta.
2. Diseño en `01-Diseno-Cursos/<Id>-<Titulo>.md`, con fuente por afirmación.
3. JSON y build, leyendo los avisos de las compuertas.
4. Auditorías:
   - doctrinal;
   - pedagógica, con las instrucciones para Rover;
   - re-auditoría de lo corregido.
5. Regla ciega.
6. Suite local, luego publicación y suite en producción.
7. Raíz, con turno pedido:
   - ADR, glosario, `TRAZABILIDAD.csv` y `ESTADO-AUDITORIA.md`;
   - `generar-estado.py` y la bitácora;
   - `verificar-consistencia.py` y `curl` en vivo.

El plan de implementación se escribe para **E1 y E2**. Los ejes reciben su plan cuando lleguen.

**Paradas para el dueño:**
- una regla protectora sin fuente fuera de §6;
- un kit que va más allá del foco en un tema divisivo;
- el resultado de la búsqueda de los kits de Tribu Tierra;
- las puertas de spec y de plan.
