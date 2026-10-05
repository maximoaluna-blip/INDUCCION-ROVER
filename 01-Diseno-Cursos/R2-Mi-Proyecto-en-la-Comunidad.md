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
- **«Todavía no la sé»** es respuesta válida (el *Modelo* no exige encajar en un desafío, p. 68): la prueba `proyecto-comunidad.spec` lo vigila.
- **Casos propios** (el comedor comunitario, la biblioteca de los cuentos): ninguno repite S2 (pañoletas, letreros, rally, jardín) ni la E1 (parque, vereda, refuerzo escolar).
- **Cuidado:** L3 aplica la recomendación de spec §6 y la norma con página; el campo `cuidados` obliga a escribirlo.
- **Paso 7** (registrar insignias y competencias) se nombra y se deja al Clan.
- **Reflexiones:** sobre casos inventados o tipos de espacio; ninguna pide datos del proyecto real, nombres ni iniciales.

## Lecciones

1. **Ver la necesidad con quien la vive** (~7 min): el comedor que necesitaba otra cosa; paso 1 del *Modelo*; «Elige poco y bien»; alcance del *Equipo de Bolsillo*. Quiz: sentarse con el comedor antes de decidir; elegir una de tres necesidades y escribir el alcance.
2. **Objetivo y actividades** (~7 min): SMART, tareas, cronograma por semanas, recursos y la responsabilidad financiera; DURASLID. Quiz: el objetivo medible; quién responde por los recursos.
3. **Riesgos, cuidados y acuerdo** (~8 min): seguridad como condición de calidad; plan B; norma y recomendación; acuerdo a tres. Quiz: el campo de cuidados en la lectura de cuentos; con quiénes se acuerda (distractor con los roles de S2).
4. **Evaluar y mostrar** (~8 min): 2–4 criterios revisables públicamente; reflexión y evidencias; presentación pública; autoevaluación; paso 7. Resumen del plan y descarga. Quiz: los doce criterios privados; el cierre ante el comedor.

## Pruebas
`PRUEBAS-E2E/tests/proyecto-comunidad.spec.js` (5): el certificado se niega sin `cuidados`; con el plan completo se llega al certificado; «Todavía no la sé» cuenta; el plan de S2 no se cruza; el PDF lleva los tres roles y se llama `Plan-mi-proyecto-en-la-comunidad.pdf`.

## Medición de la fuga (04-10-2026, `ciega.py`)
Sin marcadores solo en la correcta (adulto, Consejo de Clan, organización, pregunt, acord, sin, solo, Política, fundación, porque, comedor); correcta más larga en 2 de 8; ningún quiz se aprueba con la más corta; build sin avisos. La regla ciega de contenido la mide la auditoría pedagógica (Task 5).
