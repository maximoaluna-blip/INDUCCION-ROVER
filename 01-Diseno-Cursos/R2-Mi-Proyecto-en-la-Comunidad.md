# R2 · Mi proyecto de servicio en la comunidad

> Diseño del curso (04-10-2026, ADR-142). El JSON `05-Generador-Cursos/borradores/mi-proyecto-en-la-comunidad.json` es su traducción. Spec: `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §4 y §6. Es el curso hermano de S2 (`mi-proyecto-de-servicio`): mismo armazón y mismo `plan-builder`, otros campos, otro acuerdo, otros casos. Las páginas son del PDF.

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `mi-proyecto-en-la-comunidad` |
| Ruta / nivel | **Servir en la comunidad** · Nivel 3 (`route: comunidad`, `level: 3`, `branch: null`) |
| Público | Rovers de 18 a 20 años de la Regional Valle del Cauca |
| Duración | ~45 min: bienvenida y 4 lecciones de 7 a 8 min de lectura, más el plan |
| Certificado | «MI PROYECTO DE SERVICIO EN LA COMUNIDAD». Certifica que **diseñó** el plan, no que lo ejecutó |
| Recomendado antes | *Servir más allá del Grupo: Mundo Mejor* (E1) |
| Plan | `localStorage['rover:plan_mi-proyecto-en-la-comunidad']`; no va a la hoja; PDF con recuadro de acuerdo |

## Gancho

> **«Aprender para servir, y servir para crecer.»**

*Guía de Dirigente de Clan* 2026, §9.1, p. 54. Abre y cierra el curso. No repite el gancho de S2 («¿Para quién hacemos esto…?», *Modelo* p. 78) ni el de la E1.

## Fuentes principales

- **Modelo de Aplicación 2026, p. 101:** los siete pasos para llevar un desafío de Scouts por los ODS a proyecto (para quién y producto; 2–4 criterios de calidad revisables públicamente; competencias; actividades DURASLID; reflexión y evidencias con «fotos responsables»; presentación pública; registro). Consejos finales: «Elige poco y bien» (p. 101) y «Mantén seguridad e inclusión como condiciones de calidad, no como anexos» (p. 102).
- **Equipo de Bolsillo - Rover** (Comisión Nacional Rover, 2025; descargado el 04-10-2026): propósitos del Proyecto Rover (p. 11), individual o con el Clan (p. 16), responsabilidad financiera de los Rovers (p. 13), los cinco pasos (pp. 18–23: idea con objetivo SMART y alcance, p. 19; plan con tareas, cronograma, recursos y presupuesto, p. 20; gestión del riesgo con plan B, p. 22; evidencias de cierre, p. 23), ejemplo con cronograma por semanas (p. 27).
- **Guía de Clan 2026:** Consejo de Clan (p. 29); gancho (p. 54).
- **Modelo:** adulto acompañante (p. 22); el Rover como Protagonista de Programa (p. 19).
- **Política A Salvo del Peligro 2025:** p. 21 (no guardar secretos), p. 23 (organizaciones aliadas), p. 26 (imágenes), p. 44 (botón).
- **Manual de Implementación Marco de Mundo Mejor** (2021): autoevaluación de inicio y cierre (p. 11).

## Campos del plan

| Lección | Campo | Tipo | Obligatorio |
|---|---|---|---|
| Bienvenida | `iniciativa` (Tribu Tierra · Mensajeros de la Paz · Health Allies (Salud y Bienestar) · Life Leaders (Habilidades para la Vida) · Todavía no la sé) | choice | sí |
| Bienvenida | `desafio`, `tipo` | short | no |
| L1 | `organizacion` | short | sí |
| L1 | `necesidad`, `que-preguntaras` | long | sí |
| L1 | `que-dijeron` | long | no |
| L2 | `objetivo` | long | sí |
| L2 | `actividades` (qué · cuándo · con quién; máx. 5) | rows | sí |
| L2 | `recursos` (incluye quién responde por la plata) | long | no |
| L3 | `riesgos` (qué puede pasar · qué se hará · quién; máx. 6) | rows | sí |
| L3 | `cuidados` | long | sí |
| L3 | `acuerdo-con` | short | sí |
| L3 | `fecha-acuerdo` | date | sí |
| L4 | `como-sabre` (2 a 4 criterios), `evalua-con` | long / short | sí |
| L4 | `fecha-evaluacion` | date | sí |
| L4 | `presentacion` | short | no |

`agreementRoles`: Consejo de Clan · Adulto acompañante del Clan · Responsable de la organización aliada.

## Decisiones de diseño

- **Curso hermano, no S2 con dos escenarios** (spec §1): no toca el motor ni el S2 publicado.
- **Nombres de iniciativa con fuente.** «Aliados de la Salud» y «Líderes de Vida» eran traducciones nuestras: la auditoría doctrinal de la E1 (04-10-2026) las marcó. Se usan **Health Allies** y **Life Leaders** con el nombre del área en español (*Modelo* §16.1; glosario).
- **«Todavía no la sé»** es respuesta válida (los propósitos del Proyecto Rover no mencionan ODS ni iniciativas: *Equipo de Bolsillo*, p. 11): la prueba `proyecto-comunidad.spec` lo vigila.
- **Casos propios** (el comedor comunitario, la biblioteca de los cuentos): ninguno repite S2 (pañoletas, letreros, rally, jardín) ni la E1 (parque, vereda, refuerzo escolar).
- **Cuidado:** L3 aplica la recomendación de spec §6 y la norma con página; el campo `cuidados` obliga a escribirlo.
- **Paso 7** (registrar insignias y competencias) se nombra y se deja al Clan.
- **Reflexiones:** sobre casos inventados o tipos de espacio; ninguna pide datos del proyecto real, nombres ni iniciales.

## Lecciones

1. **Ver la necesidad con quien la vive** (~7 min con el plan): el comedor que necesitaba otra cosa; paso 1 del *Modelo*; «Elige poco y bien»; alcance del *Equipo de Bolsillo*.
2. **Objetivo y actividades**: SMART, tareas, cronograma por semanas, recursos (obligatorio) y la responsabilidad financiera (p. 13); DURASLID en el orden de la p. 69, con un ejemplo.
3. **Riesgos, cuidados y acuerdo**: seguridad como condición de calidad (p. 102); plan B (p. 22); deber de reportar un posible delito, sea scout o no la persona (p. 21, norma); la Política acompaña al Rover y alcanza a la organización solo si cuida a los scouts (pp. 23–24); recomendación de spec §6 rotulada; acuerdo a tres **rotulado como recomendación de este curso** (Equipo de Bolsillo p. 26).
4. **Evaluar y mostrar**: el *Modelo* **aconseja** 2–4 criterios revisables públicamente, reflexión, evidencias y presentación pública (p. 101); autoevaluación en Mensajeros de la Paz (Manual MM p. 11); redes según el *Equipo de Bolsillo* (p. 23) con las directrices de fotos; evaluar con el Clan, el adulto acompañante y la organización; paso 7 al Clan. Resumen, descarga y compromiso a tres partes.

**Quizzes** (caso del hogar de adultos mayores, que no aparece en las lecciones; y la biblioteca de los cuentos): la idea que ya coincide con la necesidad y se acuerda con la directora; elegir una de tres necesidades y dejar el resto fuera; el objetivo que dice qué cambia; aceptar la plata del hogar y dejarla en el plan; los cuidados en la lectura de cuentos; empezar cuando las tres partes firmaron; criterios que ya están bien; la presentación que oye a los residentes. En cada quiz una correcta es el Rover **actuando** y los distractores son la tesis leída por exceso.

## Auditorías (04-10-2026)
- Doctrinal: 4 mayores (alcance de la p. 23; deber de reportar con no scouts; acuerdo con la organización sin fuente → rotulado; glosario) y 7 menores, aplicados. Re-auditoría: 0 mayores, 8 menores, aplicados.
- Pedagógica: regla ciega 8/8 en las dos primeras vueltas (correcta = tesis o prudencia); en la tercera se invirtió la polaridad de un ítem por quiz.

## Pruebas
`PRUEBAS-E2E/tests/proyecto-comunidad.spec.js` (5): el certificado se niega sin `cuidados`; con el plan completo se llega al certificado; «Todavía no la sé» cuenta; el plan de S2 no se cruza; el PDF lleva los tres roles y se llama `Plan-mi-proyecto-en-la-comunidad.pdf`.

## Medición de la fuga (04-10-2026, `ciega.py`)
Sin marcadores solo en la correcta (adulto, Consejo de Clan, organización, pregunt, acord, sin, solo, Política, fundación, porque, comedor); correcta más larga en 1 de 8; ningún quiz se aprueba con la más corta; build sin avisos.
