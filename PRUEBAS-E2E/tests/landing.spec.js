// La LANDING de Rover: que pinte el catálogo completo y que sus enlaces lleven a algún sitio.
//
// POR QUÉ EXISTE, Y POR QUÉ AQUÍ MÁS QUE EN NINGUNA PARTE (27-sep-2026):
// El **18-sep-2026** se midió lo que costaba ser la única línea sin suite: `fundamentos-scout`
// estaba `active` y su botón «Iniciar Curso» daba **404 en producción** (ADR-063). La landing
// miraba `folder` primero y sin prefijo, y las carpetas de 2025 tenían otro nombre. En las otras
// cuatro líneas eso lo caza `landing.spec.js` desde el 17-sep; aquí no lo cazaba nadie, y por eso
// vivió publicado. Esta prueba es, literalmente, la que faltaba ese día.
//
// QUÉ VIGILA:
//  1. que la landing no se quede en «Cargando…» ni muestre «Error al cargar» — un fallo del fetch
//     de `cursos.json` deja la página vacía y nadie se entera;
//  2. que haya UNA tarjeta por curso activo del catálogo, ni más ni menos;
//  3. ⚠️ que el enlace de cada tarjeta **resuelva de verdad** (HTTP < 400). Es el ADR-063: el
//     enlace existía, la tarjeta se pintaba, y detrás no había nada;
//  4. que un curso `coming-soon` NO se pinte como disponible — Rover tiene cinco.
//
// ⚠️ LO QUE ESTA SUITE **NO** COMPRUEBA, Y NO ES UN OLVIDO: la agrupación por nivel. Las otras
// cuatro líneas agrupan el catálogo por `level`/`levelName`; **Rover no tiene estructura de
// niveles en ninguno de sus documentos** y queda fuera de esa convención a propósito (ver el
// `CLAUDE.md` de la raíz, §7-bis.1). La spec heredada de Programa de Jóvenes exigía
// `.level-section` y fallaba aquí con razón: la línea no es la misma. *Al forquear una suite,
// lo primero que hay que decidir es qué convenciones NO comparte el destino.*
const { test, expect } = require('@playwright/test');

const BASE = process.env.ASC_BASE_URL
  || 'https://maximoaluna-blip.github.io/INDUCCION-ROVER/02-Plataforma-Web/';
// La landing vive un nivel por encima de la carpeta de cursos.
const LANDING = BASE.replace(/02-Plataforma-Web\/?$/, '');
const CATALOGO = BASE.replace(/\/?$/, '/') + 'cursos.json';

async function activosDelCatalogo(request) {
  const r = await request.get(CATALOGO);
  expect(r.status(), `${CATALOGO} deberia responder 200`).toBeLessThan(400);
  const cs = await r.json();
  const lista = Array.isArray(cs) ? cs : (cs.cursos || cs.courses || []);
  return {
    activos: lista.filter((c) => c.status === 'active' || c.status === 'new'),
    proximos: lista.filter((c) => c.status === 'coming-soon'),
  };
}

test.describe('@solo-escritorio landing de Rover', () => {
  test('pinta una tarjeta por curso activo, y ninguna de mas', async ({ page, request }, testInfo) => {
    const { activos, proximos } = await activosDelCatalogo(request);

    const resp = await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    expect(resp && resp.status(), `${LANDING} deberia responder 200`).toBeLessThan(400);

    // El catalogo se pide por fetch: esperar a que el contenedor deje de estar vacio.
    await page.waitForFunction(
      () => {
        const c = document.getElementById('coursesGrid');
        return c && c.querySelectorAll('.course-card').length > 0;
      },
      null,
      { timeout: 15000 }
    );

    const texto = await page.locator('body').innerText();
    expect(texto, 'la landing muestra un error de carga del catalogo').not.toContain('Error al cargar');
    expect(texto, 'la landing se quedo cargando').not.toContain('Cargando catalogo');

    const tarjetas = await page.locator('#coursesGrid .course-card').count();
    expect(tarjetas, `el catalogo declara ${activos.length} activos y la landing pinta ${tarjetas}`)
      .toBe(activos.length);

    // Cada curso activo, por su titulo, tiene que estar.
    for (const c of activos) {
      const enLanding = texto.toLowerCase();
      expect(enLanding, `el curso activo ${c.courseId} no aparece en la landing`)
        .toContain(String(c.title || '').toLowerCase().slice(0, 12));
    }

    testInfo.annotations.push({
      type: 'catalogo',
      description: `${activos.length} activo(s) · ${proximos.length} en coming-soon`,
    });
  });

  test('el enlace de cada tarjeta resuelve de verdad (ADR-063)', async ({ page, request }) => {
    await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => {
        const c = document.getElementById('coursesGrid');
        return c && c.querySelectorAll('.course-card').length > 0;
      },
      null,
      { timeout: 15000 }
    );

    const hrefs = await page.locator('#coursesGrid a[href]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('#'))
    );
    expect(hrefs.length, 'ninguna tarjeta enlaza a un curso').toBeGreaterThan(0);

    const rotos = [];
    for (const href of hrefs) {
      const url = new URL(href, LANDING).toString();
      const r = await request.get(url);
      if (r.status() >= 400) rotos.push(`${href} -> HTTP ${r.status()}`);
    }
    // Este es EL fallo del 18-sep-2026: curso `active`, tarjeta pintada, 404 detras.
    expect(rotos, `enlaces rotos en la landing:\n${rotos.join('\n')}`).toEqual([]);
  });

  test('un curso coming-soon no se ofrece como disponible', async ({ page, request }) => {
    const { proximos } = await activosDelCatalogo(request);
    test.skip(!proximos.length, 'el catalogo no tiene cursos en coming-soon');

    await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => {
        const c = document.getElementById('coursesGrid');
        return c && c.querySelectorAll('.course-card').length > 0;
      },
      null,
      { timeout: 15000 }
    );

    const hrefs = await page.locator('#coursesGrid a[href]').evaluateAll(
      (as) => as.map((a) => a.getAttribute('href') || '')
    );
    for (const c of proximos) {
      const enlazado = hrefs.some((h) => h.includes(c.courseId));
      expect(enlazado, `${c.courseId} esta en coming-soon y la landing lo enlaza`).toBe(false);
    }
  });
});
