# R2 · Mensajeros de la Paz: género y patrimonio (E4)

> Diseño del curso (12-10-2026, ADR-150). El JSON `05-Generador-Cursos/borradores/herramientas-genero-patrimonio.json` es su traducción y **manda**. Spec: `docs/superpowers/specs/2026-10-04-rover-ruta2-comunidad-design.md` §5 (E4), §6 y §7. Plan: `docs/superpowers/plans/2026-10-12-rover-ruta2-e4-genero-patrimonio.md`. Páginas del PDF (en los tres documentos coinciden con las impresas).

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `herramientas-genero-patrimonio` |
| Ruta / nivel | **Servir en la comunidad** · Nivel 2 (`route: comunidad`, `level: 2`, `branch: null`) |
| Público | Rovers de 18 a 20 años de la Regional Valle del Cauca |
| Duración | ~40 min: bienvenida, 4 lecciones de 8–9 min y «Arma tu kit» |
| Certificado | «MENSAJEROS DE LA PAZ: GÉNERO Y PATRIMONIO» |
| Recomendado antes | *Servir más allá del Grupo: Mundo Mejor* (E1) |

## Gancho

> **«La igualdad de género no es sólo una cuestión que ataña a las mujeres, es un asunto que nos afecta a todos los seres humanos.»** — *Kit de Acción HeForShe*, p. 82. Cierra con la misma página: la igualdad libera también a los hombres.

Hilo: dos invitaciones al Clan la misma semana, un colectivo de mujeres del barrio (rutas de atención) y la casa de la cultura con su escuela de marimba (músicas de marimba del Pacífico sur, la única manifestación de la lista del Kit que nombra al Valle del Cauca, p. 7).

## Fuentes

- ***Kit de Acción HeForShe*** (ASC con ONU Mujeres, jun-2021, 86 pp.; `SCOUTS/PROGRAMA DE JOVENES/2026/Kit He For She.pdf`): recomendaciones (p. 7: curso ASP); igualdad de género (p. 8, n. 2); temas de Mensajeros de la Paz (p. 15); 7 a 23 años y cómo participar (p. 13); insignia, partes A y B (p. 14); banco del Clan (p. 65); autoevaluación del Clan, A y B (pp. 67–68); actividades del Clan (pp. 69–80); taller y Emisor (p. 80); club, proyecto, campaña y Embajador (pp. 81–82); estereotipos y mensajes (p. 82); caso hipotético (p. 35); autorización de imágenes (p. 43).
- ***Kit de Acción Patrimonito*** (ASC, jun-2021, 26 pp.): qué es y tres perspectivas (p. 4); 15 años hasta la Rama Rover (p. 4); pasos y 80 h en el sitio (p. 6); lista de Colombia 2021 (pp. 7–8); proceso (pp. 8–10); autoevaluación 15–18 / 18–21 (pp. 11–12); arqueológico e ICANH (p. 21); PES (p. 22); actividades (pp. 24–25).
- ***Manual de Implementación Marco de Mundo Mejor*** (ASC, 2021): HeForShe 6 a 22 años (p. 28); **recomendaciones para la persona adulta acompañante: taller nacional HeForShe y curso ASP** y pautas de facilitación (p. 29); cinco pasos y ceremonia (p. 31); VBG (p. 33, n. 12); taller desde 15 años (p. 36); Embajador (pp. 36–37); Patrimonito (pp. 38–46), proyectos solo en lugares UNESCO (p. 42); porte de insignias (p. 67).
- ***Modelo de Aplicación*** 2026: Mensajeros de la Paz, «masculinidades invasivas» y «Cultura y patrimonio» (p. 99).
- ***Política Nacional A Salvo del Peligro*** (2025): no guardar secretos (p. 21), estrategia 2+1 e imágenes (p. 26), no investigar ni hacer de terapeuta (p. 29), botón (p. 44).
- ***Protocolo Nacional de Transporte*** (CNGR-022-1, 2025).
- **Referencia ya auditada:** Cursos 23 y 24 de PJ (`kit-heforshe-genero`, `kit-patrimonito-patrimonio`) y su registro de discrepancias.

