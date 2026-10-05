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
// ⚠️ LA AGRUPACIÓN: hasta el 27-sep-2026 Rover no tenía niveles en ninguno de sus documentos, y
// la spec heredada de Programa de Jóvenes, que exigía `.level-section`, fallaba aquí con razón.
// Desde el ADR-086 Rover sí los tiene, pero NO son los de las otras líneas: agrupa por RUTA
// (`route`) y dentro de cada ruta por NIVEL (`level`), con un filtro por RAMA (`branch`). Lo
// vigila el bloque «landing por ruta y nivel», al final. *Al forquear una suite, lo primero que
// hay que decidir es qué convenciones NO comparte el destino — y revisarlo cuando el destino cambia.*
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

// --- ADR-086: la landing se organiza por RUTA y NIVEL -------------------------------------
// Desde el 27-sep-2026 Rover es una plataforma de servicio con un tronco comun y dos rutas
// (spec: docs/superpowers/specs/2026-09-27-rover-ruta-servicio-design.md). Lo de arriba sigue
// valiendo; esto vigila la estructura nueva, que antes no existia.
test.describe('@solo-escritorio landing por ruta y nivel (ADR-086)', () => {
  async function cargar(page) {
    await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.querySelectorAll('#coursesGrid .course-card').length > 0,
      null, { timeout: 15000 });
  }

  test('el catalogo ya no promete cursos coming-soon', async ({ request }) => {
    const { proximos } = await activosDelCatalogo(request);
    expect(proximos.map((c) => c.title), 'cursos prometidos que nunca llegaron').toEqual([]);
  });

  test('cada curso activo cae en su ruta y su nivel', async ({ page, request }) => {
    const { activos } = await activosDelCatalogo(request);
    await cargar(page);
    for (const c of activos) {
      expect(c.route, `${c.courseId} sin route en cursos.json`).toBeTruthy();
      expect(c.level, `${c.courseId} sin level en cursos.json`).toBeTruthy();
      // Por el TITULO exacto: con 'hasText' y las primeras letras, «Servir en el» casaba
      // tambien la descripcion de F1 y contaba dos tarjetas (ADR-091).
      const titulos = await page.locator(
        `.route-section[data-route="${c.route}"] .level-section[data-level="${c.level}"] .course-card .course-title`)
        .allInnerTexts();
      const iguales = titulos.filter((t) => t.trim() === String(c.title).trim()).length;
      expect(iguales, `${c.courseId} no aparece en ruta ${c.route}, nivel ${c.level}`).toBe(1);
    }
  });

  test('no pinta rutas ni niveles vacios', async ({ page }) => {
    await cargar(page);
    const vacios = await page.locator('.level-section').evaluateAll(
      (ls) => ls.filter((l) => !l.querySelector('.course-card')).map((l) => l.dataset.level));
    expect(vacios).toEqual([]);
  });

  // La Ruta 2 tiene tres cursos de eje, no cuatro ramas: no lleva filtro (ADR-141).
  test('la ruta comunidad se pinta sin filtro de rama (ADR-141)', async ({ page }) => {
    await cargar(page);
    const comunidad = page.locator('section[data-route="comunidad"]');
    await expect(comunidad).toBeVisible();
    await expect(comunidad.locator('.level-section[data-level="1"]')).toHaveCount(1);
    await expect(comunidad.locator('.level-section[data-level="3"]')).toHaveCount(1);
    await expect(comunidad.locator('.branch-filter')).toHaveCount(0);
    await expect(page.locator('section[data-route="grupo"] .branch-filter')).toHaveCount(1);
  });

  test('las horas de contenido suman minutos como minutos', async ({ page, request }) => {
    const { activos } = await activosDelCatalogo(request);
    const minutos = activos.reduce((s, c) => {
      const m = String(c.duration || '').match(/([\d.,]+)\s*(h|min)/i);
      if (!m) return s;
      const n = parseFloat(m[1].replace(',', '.'));
      return s + (/^h/i.test(m[2]) ? n * 60 : n);
    }, 0);
    await cargar(page);
    const horas = parseFloat((await page.locator('#statHoras').innerText()).replace(',', '.'));
    expect(horas).toBeCloseTo(minutos / 60, 0);
  });

  test('si el catalogo falla, lo dice en vez de quedarse cargando', async ({ page }) => {
    await page.route('**/cursos.json', (r) => r.fulfill({ status: 500, body: 'x' }));
    await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#coursesGrid')).toContainText('Error al cargar', { timeout: 15000 });
  });
});

