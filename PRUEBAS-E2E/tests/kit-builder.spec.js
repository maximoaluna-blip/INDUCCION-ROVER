// kit-builder (ADR-106): el kit del Nivel 2 se elige, se guarda SOLO en el navegador,
// sobrevive a una recarga y se descarga. Corre sobre un curso de prueba compilado aqui mismo
// (fixtures/kit-prueba.json), para no depender del contenido de ningun curso publicado.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const REPO = path.join(__dirname, '..', '..');
const FIX = path.join(__dirname, '..', 'fixtures');
const SALIDA = path.join(FIX, 'kit-prueba.html');
const MOTOR = path.join(REPO, '05-Generador-Cursos', 'templates', 'engine.js');

test.beforeAll(() => {
  execFileSync('node', [path.join(REPO, '05-Generador-Cursos', 'build-course.js'),
    '--json', path.join(FIX, 'kit-prueba.json'), '--salida', SALIDA]);
});

async function abrirKit(page) {
  await page.addInitScript(() => {
    try {
      if (!localStorage.getItem('courseProgress_kit-prueba')) {
        localStorage.setItem('courseProgress_kit-prueba', JSON.stringify({
          userProfile: { fullName: 'Rover Prueba' }, currentModule: 2,
          moduleProgress: [], quizScores: [], reflections: {}, studyTime: 0 }));
      }
    } catch (e) {}
  });
  await page.goto(pathToFileURL(SALIDA).href, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#module-2')).toHaveClass(/active/);
}

test.describe('@solo-escritorio kit-builder', () => {
  test('tope de 3 y se libera al desmarcar', async ({ page }) => {
    await abrirKit(page);
    for (const g of ['g1', 'g2', 'g3']) await page.check(`[data-kit-game="${g}"]`);
    await expect(page.locator('[data-kit-game="g4"]')).toBeDisabled();
    await expect(page.locator('[data-kit-count]')).toContainText('3');
    await expect(page.locator('[data-kit-why="g1"]')).toBeVisible();
    await expect(page.locator('[data-kit-why="g4"]')).toBeHidden();
    await page.uncheck('[data-kit-game="g2"]');
    await expect(page.locator('[data-kit-game="g4"]')).toBeEnabled();
  });

  test('persiste al recargar', async ({ page }) => {
    await abrirKit(page);
    await page.check('[data-kit-game="g2"]');
    await page.fill('[data-kit-why="g2"]', 'Porque se mueven');
    await page.fill('[data-kit-phrase="f1"]', 'Probemos otra vez');
    await page.check('[data-kit-care="c3"]');
    await page.fill('[data-kit-care-own]', 'Contarlos al cambiar de zona');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-kit-game="g2"]')).toBeChecked();
    await expect(page.locator('[data-kit-why="g2"]')).toHaveValue('Porque se mueven');
    await expect(page.locator('[data-kit-phrase="f1"]')).toHaveValue('Probemos otra vez');
    await expect(page.locator('[data-kit-care="c3"]')).toBeChecked();
    await expect(page.locator('[data-kit-care-own]')).toHaveValue('Contarlos al cambiar de zona');
  });

  test('descargar produce un PDF', async ({ page }) => {
    await abrirKit(page);
    await page.check('[data-kit-game="g1"]');
    await page.waitForFunction(() => window.jspdf && window.jspdf.jsPDF, null, { timeout: 15000 });
    const [descarga] = await Promise.all([page.waitForEvent('download'), page.click('[data-kit-download]')]);
    expect(descarga.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('ninguna petición al backend', async ({ page }) => {
    const alBackend = [];
    page.on('request', (r) => { if (/script\.google\.com/.test(r.url())) alBackend.push(r.url()); });
    await abrirKit(page);
    await page.check('[data-kit-game="g1"]');
    await page.fill('[data-kit-why="g1"]', 'x');
    await page.fill('[data-kit-phrase="f2"]', 'y');
    await page.check('[data-kit-care="c1"]');
    await page.waitForTimeout(500);
    expect(alBackend).toEqual([]);
  });

  test('las funciones del kit no llaman al backend (estatica)', () => {
    // Lo que el Rover escribe en su kit no viaja a la hoja (ADR-087): ni una llamada a
    // sendToGoogleSheets dentro del bloque del kit del motor.
    const src = fs.readFileSync(MOTOR, 'utf-8');
    const i = src.indexOf('// --- Kit del Nivel 2 (ADR-106) ---');
    expect(i).toBeGreaterThan(-1);
    expect(src.slice(i)).not.toMatch(/sendToGoogleSheets/);
  });
});
