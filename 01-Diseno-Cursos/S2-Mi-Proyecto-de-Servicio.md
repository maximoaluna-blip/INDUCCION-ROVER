# S2 · Mi proyecto de servicio

> Diseño del curso (02-10-2026, ADR-120). JSON: `05-Generador-Cursos/borradores/mi-proyecto-de-servicio.json`. Spec: `docs/superpowers/specs/2026-10-02-rover-nivel3-proyecto-design.md`. Es el **Nivel 3** de la Ruta 1 «Servir en el Grupo» y estrena el componente `plan-builder`: el Rover arma su plan lección por lección y lo descarga.
>
> **Nace con lo que dejaron las auditorías de los Niveles 1 y 2:** vocabulario repartido entre correctas y distractores (medido con la regla ciega, incluidas palabras como «jefe», «Clan», «adulto», «fechas»); correctas que a veces **actúan o hablan**, no solo «preguntar»; el Rover **no cuenta como adulto** (decisión del dueño, 02-oct-2026); «acompañar» es del dirigente; reglas sin fuente literal declaradas «recomendación de este curso».
>
> **Qué no repite:** las cinco preguntas del acuerdo de *Servir en el Grupo* (se retoman, no se reenseñan) ni sus casos (el jefe amigo que dice «venga el sábado», la Rover que llega sin saber qué le toca); la distinción «para / con» de *El servicio Rover* (se cita como hilo).

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `mi-proyecto-de-servicio` |
| Ruta / nivel | Ruta 1 · Nivel 3 (`route: grupo`, `level: 3`, `branch: null`: la rama la elige el Rover en su plan) |
| Público | Rovers de 18 a 20 años que ya sirven en una rama de su Grupo |
| Duración | ~35 min: bienvenida y 4 lecciones de 7 min |
| Fuentes | ***Modelo de Aplicación de la Política Nacional de Programa de Jóvenes*** (ASC 2026): cap. 11, pp. 75-79 (ciclo de programa con ABP), p. 19 (los Rovers son protagonistas de programa), p. 22 (adulto acompañante del Clan, hasta 5 proyectos) · ***Guía de Dirigente de Clan*** (ASC 2026): pp. 25-26 (DURASLID) · ***Política Nacional A Salvo del Peligro*** (dic-2025): pp. 21, 26, 44. Páginas del PDF |
| Recomendado antes | `servir-en-el-grupo` y el `herramientas-*` de la rama |

## Gancho

> **«¿Para quién hacemos esto y qué cambia gracias a nosotros?»**

Pregunta literal del *Modelo* (p. 78), que pide mantenerla viva en todo proyecto. Abre y cierra el curso.

## Objetivos

1. **Diagnosticar** lo que necesita la rama preguntándole a sus dirigentes, no suponiéndolo.
2. **Diseñar** un proyecto con objetivo concreto, actividades y fechas, sin decidir lo educativo de la rama.
3. **Cuidar** el proyecto (riesgos y A Salvo del Peligro) y **acordarlo** con quien corresponde.
4. **Decidir** cómo saber si funcionó, y **descargar** el plan.

## Decisiones de diseño

- **Proyecto propio para la rama** (decisión del dueño): acotado, con inicio y fin; lo diseña y ejecuta el Rover; lo educativo sigue siendo de los dirigentes («apoyar no es dirigir»).
- **El método es el del *Modelo*** (cap. 11): diagnóstico participativo, planificación, ejecución por tramos, presentación pública, evaluación y transferencia. El curso cubre diagnóstico, planificación (con seguridad) y evaluación/presentación; la ejecución queda fuera porque el certificado acredita el **diseño**.
- **Diagnosticar = conversar con los dirigentes de la rama** (recomendación del curso, apoyada en el diagnóstico del *Modelo*): el Rover no es de la rama; escuchar a niños y jóvenes, solo si los dirigentes lo ven útil y con ellos presentes.
- **Microciclo** (4 a 12 semanas, *Modelo* p. 78): «piensa en semanas» es recomendación del curso.
- **Acordar** retoma las tres conversaciones de R1 y suma al **adulto acompañante del Clan** (*Modelo* p. 22). El PDF trae un recuadro «Acordado con» (Jefe de Grupo, jefe de la rama, adulto acompañante del Clan) para firmar en persona.
- **Reglas fijas** en la lección 4: 2+1 (Política p. 26), el Rover no cuenta como adulto (*Modelo* p. 19 + decisión del dueño), fotos según directrices (p. 26; «pregunta y no publiques» es recomendación), no guardar lo que dañe (p. 21) y el botón (p. 44).
- **El plan vive en el navegador** y no se pide en las reflexiones: estas no piden nada identificable del proyecto real.

## Lecciones

### 1 · Bienvenida (intro)
Proyecto frente a servicio continuo; «para / con» (S1); el adulto acompañante del Clan (*Modelo* p. 22). **Plan:** rama (obligatorio) y qué tiene en mente.

### 2 · Diagnosticar (~7 min)
- **Fuentes:** diagnóstico participativo y sus preguntas guía (*Modelo* p. 76).
- **Plan:** necesidad, con quién la conversó (por su rol), qué le dijeron.
- **Quiz (2):** las pañoletas nuevas que nadie pidió (conversar con el jefe de la Manada antes de decidir; distractores: conseguirlas y que él las entregue, seguir con la idea); «nos falta de todo» (preguntar qué más les afecta y a quién serviría; distractores: lo más fácil de mostrar, un proyecto que cubra todo).

### 3 · Diseñar (~7 min)
- **Fuentes:** planificación con criterios de éxito, metas, riesgos y apoyos, DURASLID (*Modelo* pp. 76-77; *Guía de Clan* pp. 25-26); microciclo (p. 78).
- **Plan:** objetivo, actividades (qué, cuándo, con quién), recursos.
- **Quiz (2):** el objetivo concreto (qué, para quién, para cuándo); el rally que el Rover querría cambiar entero (proponerlo al jefe y seguir con su parte; distractores: rediseñarlo, callarse).

### 4 · Cuidar y acordar (~7 min)
- **Fuentes:** seguridad desde el inicio (*Modelo* p. 79); Política pp. 21, 26, 44; *Modelo* pp. 19 y 22.
- **Plan:** riesgos (qué puede pasar, qué hará), con quiénes y cuándo lo acuerda.
- **Quiz (2):** la huerta con la Tropa donde solo estará el jefe (otras fechas u otro adulto del equipo; distractor: «con el jefe y contigo ya son dos adultos»); el proyecto que choca con la salida del Clan (llevarlo al Clan y al adulto acompañante y mover lo necesario).

### 5 · Evaluar y cerrar (~7 min)
- **Fuentes:** presentación pública y evaluación con evidencias observables (*Modelo* p. 77).
- **Plan:** cómo sabrá si funcionó, cuándo y con quién lo evalúa; **resumen y descarga**.
- **Quiz (2):** la señal observable de la señalización (la Manada se ubicó sola); cerrar con la Tropa (mostrar, contar por qué y oír qué mejorar; distractores: fotos en redes, «evaluar es de los dirigentes»).
- **Compromiso:** «Voy a acordar mi proyecto con ___ antes del ___, y lo voy a evaluar con ___».

## Logros
1. Ojos que Escuchan · 2. Plan con Propósito · 3. Cuidado Acordado · 4. Proyecto con Huella.