// --- ADR-086: una sola portada -------------------------------------------------------------
// Habia dos: la raiz y la de 2025 en 02-Plataforma-Web/. El ADR-063 mostro que un segundo
// camino que funciona esconde al primero que no. Y el verificador de certificados enlazaba
// «Volver a la Plataforma» a pagina-principal-menu-cursos.html EN LA RAIZ, donde nunca
// existio: 404 en produccion, en la pagina que valida los certificados (27-sep-2026).
test.describe('@solo-escritorio una sola portada (ADR-086)', () => {
  test('la portada de 2025 lleva a la raiz', async ({ page }) => {
    await page.goto(BASE.replace(/\/?$/, '/') + 'pagina-principal-menu-cursos.html');
    await page.waitForURL((u) => /\/(index\.html)?$/.test(new URL(u).pathname), { timeout: 15000 });
    await expect(page.locator('#coursesGrid .course-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('el verificador vuelve a una portada que existe', async ({ page, request }) => {
    const verif = LANDING.replace(/\/?$/, '/') + 'verificar-certificado.html';
    await page.goto(verif, { waitUntil: 'domcontentloaded' });
    const hrefs = await page.locator('a.footer-back').evaluateAll((as) => as.map((a) => a.href));
    expect(hrefs.length, 'el verificador no tiene enlace de regreso').toBeGreaterThan(0);
    for (const h of hrefs) {
      const r = await request.get(h);
      expect(r.status(), `${h} desde el verificador`).toBeLessThan(400);
    }
  });
});

// --- ADR-091: el filtro de rama ------------------------------------------------------------
// Con cursos por rama (R1-familia...), la ruta del Grupo pinta un filtro. Por defecto se ven
// TODAS las ramas; filtrar esconde solo los cursos de OTRA rama, nunca los comunes (F1, F2, R1).
test.describe('@solo-escritorio filtro de rama (ADR-091)', () => {
  test('filtrar por una rama esconde las otras y deja los comunes', async ({ page, request }) => {
    const { activos } = await activosDelCatalogo(request);
    const conRama = activos.filter((c) => c.route === 'grupo' && c.branch);
    test.skip(!conRama.length, 'todavia no hay cursos por rama');
    await page.goto(LANDING, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelectorAll('#coursesGrid .course-card').length > 0,
      null, { timeout: 15000 });
    const ruta = page.locator('.route-section[data-route="grupo"]');
    const todas = await ruta.locator('.course-card:visible').count();
    expect(todas, 'por defecto se ven todos los cursos de la ruta').toBe(
      activos.filter((c) => (c.route || 'grupo') === 'grupo').length);
    const rama = conRama[0].branch;
    const otra = ['familia', 'manada', 'tropa', 'comunidad'].find((b) => b !== rama);
    await ruta.locator(`.branch-filter button[data-filter="${otra}"]`).click();
    await expect(ruta.locator(`.course-card[data-branch="${rama}"]`).first()).toBeHidden();
    const comunes = activos.filter((c) => (c.route || 'grupo') === 'grupo' && !c.branch).length;
    expect(await ruta.locator('.course-card:not([data-branch]):visible').count(),
      'los cursos comunes de la ruta nunca se esconden').toBe(comunes);
    await ruta.locator(`.branch-filter button[data-filter="${rama}"]`).click();
    await expect(ruta.locator(`.course-card[data-branch="${rama}"]`).first()).toBeVisible();
  });
});
