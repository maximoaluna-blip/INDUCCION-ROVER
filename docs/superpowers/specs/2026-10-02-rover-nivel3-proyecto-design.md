# Rover · Nivel 3 «Proyecto» — diseño

**Fecha:** 2026-10-02 · **Estado:** aprobado por el dueño en tres partes (curso, componente, certificado y publicación) en la sesión «Curso de inducción Rover». Autonomía delegada de la creación a la publicación hasta publicar el curso · **ADR:** 120 (reservado) · **Spec madre:** `2026-09-27-rover-ruta-servicio-design.md` §3 (filas S2 y «3 · Proyecto»).

## 1. Qué se construye

Un solo curso, **S2 «Mi proyecto de servicio»** (`courseId: mi-proyecto-de-servicio`), que es el Nivel 3 de la Ruta 1 «Servir en el Grupo» y, cuando exista, también de la Ruta 2. Y un componente nuevo del motor de Rover, **`plan-builder`**, con el que el Rover arma su plan lección por lección y lo descarga en PDF.

Decisiones del dueño (02-oct-2026):

| Pregunta | Decisión |
|---|---|
| Forma del nivel | **Un curso S2 común.** La rama es el escenario que el Rover elige dentro del curso. |
| Producto del curso | **Componente propio**, como el kit del Nivel 2: el plan se queda en el navegador y se descarga en PDF. |
| Qué es el proyecto | **Proyecto propio del Rover para la rama**: acotado, con inicio y fin, diseñado y ejecutado por él, acordado con el Jefe de Grupo y el jefe de rama, y que cuenta en su PARCE. Las decisiones educativas siguen siendo de los dirigentes. |
| Cómo se arma el plan | **Enfoque A:** cada lección es una fase y el Rover llena esa parte del plan; la última muestra el plan completo y lo descarga. |

## 2. El curso

- ~45 minutos: bienvenida y 4 lecciones (7 minutos de lectura cada una, más lo que tome el plan). *Ajustado el 02-oct tras la auditoría pedagógica (M2): la tabla de abajo cuenta la bienvenida como fila 1.*
- `route: grupo`, `level: 3`, `branch: null` (la rama la elige el Rover en el plan). El catálogo lo agrupa en la Ruta 1, Nivel 3. Que la Ruta 2 lo reutilice se decide al diseñarla.
- Se recomienda antes *Servir en el Grupo* (R1) y el curso de Nivel 2 de la rama (ADR-019: nada se exige).
- **Hilo:** la distinción de *El servicio Rover* (S1): el servicio social se hace **para** la comunidad; el servicio como proyecto, **con** ella. Aquí, con la rama y sus dirigentes. Apoyar no es dirigir.

| # | Lección | Qué enseña | Parte del plan |
|---|---|---|---|
| 1 | Bienvenida | Proyecto (con inicio y fin) frente al servicio continuo que ya acordó en R1; cómo cuenta en su PARCE (*Guía de Clan* §8.7–8.9) | Rama y tipo de proyecto |
| 2 | Diagnosticar | Mirar qué necesita la rama **preguntándole a sus dirigentes**, no suponerlo; el diagnóstico del ciclo de programa (*Guía de Clan* cap. 11) | Necesidad, con quién la habló, qué le dijeron |
| 3 | Diseñar | Objetivo concreto; actividades, recursos y fechas; DURASLID si toca a niños y jóvenes (*Guía de Clan* §4.4) | Objetivo, actividades, recursos, fechas |
| 4 | Cuidar y acordar | Riesgos del proyecto; A Salvo del Peligro (2+1, nunca a solas, fotos; **el Rover no cuenta como adulto**, decisión del dueño 02-oct-2026); con quién se acuerda, retomando las tres conversaciones de R1 (Jefe de Grupo, jefe de rama, Clan) y sumando al adulto acompañante del Clan (*Modelo* p. 22) | Riesgos y qué hará con cada uno; con quién y cuándo acuerda |
| 5 | Evaluar y cerrar | Cómo sabrá si funcionó y con quién lo evalúa; plan completo y descarga | Indicadores, fecha y con quién evalúa |

