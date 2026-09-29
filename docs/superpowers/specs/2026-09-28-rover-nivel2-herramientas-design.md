# Rover · Ruta 1, Nivel 2 «Herramientas» — diseño

**Fecha:** 2026-09-28 · **Estado:** ✅ **completado el 2026-09-28** (los cuatro cursos publicados; ADR-106 cerrado). Aprobado por el dueño en tres partes (molde, componente, fuentes) en la sesión «Curso de inducción Rover». Autonomía delegada de la creación a la publicación hasta cerrar el nivel · **ADR:** 106 · **Spec madre:** `2026-09-27-rover-ruta-servicio-design.md` §3 (tabla de la Ruta 1, fila «2 · Herramientas»).

## 1. Qué se busca

El Nivel 1 enseña a **conocer** la rama. El Nivel 2 le da al Rover **criterio y un kit propio**: al terminar sabe elegir y adaptar juegos, hablar y cuidar a esa edad, y se lleva **su** kit (tres juegos elegidos con su porqué, sus frases para esa edad y su lista de cuidado) en un PDF. Decisiones del dueño (28-09-2026):
- Resultado: **criterio + kit propio** (no un recetario, no solo lecciones).
- Técnica scout: **solo lo que dice la guía de la rama**. La técnica fuerte va en Tropa, donde el corpus la tiene; en las demás ramas el curso dice abiertamente que la técnica se aprende en el Clan o en la formación oficial.
- Kit: **componente propio de Rover** (enfoque A), no las reflexiones ni un PDF fijo.

## 2. Los cuatro cursos

`herramientas-familia`, `herramientas-manada`, `herramientas-tropa`, `herramientas-comunidad`. Cada uno lleva `route: grupo`, `level: 2` y el `branch` de su rama. Duran unos 35 minutos: una bienvenida y 5 lecciones de 6 a 7 minutos. Se recomienda antes el curso de Nivel 1 de esa rama, pero no es requisito (ADR-019). Orden: Familia, Manada, Tropa, Comunidad.

| # | Lección | Qué hace |
|---|---|---|
| 1 | Juegos y dinámicas para esa edad | Elegir, adaptar y conducir un juego según la guía. Criterio, no recetario |
| 2 | Vida al aire libre y seguridad en actividades | Lo que pide la guía 2026. **Tropa:** técnica y especialidades |
| 3 | Escuchar y hablar a esa edad | **Parte del Nivel 1 y va más allá**: conversaciones difíciles, corregir, preguntar. No repite lo que ya enseñó |
| 4 | Buen trato y cuidado a esa edad | Señales, primeros auxilios psicológicos, qué hacer y qué no. Contacto físico y custodia según la guía de la rama |
| 5 | Arma tu kit | Componente `kit-builder` + quiz que aplica las lecciones 1 a 4, sin repetir casos del Nivel 1 |

Se mantienen las reglas del Nivel 1:
- quizzes de escenario, con distractores que son errores reales;
- que la correcta no sea la única que nombra al dirigente;
- reflexiones sin nombres de personas ni confidencias;
- compromiso con fórmula;
- «recomendación de este curso» para lo que no tiene fuente literal, sin que esa etiqueta cubra una obligación que sí es norma.

## 3. Fuentes por curso (páginas del PDF)

| Curso | L1 Juegos | L2 Aire libre y seguridad | L3 Escuchar y hablar | L4 Buen trato |
|---|---|---|---|---|
| Familia | Guía pp. 8, 26-27 | Guía pp. 47-49 | Guía pp. 73-74 | Guía pp. 76-80 (custodia, baño, contacto físico, 2+1) |
| Manada | Guía pp. 9-10, 54; *Buen Orden* pp. 9-20 | Guía pp. 34-36 | Guía pp. 58-60 (más allá del N1) | Guía pp. 64-65; *Guía de Prevención* 2021 pp. 20-28, 35-38 |
| Tropa | Guía pp. 25-26 | Guía pp. 33-34; *Bitácora Scout*; *Manual de Especialidades* 2019; *Buenas Prácticas* (2023) pp. 20-30 | Guía pp. 14-15, 58 | Guía p. 66; *Guía de Prevención* |
| Comunidad | Guía pp. 13, 22-23 | Guía p. 25 (y el hueco, dicho) | Guía pp. 7, 42-43 | Guía pp. 46-47; *Guía de Prevención* |

- **Fuentes secundarias.** Las guías Interamericanas (1995-2007) y los *toolkits* OMMS en inglés solo como lectura opcional señalada, **nunca como norma**.
- **Lista de juegos del kit.** Sale de lo que cada guía nombra. Si una rama no da 5 opciones con fuente, el kit usa **tipos de juego**.
- **Consulta abierta a la Región (no bloquea).** Las Guías de Familia y Manada citan «manuales de implementación» de la Política de Entornos Seguros que no están en el corpus.