## Decisiones de diseño

- **Foco de HeForShe (ADR-108):** igualdad, estereotipos, violencias basadas en género y masculinidades. La parte B del Clan (derechos sexuales y reproductivos, pp. 68 y 75–78) **se nombra en una sola sección** (L1) y no se enseña; lo vigila `codigo.spec`.
- **«XXY» (p. 74) fuera del kit y sin nombrarla** (decisión del dueño, 12-10-2026): la película toca la identidad de género, que el foco solo nombra.
- **«Las cifras del terror» (p. 70) fuera**: pide escalar árboles, y el curso no enseña técnica sin fuente. No se nombra.
- **Actividades ofrecidas:** siete del Clan en HeForShe (pp. 69, 69, 70, 71, 72, 73 y 80) y tres de Patrimonito (p. 25). El Kit Patrimonito no les pone nombre: los nombres son del curso y se dice. Mapa cerrado en `codigo.spec`.
- **Requisitos del que acompaña:** el taller nacional HeForShe y el curso ASP se presentan **como lo que el Manual pide a la persona adulta acompañante** (p. 29), sin volverlos condición del Rover (decisión del dueño, 12-10-2026).
- **Scouts del Mundo:** el Kit lo pone como primer paso de Patrimonito (p. 6). El curso lo **nombra como paso** y remite a la comisión de Mundo Mejor; no lo enseña (spec §7).
- **Sitios del Valle:** solo los que la fuente ubica ahí: las músicas de marimba (p. 7). La lista es de 2021: se remite a la comisión.
- **80 horas «en el sitio» con un patrimonio inmaterial:** el Kit no dice cómo se cuentan; se pregunta a la comisión.
- **Norma y recomendación:** reportar y 2+1 con menores scouts, normas; con no scouts, un adulto de la organización (spec §6); casos inventados, preguntar antes en un sitio arqueológico y la seguridad en el sitio, recomendaciones del curso.
- **Kit (`kit-builder`):** 10 actividades (se eligen 3), 4 frases, 8 cuidados: 4 reglas fijas que empiezan por la norma (Política pp. 21 y 44; Política p. 26 dos veces; Protocolo de Transporte) y 4 elegibles.
- **Reflexiones:** ninguna pide una violencia vivida ni nombres; la de cuidados pide **inventar** un caso.
- **Norma y recomendación, después de las auditorías:** «nunca a solas» es **con menores** (spec §6), no con cualquiera que no sea scout; no hay protocolo nacional de pernocta, así que el del Grupo o la Región va como recomendación; la autorización de la familia para imágenes de menores, también.
- **Quizzes:** sin personaje que objeta y se equivoca, sin el trío exceso / defecto / término medio, y con el plan del protagonista **bien** en la 2.2 (marimba en Patrimonito) y la 6.2 (mapeo social yendo con el Clan). Correctas del lado de actuar: Embajador sin el taller; seguir con la marimba (2.2 y 4.1); poner reglas con el grupo; publicar con autorización; el mapeo con visita física. En la 5.1 la opción respetuosa («respetar que no quiere contarlo») es la errada.

## Lecciones

1. **Los dos desafíos y su ruta** (~8 min): HeForShe (edades, acuerdo, partes y fases, parte B nombrada, cierre); tres reconocimientos; Patrimonito (edad, perspectivas, siete pasos, solo UNESCO); lo que pudo cambiar desde 2021 y el porte.
2. **Igualdad: lo que HeForShe te pide** (~9 min): tres definiciones; hombres como partícipes y «masculinidades invasivas»; `method-grid` de las siete actividades del Clan; del Clan a la comunidad; pautas de facilitación (Manual p. 29); lo que el Manual pide a quien acompaña.
3. **Patrimonio con quienes lo viven** (~9 min): la lista de 2021 y la marimba; patrimonio cercano como servicio de Mensajeros de la Paz sin insignia; de quién es el patrimonio (PES, ICANH, Comparte); `method-grid` de las tres de Patrimonito; autoevaluación de 18 a 21 y la pregunta de las 80 h.
4. **Cuidados que no se negocian** (~9 min): si alguien te cuenta (norma, botón, no investigar); divulgar no es reportar; casos inventados; imágenes con autorización; nunca a solas; viajar con protocolo.
5. **Arma tu kit** (~8 min): `kit-builder`; compromiso «Antes del ___ voy a usar ___ con ___, y nunca voy a ___».

