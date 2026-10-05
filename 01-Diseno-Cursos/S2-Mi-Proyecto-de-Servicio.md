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
| Duración | ~45 min: bienvenida y 4 lecciones (7 min de lectura cada una, más el plan) |
| Fuentes | ***Modelo de Aplicación de la Política Nacional de Programa de Jóvenes*** (ASC 2026): cap. 11, pp. 75-79 (ciclo de programa con ABP), p. 19 (los Rovers son protagonistas de programa), p. 22 (adulto acompañante del Clan, hasta 5 proyectos) · ***Guía de Dirigente de Clan*** (ASC 2026): pp. 25-26 (DURASLID) · ***Política Nacional A Salvo del Peligro*** (dic-2025): pp. 21, 26, 44. Páginas del PDF |
| Recomendado antes | `servir-en-el-grupo` y el `herramientas-*` de la rama |

## Gancho

> **«¿Para quién hacemos esto y qué cambia gracias a nosotros?»**

Pregunta literal del *Modelo* (p. 78), que les pide a los dirigentes mantenerla viva en todas las etapas; también es la pregunta del proyecto del Rover. Abre el curso, vuelve en la lección 3 (el objetivo es la respuesta) y lo cierra.

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
- **Reglas fijas** en la lección 4: 2+1 (Política p. 26), el Rover no cuenta como adulto (*Modelo* pp. 19 y 22 + decisión del dueño: **regla de la plataforma**), fotos según directrices (p. 26; «pregunta y no publiques» es recomendación), no guardar lo que dañe (p. 21) y el botón (p. 44).
- **El plan vive en el navegador** y no se pide en las reflexiones: estas trabajan con casos **inventados** o de la propia experiencia del Rover, nunca con su proyecto real (auditoría pedagógica, M1).
- **El certificado exige el plan completo** (motor: la lección del resumen no se completa con faltantes). Los campos del diagnóstico están en **futuro** («¿con quién lo vas a conversar?») para que el plan se pueda completar antes de la conversación real; el Rover vuelve a corregirlo después (H4).
- **Progresión:** el proyecto cabe en el PARCE (*Guía de Clan* p. 28); el Consejo de Clan orienta y evalúa los proyectos en los que participa el Clan, también los de sus integrantes (p. 29).

## Lecciones

### 1 · Bienvenida (intro)
Proyecto frente a servicio continuo; «para / con» (S1); el PARCE (*Guía de Clan* p. 28) y el adulto acompañante del Clan (*Modelo* p. 22). **Plan:** rama (obligatorio) y su idea inicial.

### 2 · Diagnosticar (~7 min)
- **Fuentes:** diagnóstico participativo y sus preguntas guía (*Modelo* p. 76).
- **Plan:** qué cree que necesita la rama, con quién y cuándo lo va a conversar, qué le va a preguntar; y, después de conversar, qué le dijeron y qué le cambia a su idea.
- **Quiz (2):** las pañoletas (preguntarle al jefe qué le está costando hoy a la Manada y ver si encajan; distractores: pedir permiso para la idea propia, preguntarles a los lobatos antes que al jefe); «nos falta de todo» (qué les pesa más y a quiénes les cambiaría; distractores: «haré lo que me asigne» —la regla de S1, falsa en un proyecto—, un proyecto por etapas que cubra todo).

### 3 · Diseñar (~7 min)
- **Fuentes:** planificación con criterios de éxito, metas, riesgos y apoyos, DURASLID (*Modelo* p. 76; *Guía de Clan* pp. 25-26); microciclo (p. 78).
- **Plan:** objetivo, actividades (qué, cuándo, con quién; hasta 5), recursos.
- **Quiz (2):** el estante de la Familia, en abril (objetivo en semanas: antes de junio; distractores: el mismo objetivo para el otro año, una actividad en vez de un objetivo); el rally (proponérselo al jefe y seguir con su material mientras él y la Tropa deciden; distractores: armar ya el rally nuevo, pedirles a los guías de patrulla que presionen). La lección dice ahora que una actividad no es un objetivo. *Re-auditorías: «el rally lo decide él» contradecía el protagonismo juvenil (Guía de Tropa pp. 59-60).*

### 4 · Cuidar y acordar (~7 min)
- **Fuentes:** seguridad desde el inicio (*Modelo* p. 79); Política pp. 21, 26, 44; *Modelo* pp. 19 y 22.
- **Plan:** riesgos (qué puede pasar, qué se hará, quién; hasta 6), con quiénes y cuándo lo acuerda.
- **Quiz (2):** cuándo resolver quiénes son los dos adultos del equipo (ahora, al escribir la actividad, acordándolo con el jefe; distractores: la semana anterior, el mismo sábado); la fila de riesgos de la picadura de abeja (le falta quién atiende y a quién se avisa; distractores: «con botiquín ya está cubierto», eliminar la actividad).

### 5 · Evaluar y cerrar (~7 min)
- **Fuentes:** presentación pública y evaluación con evidencias observables (*Modelo* p. 77).
- **Plan:** cómo sabrá si funcionó, cuándo y con quién lo evalúa, cuándo le contará a la rama qué hizo y por qué; **resumen y descarga**. El certificado exige el plan completo y lecciones aprobadas (también desde la barra de navegación).
- **Quiz (2):** la señal observable (la Manada se ubicó sola; distractores: la opinión del jefe, lo que el Rover hizo); cerrar con la Tropa (contar por qué lo hizo así y oír qué cambiarían; distractores: una ronda de lo que más gustó, pedirle al jefe la evaluación por escrito).
- **Compromiso:** «Antes del ___ voy a conversar con ___ sobre lo que necesita la rama, y nunca voy a ___ sin acordarlo».

## Logros
1. Ojos que Escuchan · 2. Plan con Propósito · 3. Cuidado Acordado · 4. Proyecto con Huella.

## Revisión contra el *Equipo de Bolsillo - Rover* (05-10-2026, ADR-145)

El curso se escribió antes de que el *Equipo de Bolsillo - Rover* (Comisión Nacional Rover, 2025) entrara al corpus. Una auditoría doctrinal acotada no encontró contradicciones y pidió lo mínimo, ya aplicado (`contentVersion` 2026-10-05):
- **L3, recursos:** la plata es responsabilidad de los Rovers y se aclara desde la formulación (p. 13); el campo `recursos` pasa a obligatorio y pregunta quién responde por la plata; que lo que ponga la rama o el Grupo quede escrito y acordado antes es recomendación del curso.
- **L3, objetivo:** la ayuda pide decir qué incluye y qué no incluye el proyecto (p. 19).
- El *Equipo de Bolsillo* se suma a las fuentes de la descripción y de la bienvenida.
