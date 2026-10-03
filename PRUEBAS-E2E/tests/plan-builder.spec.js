// plan-builder (ADR-120): el plan del Nivel 3 se arma en varias lecciones, se guarda SOLO en
// el navegador, se resume completo y se descarga con el recuadro del acuerdo. Corre sobre un
// curso de prueba compilado aqui mismo (fixtures/plan-prueba.json).
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const REPO = path.join(__dirname, '..', '..');
const FIX = path.join(__dirname, '..', 'fixtures');
const SALIDA = path.join(FIX, 'plan-prueba.html');
const MOTOR = path.join(REPO, '05-Generador-Cursos', 'templates', 'engine.js');
const CLAVE = 'rover:plan_plan-prueba';

test.beforeAll(() => {
  execFileSync('node', [path.join(REPO, '05-Generador-Cursos', 'build-course.js'),
    '--json', path.join(FIX, 'plan-prueba.json'), '--salida', SALIDA]);
});

async function abrir(page, sembrado) {
  await page.addInitScript((s) => {
    try {
      if (!sessionStorage.getItem('sembrado')) {
        localStorage.setItem('courseProgress_plan-prueba', JSON.stringify({
          userProfile: { fullName: 'Rover Prueba' }, currentModule: 2,
          moduleProgress: [], quizScores: [], reflections: {}, studyTime: 0 }));
        if (s !== null) localStorage.setItem('rover:plan_plan-prueba', s);
        sessionStorage.setItem('sembrado', '1');
      }
    } catch (e) {}
  }, sembrado === undefined ? null : sembrado);
  await page.goto(pathToFileURL(SALIDA).href, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#module-2')).toHaveClass(/active/);
}

const irA = (page, n) => page.evaluate((m) => showModule(m), n);
const valor = (page, id) => page.locator(`[data-plan-value="${id}"]`);

async function llenarTodo(page) {
  await page.fill('[data-plan-input="necesidad"]', 'Material para la salida');
  await page.click('[data-plan-add-row]');
  await page.locator('[data-plan-row] [data-col="que"]').first().fill('Pintar letreros');
  await irA(page, 3);
  await page.fill('[data-plan-input="fecha"]', '2026-11-15');
}

async function espiarPdf(page) {
  await page.waitForFunction(() => window.jspdf && window.jspdf.jsPDF, null, { timeout: 15000 });
  await page.evaluate(() => {
    const Orig = window.jspdf.jsPDF; window.__textos = []; window.__guardado = false;
    window.jspdf.jsPDF = function (o) {
      const pdf = new Orig(o); const t = pdf.text.bind(pdf);
      pdf.text = (s, ...r) => { window.__textos.push(String(s)); return t(s, ...r); };
      pdf.save = () => { window.__guardado = true; }; return pdf;
    };
  });
}

test.describe('@solo-escritorio plan-builder', () => {
  test('lo escrito en una lección aparece en el resumen', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="necesidad"]', 'Material para la salida');
    await irA(page, 3);
    await expect(valor(page, 'necesidad')).toHaveText('Material para la salida');
  });

  test('sobrevive a una recarga', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="tipo"]', 'Logística');
    await page.fill('[data-plan-input="necesidad"]', 'Una sede ordenada');
    await page.click('[data-plan-add-row]'); await page.click('[data-plan-add-row]');
    await page.locator('[data-plan-row] [data-col="que"]').nth(1).fill('Segunda');
    await irA(page, 3);
    await page.fill('[data-plan-input="fecha"]', '2026-11-15');
    await page.selectOption('[data-plan-input="rama"]', 'Tropa');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-plan-input="tipo"]')).toHaveValue('Logística');
    await expect(page.locator('[data-plan-input="necesidad"]')).toHaveValue('Una sede ordenada');
    await expect(page.locator('[data-plan-row]')).toHaveCount(2);
    await expect(page.locator('[data-plan-row] [data-col="que"]').nth(1)).toHaveValue('Segunda');
    await expect(page.locator('[data-plan-input="fecha"]')).toHaveValue('2026-11-15');
    await expect(page.locator('[data-plan-input="rama"]')).toHaveValue('Tropa');
  });

  test('el texto se muestra tal cual, nunca como HTML', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="necesidad"]', '<b>x</b> & "y"');
    await irA(page, 3);
    await expect(valor(page, 'necesidad')).toHaveText('<b>x</b> & "y"');
    await expect(page.locator('[data-plan-value] b')).toHaveCount(0);
  });

  test('un guardado corrupto no rompe el plan', async ({ page }) => {
    await abrir(page, JSON.stringify({ necesidad: 5, 'ya-no-existe': 'x', actividades: 'no-es-lista' }));
    await expect(page.locator('[data-plan-input="necesidad"]')).toHaveValue('');
    await page.fill('[data-plan-input="necesidad"]', 'Ahora sí');
    const g = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), CLAVE);
    expect(g.necesidad).toBe('Ahora sí');
    expect(g['ya-no-existe']).toBeUndefined();
  });

  test('un guardado que no es JSON se descarta y se vuelve a guardar', async ({ page }) => {
    await abrir(page, '{esto no es json');
    await page.fill('[data-plan-input="tipo"]', 'ok');
    const g = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), CLAVE);
    expect(g.tipo).toBe('ok');
  });

  test('las filas respetan su tope al agregar', async ({ page }) => {
    await abrir(page);
    for (let i = 0; i < 3; i++) await page.click('[data-plan-add-row]');
    await expect(page.locator('[data-plan-add-row]')).toBeDisabled();
    await page.locator('[data-plan-remove-row]').first().click();
    await expect(page.locator('[data-plan-add-row]')).toBeEnabled();
  });

  test('un guardado con más filas que el tope se restaura con el tope', async ({ page }) => {
    const cinco = Array.from({ length: 5 }, (_, i) => ({ que: 'f' + i, cuando: '' }));
    await abrir(page, JSON.stringify({ actividades: cinco }));
    await expect(page.locator('[data-plan-row]')).toHaveCount(3);
    await expect(page.locator('[data-plan-add-row]')).toBeDisabled();
  });

  test('una fila en blanco no cuenta como dato', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="necesidad"]', 'algo');
    await page.click('[data-plan-add-row]');
    await irA(page, 3);
    await page.fill('[data-plan-input="fecha"]', '2026-11-15');
    await expect(page.locator('[data-plan-missing]')).toContainText('Actividades');
    await expect(page.locator('[data-plan-missing]')).toContainText('Diagnóstico');
  });

  test('descargar se bloquea si falta un obligatorio y dice cuál', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="necesidad"]', 'algo');
    await page.click('[data-plan-add-row]');
    await page.locator('[data-plan-row] [data-col="que"]').first().fill('x');
    await irA(page, 3);
    await espiarPdf(page);
    await page.click('[data-plan-download]');
    expect(await page.evaluate(() => window.__guardado)).toBe(false);
    await expect(page.locator('.notification').last()).toContainText('Fecha del acuerdo');
  });

  test('descargar produce el PDF con el recuadro del acuerdo, aun con texto largo y emoji', async ({ page }) => {
    await abrir(page);
    await llenarTodo(page);
    await irA(page, 2);
    await page.fill('[data-plan-input="necesidad"]', '🙂 ' + 'palabra '.repeat(400));
    await irA(page, 3);
    await espiarPdf(page);
    await page.click('[data-plan-download]');
    expect(await page.evaluate(() => window.__guardado)).toBe(true);
    const textos = (await page.evaluate(() => window.__textos)).join(' ');
    for (const t of ['Acordado con', 'Jefe de Grupo', 'Jefe de la rama', 'Dirigente del Clan', 'Pintar letreros']) {
      expect(textos).toContain(t);
    }
    expect(textos).not.toContain('🙂');
    // Lo que se lleva a firmar se lee solo: cada fila con el nombre de su columna y las fechas en DD/MM/AAAA.
    expect(textos).toContain('Qué: Pintar letreros');
    expect(textos).toContain('15/11/2026');
    expect(textos).not.toContain('2026-11-15');
  });

  test('editar lleva a la lección de esa parte', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="necesidad"]', 'Conservado');
    await irA(page, 3);
    await page.click('[data-plan-goto="2"]');
    await expect(page.locator('#module-2')).toHaveClass(/active/);
    await expect(page.locator('[data-plan-input="necesidad"]')).toHaveValue('Conservado');
  });

  test('el certificado exige el plan completo', async ({ page }) => {
    // El certificado dice que el Rover DISEÑÓ su plan: no se llega a él con el plan en blanco.
    await abrir(page);
    await irA(page, 3);
    await page.evaluate(() => completeModule(3));
    await expect(page.locator('#module-3')).toHaveClass(/active/);
    await expect(page.locator('.notification').last()).toContainText('certificado');
    await expect(page.locator('.notification').last()).toContainText('Necesidad');
    await irA(page, 2);
    await llenarTodo(page);
    await page.evaluate(() => completeModule(3));
    await expect(page.locator('#module-4')).toHaveClass(/active/);
  });

  test('ninguna petición al backend', async ({ page }) => {
    const alBackend = [];
    page.on('request', (r) => { if (/script\.google\.com/.test(r.url())) alBackend.push(r.url()); });
    await abrir(page);
    await llenarTodo(page);
    await page.waitForTimeout(500);
    expect(alBackend).toEqual([]);
  });

  test('reiniciar el curso borra el plan', async ({ page }) => {
    await abrir(page);
    await page.fill('[data-plan-input="tipo"]', 'x');
    expect(await page.evaluate((k) => localStorage.getItem(k), CLAVE)).not.toBeNull();
    // restartCourse recarga la pagina: el evaluate puede perder su contexto en la recarga. Y hay
    // que esperar el 'load' de la PRIMERA carga, o el waitForEvent lo toma por el de la recarga.
    await page.waitForLoadState('load');
    await Promise.all([
      page.waitForEvent('load'),
      page.evaluate(() => { window.confirm = () => true; restartCourse(); }).catch(() => {}),
    ]);
    expect(await page.evaluate((k) => localStorage.getItem(k), CLAVE)).toBeNull();
  });

  test('el bloque del plan no llama al backend (estatica)', () => {
    const src = fs.readFileSync(MOTOR, 'utf-8');
    const i = src.indexOf('// --- Plan del Nivel 3 (ADR-120) ---');
    expect(i).toBeGreaterThan(-1);
    expect(src.slice(i)).not.toMatch(/sendToGoogleSheets/);
  });
});
