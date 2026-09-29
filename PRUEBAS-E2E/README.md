# Pruebas E2E — Rover

La suite de Rover, **estrenada el 27-sep-2026**. Hasta ese día era la única línea de la plataforma sin
ninguna: sus defectos se veían cuando alguien tropezaba con ellos en producción.

## Lo que encontró el día que nació

Antes de dar su primer verde, esta suite cazó **cuatro defectos vivos**, los cuatro corregidos ese día:

| Qué | Dónde lo cazó | Por qué nadie lo había visto |
|---|---|---|
| El certificado generaba un **código nuevo en cada visita**, y escribía **otra fila** en la hoja por visita | `e2e-flujo.spec.js` | La plataforma lo resolvió hace meses (`certificate_issued_`); Rover tiene motor propio y nadie se lo pasó |
| El registro **no mandaba su curso** — la causa de la fila `sin-curso` que hubo que migrar a mano ese mismo día | `codigo.spec.js` | Igual: la plataforma lo corrigió el 03-ago-2026 (ADR-026) |
| El panel guardaba el **sobre** de Apps Script (`{success, data}`) y leía los datos un nivel por encima de donde están | `panel-a11y.spec.js` | Ninguna prueba recorría el `fetchData` real: se había verificado inyectando `state.data` a mano |
| **54 nodos de contraste** en los cursos y **11 en el panel**, más dos filtros sin nombre accesible (críticos) | `a11y.spec.js`, `panel-a11y.spec.js` | Nunca se había auditado. Los de los cursos eran los mismos que Programa de Jóvenes corrigió el 03-ago-2026 |

*Esta línea no fallaba más que las otras: la miraban menos.*

## Cómo se corre

⚠️ **Por defecto la suite corre contra PRODUCCIÓN** (`ASC_BASE_URL` apunta a GitHub Pages). Correrla antes de
publicar valida **lo publicado**, no lo que acabas de construir — y sale en verde.

```bash
# ANTES de publicar: contra el build local (servidor `rover` de .claude/launch.json, puerto 8132)
ASC_BASE_URL="http://localhost:8132/02-Plataforma-Web/" npx playwright test

# DESPUÉS de publicar: contra producción
npx playwright test
```

Si las dos corridas no dan lo mismo, algo se quedó sin subir. **De a una:** correr varias suites de la
plataforma a la vez deja tests sin ejecutar y sale con exit 0.

El CI (`.github/workflows/pruebas-e2e.yml`) recompila los cursos, los sirve en local y corre la suite **contra
ese build**, más `probar-backend.js`. El backend se intercepta siempre: **ninguna prueba escribe en la hoja**.

## Qué hay

El total de pruebas se lee en la salida de cada corrida (la línea `passed`), no aquí: cambia con cada curso.

| Spec | Qué vigila |
|---|---|
| `smoke` | Cada curso carga y renderiza |
| `links` | Ningún enlace roto |
| `landing` | Una tarjeta por curso activo, **cada enlace resuelve** (el 404 del ADR-063), ningún `coming-soon` enlazado; la portada **agrupa por ruta y nivel** con sus títulos exactos, suma las horas y el **filtro de rama** no esconde los cursos comunes (ADR-086, ADR-091) |
| `a11y` | WCAG AA en todos los módulos, **claro y oscuro** |
| `responsive` | Sin scroll horizontal en móvil |
| `persistence` | El tema elegido sobrevive a una recarga, y el **compromiso** escrito reaparece al volver al curso (ADR-094) |
| `feedback-quiz` | Al fallar, se marca en verde **la correcta** (ADR-061) |
| `certificado-puntuacion` | Todo acertado imprime **100**, no 75 (ADR-065) |
| `e2e-flujo` | Registro → quizzes → certificado, **y el código no cambia al volver** |
| `consentimiento` | La casilla de Ley 1581 es **obligatoria** en registro y en recuperar (ADR-081) |
| `codigo` | Estáticas sobre el HTML compilado: token de **Rover**, certificado idempotente, registro con curso, ADR-061, secciones vacías, tamaño; y el **vocabulario prohibido** de `lexico.json` —«sinodal» como cargo del Rover, «18–22»— en la prosa de los cursos, la portada, el catálogo, el generador y los correos del backend (ADR-086), y en las **guías de autoría** (`SKILL.md` y `/generate-course`, ADR-094) |
| `kit-builder` | El kit del Nivel 2: tope de 3, persiste al recargar, el PDF lleva las **normas fijas**, con menos de 3 avisa y no descarga, y **ninguna petición al backend** (ADR-106) |
| `panel-a11y` | El panel **conectado y con datos**, claro y oscuro — no la pantalla de conexión |

Y fuera de Playwright: `05-Generador-Cursos/probar-backend.js`, la compuerta del backend (19 comprobaciones sin red).

## Lo que NO se portó de las otras líneas, a propósito

- **`portal.spec`** — Rover está **fuera del portal por decisión** (ADR-020).
- **`e2e-plan-builder`** — Rover no tiene ese tipo de sección: dibuja 10.
- **`e2e-integracion`** — no hay Apps Script de pruebas para Rover.
- **La mitad de `codigo.spec`** — vigila convenciones del motor compartido (ADR-034, ADR-046) que Rover **nunca adoptó**.

## Diferencias que importan al copiar pruebas de otra línea

Esta suite es un **fork** de la de Programa de Jóvenes del 27-sep-2026. Dos cosas del dominio cambian lo que
una prueba tiene que hacer:

- **La edad va de 18 a 21** (`min=18 max=21`; la Rama Rover es de 18 a 20 y se sale antes de los 21 años y 2
  meses, ADR-086): Rover forma a Rovers, no a adultos. Una spec que rellene 30 no pasa del registro.
- **El token es `ROVER_ASC_2025`**, no el de la plataforma. Si alguna vez un curso de Rover mandara el otro,
  sus datos estarían yendo a la hoja de las otras cuatro líneas — y `codigo.spec` lo caza.

Al portar un cambio **estructural** desde PJ (o hacia allá), hacerlo a mano y a propósito: son copias, y las
copias divergen en silencio.
