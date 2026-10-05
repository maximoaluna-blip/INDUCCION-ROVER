// Curso hermano de S2 en la Ruta 2 (ADR-142): `mi-proyecto-en-la-comunidad` usa el mismo
// plan-builder que S2, con otros campos y otro acuerdo. El componente ya lo prueba
// plan-builder.spec.js con un curso de prueba; aqui se prueba el curso REAL: que sus campos
// propios cuenten, que su acuerdo salga en el PDF y que no se mezcle con el plan de S2.
// Se abre el HTML compilado por file://, como plan-builder.spec: no depende del catalogo.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const { llenarPlan } = require('./_plan');

const ID = 'mi-proyecto-en-la-comunidad';
const HTML = path.join(__dirname, '..', '..', '02-Plataforma-Web', `${ID}.html`);
const CLAVE = `rover:plan_${ID}`;
const CLAVE_S2 = 'rover:plan_mi-proyecto-de-servicio';

async function abrir(page, extra) {
  await page.addInitScript(([id, ex]) => {
    try {
      if (!sessionStorage.getItem('sembrado')) {
        localStorage.setItem(`courseProgress_${id}`, JSON.stringify({
          userProfile: { fullName: 'Rover Prueba' }, currentModule: 2,
          moduleProgress: [], quizScores: [], reflections: {}, studyTime: 0 }));
        for (const [k, v] of Object.entries(ex || {})) localStorage.setItem(k, v);
        sessionStorage.setItem('sembrado', '1');
      }
    } catch (e) {}
  }, [ID, extra || null]);
  await page.goto(pathToFileURL(HTML).href, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#module-2')).toHaveClass(/active/);
}

// Las lecciones con quiz (2 a 5) se dan por aprobadas; la 5 lleva el resumen del plan.
const aprobarLecciones = (page) => page.evaluate(() => { [2, 3, 4].forEach((m) => { moduleProgress[m] = true; }); });

async function espiarPdf(page) {
  await page.waitForFunction(() => window.jspdf && window.jspdf.jsPDF, null, { timeout: 15000 });
  await page.evaluate(() => {
    const Orig = window.jspdf.jsPDF; window.__textos = []; window.__archivo = null;
    window.jspdf.jsPDF = function (o) {
      const pdf = new Orig(o); const t = pdf.text.bind(pdf);
      pdf.text = (s, ...r) => { window.__textos.push(String(s)); return t(s, ...r); };
      pdf.save = (n) => { window.__archivo = n; }; return pdf;
    };
  });
}

test.describe('@solo-escritorio proyecto en la comunidad (ADR-142)', () => {
  test('el certificado se niega con el plan incompleto', async ({ page }) => {
    await abrir(page);
    await llenarPlan(page);
    await page.evaluate(() => showModule(4));
    await page.fill('[data-plan-input="cuidados"]', '');
    await page.dispatchEvent('[data-plan-input="cuidados"]', 'input');
    await aprobarLecciones(page);
    await page.evaluate(() => { showModule(5); completeModule(5); });
    await expect(page.locator('#module-5')).toHaveClass(/active/);
    await expect(page.locator('[data-plan-missing]')).toContainText('cuidar');
  });

  test('con el plan completo se llega al certificado', async ({ page }) => {
    await abrir(page);
    await llenarPlan(page);
    await aprobarLecciones(page);
    await page.evaluate(() => { showModule(5); completeModule(5); });
    await expect(page.locator('#module-6')).toHaveClass(/active/);
  });

  test('«Todavía no la sé» cuenta como respuesta', async ({ page }) => {
    await abrir(page);
    await llenarPlan(page);
    await page.evaluate(() => showModule(1));
    await page.selectOption('[data-plan-input="iniciativa"]', 'Todavía no la sé');
    await page.evaluate(() => showModule(5));
    await expect(page.locator('[data-plan-value="iniciativa"]')).toHaveText('Todavía no la sé');
    await expect(page.locator('[data-plan-missing]')).not.toContainText('iniciativa', { ignoreCase: true });
    // Y con esa respuesta se llega al certificado: no basta con que no figure como faltante.
    await aprobarLecciones(page);
    await page.evaluate(() => completeModule(5));
    await expect(page.locator('#module-6')).toHaveClass(/active/);
  });

  test('el plan de S2 no se cruza con este', async ({ page }) => {
    const deS2 = JSON.stringify({ necesidad: 'de S2' });
    await abrir(page, { [CLAVE_S2]: deS2 });
    await page.evaluate(() => showModule(5));
    // Vacío, el resumen muestra «—»: lo que importa es que no aparezca lo escrito en S2.
    await expect(page.locator('[data-plan-value="necesidad"]')).not.toContainText('de S2');
    await page.evaluate(() => showModule(2));
    await page.fill('[data-plan-input="necesidad"]', 'de la comunidad');
    const [suyo, s2] = await page.evaluate(([a, b]) => [localStorage.getItem(a), localStorage.getItem(b)], [CLAVE, CLAVE_S2]);
    expect(JSON.parse(suyo).necesidad).toBe('de la comunidad');
    expect(s2).toBe(deS2);
  });

  test('el PDF lleva los tres roles del acuerdo', async ({ page }) => {
    await abrir(page);
    await llenarPlan(page);
    await page.evaluate(() => showModule(5));
    await espiarPdf(page);
    await page.click('[data-plan-download]');
    expect(await page.evaluate(() => window.__archivo)).toBe(`Plan-${ID}.pdf`);
    const textos = (await page.evaluate(() => window.__textos)).join(' ');
    for (const rol of ['Consejo de Clan', 'Adulto acompañante del Clan', 'Responsable de la organización aliada']) {
      expect(textos).toContain(rol);
    }
  });
});