**Lo que el curso no hace:** no presenta al Rover como quien dirige la rama ni decide lo educativo; no pide en las reflexiones datos del proyecto real que identifiquen menores (ADR-087: el plan con esos datos vive solo en el navegador); no enseña técnica scout para el proyecto (remite a la fuente de la rama, como el Nivel 2); no certifica la ejecución.

## 3. El componente `plan-builder`

Tipo de sección **solo de Rover** (`build-course.js` + `templates/engine.js`; `_MOTOR/` no se toca). Puede aparecer **varias veces** en un curso, y todas escriben **el mismo plan**.

### 3.1 Contrato del JSON

```json
{ "type": "plan-builder",
  "title": "Tu plan: el diagnóstico",
  "fields": [
    { "id": "necesidad", "label": "¿Qué necesita la rama?", "kind": "long", "help": "…", "required": true },
    { "id": "fecha-acuerdo", "label": "¿Cuándo lo acuerdas?", "kind": "date", "required": true },
    { "id": "actividades", "label": "Actividades", "kind": "rows", "max": 8,
      "columns": [ { "id": "que", "label": "Qué" }, { "id": "cuando", "label": "Cuándo" } ], "required": true }
  ] }
```

- `kind`: `short` (una línea), `long` (párrafo), `date`, `choice` (con `options`), `rows` (lista editable de filas con `columns` y `max` ≤ 8).
- La sección de cierre lleva `"summary": true` y `labels` (`title`, `intro`, `missingTitle`, `download`, `pdfTitle`, `agreementTitle`, `agreementRoles`), sin `fields`.
- **El build falla** si: un id se repite en el curso o no cumple `^[a-z0-9-]+$`; un `kind` no existe; `rows` no trae `columns` o su `max` pasa de 8; `choice` no trae `options`; no hay **exactamente una** sección `summary`, o no va **después** de todas las demás `plan-builder`; un módulo tiene más de una sección de campos (la `summary` sí puede compartir módulo con una de campos, siempre después de ella, como en la lección 5).

### 3.2 Guardado

- Una clave: `localStorage['rover:plan_<courseId>']`, objeto `{ <fieldId>: valor }` (texto, o arreglo de filas para `rows`). **Nada va al backend.**
- Al cargar se **normaliza**: JSON ilegible → se descarta la clave; campos que no existen → se ignoran; valores de tipo equivocado → se ignoran; `rows` recortadas a su `max`. Nunca se construyen selectores con datos guardados (búsqueda por atributo).
- Se guarda al escribir (`input`/`change`). **«Reiniciar curso» borra el plan**, igual que el kit.

### 3.3 Lo que ve el Rover

- En cada lección, los campos de esa fase con su ayuda; los obligatorios marcados.
- En la última, el **plan completo en solo lectura**, por fase, con «editar» que lleva a la lección de esa parte; debajo, **lo que falta** (campo y lección) y el botón de descarga.
- Descargar exige los obligatorios llenos; si falta algo, avisa qué y dónde, y no descarga.

### 3.4 El PDF

jsPDF A4: título, nombre del Rover, curso y fecha; cada fase con sus campos (las filas como lista); al final un recuadro **«Acordado con»** con los roles de `agreementRoles` (Jefe de Grupo, jefe de la rama, adulto acompañante del Clan) y espacio para fecha y firma, en blanco: el acuerdo es presencial y el curso no lo registra. El texto se **sanea** a lo que imprime la fuente (fuera de Latin-1 se omite) y un título de fase no queda huérfano al pie de página.

## 4. Certificado

