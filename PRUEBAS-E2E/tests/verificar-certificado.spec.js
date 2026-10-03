// La verificación del certificado (ADR-128): el pie del PDF dice dónde se verifica y enlaza
// con el código puesto, y la página solo dice «válido» cuando el backend encontró el código.
// Hasta el 03-oct-2026 la página miraba `data.success` —que el backend devuelve también para
// un código inexistente— y leía campos que no existen (`data.nombre`): un código inventado
// salía «Certificado Valido», y uno real, con todos sus datos en «---».
const { test, expect } = require('@playwright/test');
const { CURSOS } = require('./cursos');

const BASE = process.env.ASC_BASE_URL
  || 'https://maximoaluna-blip.github.io/INDUCCION-ROVER/02-Plataforma-Web/';
const RAIZ = BASE.replace(/02-Plataforma-Web\/?$/, '');
const PAGINA = RAIZ + 'verificar-certificado.html';

async function backendResponde(page, cuerpo) {
  await page.route('**/macros/s/**', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(cuerpo) }));
}

test.describe('@solo-escritorio verificación del certificado (ADR-128)', () => {
  test('un código que no existe NO sale como válido', async ({ page }) => {
    await backendResponde(page, { success: true, data: { valid: false } });
    await page.goto(PAGINA, { waitUntil: 'domcontentloaded' });
    await page.fill('#cert-code', 'ASC-2026-ZZZZZ');
    await page.click('#verify-btn');
    await expect(page.locator('#result-area')).not.toContainText(/Certificado V[aá]lido/i);
  });

  test('un código real muestra los datos que devuelve el backend', async ({ page }) => {
    await backendResponde(page, { success: true, data: { valid: true, studentName: 'Ana Rover',
      course: 'mi-proyecto-de-servicio', group: 'Grupo 1', region: 'Valle', completionDate: '2026-10-03', score: 100,
      certificateCode: 'ASC-2026-ABCDE' } });
    await page.goto(PAGINA, { waitUntil: 'domcontentloaded' });
    await page.fill('#cert-code', 'ASC-2026-ABCDE');
    await page.click('#verify-btn');
    await expect(page.locator('#result-area')).toContainText(/Certificado V[aá]lido/i);
    await expect(page.locator('#result-area')).toContainText('Ana Rover');
    await expect(page.locator('#result-area')).toContainText('mi-proyecto-de-servicio');
  });

  test('el enlace con ?codigo= pone el código y verifica solo', async ({ page }) => {
    await backendResponde(page, { success: true, data: { valid: true, studentName: 'Ana Rover', course: 'x' } });
    await page.goto(PAGINA + '?codigo=asc-2026-abcde', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#cert-code')).toHaveValue('ASC-2026-ABCDE');
    await expect(page.locator('#result-area')).toContainText('Ana Rover');
  });

  test('el pie del PDF apunta a la página de verificación de Rover con el código', async ({ page }) => {
    await page.goto(CURSOS[0].file, { waitUntil: 'domcontentloaded' });
    const v = await page.evaluate(() => urlVerificacion('ASC-2026-ABCDE'));
    expect(v.enlace).toBe(PAGINA + '?codigo=ASC-2026-ABCDE');
    expect(v.visible).not.toContain('02-Plataforma-Web');
  });
});