## 4. El componente `kit-builder`

Es un tipo de sección nuevo, **solo en el motor de Rover** (`05-Generador-Cursos/build-course.js` + `templates/engine.js`); no toca `_MOTOR/`. Va en la lección 5.

### 4.1 Contrato del JSON

```json
{
  "type": "kit-builder",
  "labels": {
    "title": "…", "intro": "…",
    "gamesTitle": "…", "gamesHelp": "…", "gameWhyPlaceholder": "…",
    "phrasesTitle": "…", "phrasePlaceholder": "…",
    "careTitle": "…", "careOwnPlaceholder": "…",
    "download": "…", "pdfTitle": "…"
  },
  "games":   [ { "id": "g1", "name": "…", "detail": "…", "source": "Guía …, p. X" } ],
  "phrases": [ { "id": "f1", "situation": "…" } ],
  "care":    [ { "id": "c1", "text": "…", "source": "Guía …, p. X" } ]
}
```

El build **falla** (igual que un tipo sin dibujante) si:
- falta algún texto de `labels`;
- hay menos de 5 `games`, un número de `phrases` fuera de 3 a 4, o menos de 3 `care`;
- se repite algún `id`.

### 4.2 Comportamiento

- **Juegos:** el Rover marca **exactamente 3**. Cuando ya hay 3 marcados, las demás casillas se deshabilitan. Cada juego marcado abre un área de texto para escribir el porqué y cómo lo adaptaría.
- **Frases:** un área de texto por situación.
- **Cuidado:** casillas para marcar, y un área de texto para agregar un punto propio.
- **Guardado:** en `localStorage['rover:kit_<courseId>']` con la forma `{games:{id:texto}, phrases:{id:texto}, care:[ids], careOwn:texto}`. Se restaura al volver al curso. **Nunca pasa por `sendToGoogleSheets`.**
- **«Descargar mi kit»:** genera con jsPDF un PDF A4 con `pdfTitle`, el nombre del Rover (el suyo propio, tomado del perfil), la fecha y lo que escribió, respetando el orden del JSON. Sin descarga no se pierde nada.
- **No bloquea:** completar la lección depende solo de su quiz, como en las demás.
- **Accesibilidad:** cada casilla con su `label`, y la cuenta «2 de 3 elegidos» anunciada con `aria-live`.

### 4.3 Pruebas nuevas (`PRUEBAS-E2E`)

- **`codigo.spec` (estática):**
  - todo curso que declare `kit-builder` compila la sección no vacía;
  - las funciones del kit en el motor no llaman a `sendToGoogleSheets`;
  - el `course-schema.json` de Rover declara el tipo, que también lo vigila `verificar-motor.py`.
- **`kit-builder.spec` (flujo):**
  - marcar 3 juegos y comprobar que el cuarto queda deshabilitado;
  - escribir y recargar, y comprobar que todo reaparece;
  - «Descargar» produce un archivo;
  - no sale ninguna petición al backend mientras se usa el kit.
- **`a11y`:** ya recorre todos los módulos, así que el componente queda cubierto sin prueba aparte.

## 5. Entregas y proceso

| Entrega | Contenido |
|---|---|
| E5 | Componente `kit-builder` (build, motor, esquema, pruebas) + `herramientas-familia` |
| E6 | `herramientas-manada` |
| E7 | `herramientas-tropa` |
| E8 | `herramientas-comunidad` → **Nivel 2 cerrado; fin de la autonomía** |

Cada curso sigue la misma secuencia:
1. diseño `.md`;
2. JSON;
3. build sin avisos;
4. auditoría doctrinal y pedagógica, con las instrucciones de Rover;
5. correcciones;
6. re-auditoría de lo corregido;
7. trazabilidad;
8. suite local;
9. push;
10. suite contra producción;
11. raíz con turno: ADR-106 al cierre, glosario si hace falta, bitácora y `ESTADO.md`.

Tocar el motor obliga a **recompilar los ocho cursos existentes**, y la suite lo confirma. Se consulta al dueño solo lo crítico: desplegar el backend (aquí no hace falta), el texto de certificados ya emitidos, borrar algo publicado, o una regla protectora sin fuente.

## 6. Fuera de alcance

- S2 (Nivel 3, proyecto).
- La Ruta 2 (Mundo Mejor). Ojo: el Curso 21 de PJ ya trata ese marco y habrá que leerlo antes.
- El recorte de F1 y F2, que es una decisión abierta del dueño.