- `courseName`: «MI PROYECTO DE SERVICIO».
- Descripción: el Rover **diseñó un plan de proyecto de servicio** para la rama de su Grupo —diagnóstico, diseño, cuidado, acuerdo y evaluación—. Nunca que lo ejecutó, nunca un cargo.
- `commitmentPrompt`: «Antes del ___ voy a conversar con ___ sobre lo que necesita la rama, y nunca voy a ___ sin acordarlo». *(Cambiado tras la auditoría pedagógica, B3: el anterior duplicaba campos del plan.)*
- **El certificado exige el plan completo:** la lección del resumen no se completa mientras falte un campo obligatorio (auditorías de S2, H5/M2), así «diseñó un plan» queda comprobado.

## 5. Fuentes

Todas con página del PDF, verificadas antes de escribir cada lección:

- *Guía de Dirigente de Clan* (ASC 2026): §4.3 servicio y aprender haciendo; §4.4 DURASLID; §8.7–8.9 PARCE y sus fases; cap. 11 ciclo de programa.
- *Modelo de Aplicación* (2026): proyectos; proporción de adultos (pp. 19 y 22).
- *Política Nacional A Salvo del Peligro* (dic-2025): estrategia 2+1, imágenes y reporte (pp. 21, 26, 44).
- *El servicio Rover* y *Servir en el Grupo* (cursos de Rover ya publicados) para no repetir y para enlazar.
- La ficha de la OMMS sobre el ciclo de proyecto (*Activity sheets — Project cycle*, en inglés): solo lectura opcional señalada, **nunca norma**.

## 6. Pruebas

**Del componente** (cada una vista fallar antes del arreglo):
- `codigo.spec`: el build acepta un plan válido y rechaza id repetido, id con caracteres no permitidos, `kind` desconocido, `rows` sin `columns` o con `max` > 8, cero o dos `summary`, `summary` antes de otra sección, dos secciones de campos en un módulo (y acepta campos + `summary` en el mismo); el esquema y el build conocen `plan-builder` (`verificar-motor.py`).
- `plan-builder.spec` (curso de prueba compilado con `--json/--salida`): lo escrito en la lección 2 aparece en el resumen; sobrevive a una recarga; un guardado corrupto no rompe el plan y lo que se escribe después se guarda; `rows` respeta su tope al agregar y al restaurar; la descarga se bloquea si falta un obligatorio y dice cuál y dónde; el PDF lleva el recuadro de acuerdo; ninguna petición al backend; reiniciar borra el plan; el bloque del motor no llama a `sendToGoogleSheets`.

**Del curso:** build sin avisos; fuga de quiz medida con varias estrategias (vocabulario —ampliando la lista en cada vuelta—, la más larga, la más corta, la tesis del curso) y al revés (la correcta nunca la más larga); suite completa local y contra producción.

## 7. Cómo se publica

1. Plan de implementación (`docs/superpowers/plans/`).
2. Componente: build, motor, estilos, esquema, pruebas.
3. Diseño `01-Diseno-Cursos/S2-Mi-Proyecto-de-Servicio.md` y JSON.
4. Auditoría doctrinal y pedagógica con las instrucciones de Rover, correcciones y re-auditoría de lo corregido.
5. Trazabilidad, suite local (de a una, con aviso), push, suite contra producción.
6. Raíz: ADR-120, glosario si hace falta, `ESTADO-AUDITORIA`, bitácora, `generar-estado.py` (con los catálogos commiteados), verificadores.
7. Docs de Rover (`SKILL.md`: 12 tipos de sección y `plan-builder`; `CLAUDE.md`; README de la suite), memoria.
8. Revisión final del código con un revisor nuevo; arreglos importantes con prueba que falle primero.

Al publicar S2 **se cierra la Ruta 1** y se agota la autonomía; la **Ruta 2** se pregunta aparte.

## 8. Fuera de alcance

- Certificar la ejecución del proyecto (si la Región la quiere reconocer, por el Clan, spec madre §7).
- La Ruta 2.
- Guardar el plan en el backend, compartirlo desde la plataforma o verlo en el panel.