## Auditorías (12-10-2026)

- **Doctrinal:** 0 críticos, 5 mayores y 8 menores. Los mayores: dos distractores defendibles (6.1 con dos desvíos; 5.1 «llevarla a justicia», que la Política p. 21 llama «derivar»); «Comparte y Actúa salen a la comunidad», que el Kit contradice (Actúa empieza por uno mismo, p. 67); la pernocta dada por norma; y el glosario (PES sin entrada; la de VBG dice que nadie la define, y el Manual p. 33 sí). Re-auditoría: 0 mayores y 2 menores (la escuela de marimba cabe en Promoción **o** Conservación; la nota del mapeo social es sobre cómo se vive el patrimonio), aplicados.
- **Pedagógica:** 0 críticos, 6 mayores y 9 menores. Los mayores: el protagonista del enunciado siempre se equivocaba (6 de 6); la 2.2 quedaba en el término medio; la 6.2 y la 5.2 se resolvían por actitud o por absolutos; «nunca a solas» decía otra cosa en la lección y en el kit; y la lección 1 traía discrepancias de edad que no le sirven a un Rover. Re-auditoría: 1 mayor (la 6.2 premiaba ir solo a la escuela, contra el cuidado c8) y 4 menores, aplicados salvo el de «marimba = seguir», que se registra.
- **Contador del kit:** decía «n de 3 elegidos»; resuelto en el mismo push con `labels.countLabel` («elegidas», Rover `a5900f3`, decisión del dueño).

## Medición de la fuga (12-10-2026, `ciega.py`)

Ningún marcador de tesis solo en la correcta (adulto, organización, pregunt, acord, Política, porque, comunidad, Kit, grupo, autoriz, comisión, Clan, botón, UNESCO, lista, ICANH, quienes, antes, evidencia). Correcta más larga en 1 de 10; ningún quiz se aprueba con la más corta ni con la más larga.

## Regla ciega (12-10-2026, ADR-148: dos lectores de modelos distintos)

- **Primera vuelta, tras las auditorías:** Haiku 1 de 5 (6/10); Sonnet 4 de 5 (9/10). La estimación del auditor antes de corregir era 5 de 5.
- **Final, con lectores nuevos y después de las re-auditorías:** **Sonnet 3 de 5 (8/10); Haiku 2 de 5 (7/10).** Los dos caen en las mismas trampas: «una música no es un lugar» (2.2) y «con violencias de tema, la autorización escrita no alcanza» (5.2). Se registra y no se persigue más.

## Revisión final (12-10-2026, Task 4)

0 críticos, 3 importantes y 6 menores. Las dos pruebas que se podían burlar (I-2 e I-3) se endurecieron: fuente exacta, conteo total, todos los ítems de las listas con «(p. N)», sinónimos en las redes de temas y de violencia vivida, y reglas fijas como mapa cerrado. Se comprobó que cada una caza su variante alterada del curso. **I-1 queda para el dueño:** la regla fija c3 exige autorización con evidencia, pero esa exigencia sale de una nota del Kit (p. 43), no de la Política (p. 26, que solo pide promover directrices).

**M-4, decidido por el dueño (12-10-2026):** la decisión de no exigirle el taller nacional HeForShe al Rover cubre también el curso A Salvo del Peligro que el Kit pide a quien acompañe (p. 7). El texto «A ti el Manual no te los exige» se queda.
