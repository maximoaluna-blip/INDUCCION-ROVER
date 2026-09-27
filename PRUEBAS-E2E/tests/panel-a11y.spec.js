// Accesibilidad del PANEL ADMINISTRATIVO de Rover, auditado CONECTADO y con datos.
//
// POR QUÉ ASÍ Y NO COMO EN LA PLATAFORMA (27-sep-2026):
// El `panel-a11y.spec.js` de Política de Adultos audita el panel de la plataforma **sin
// conectar**: la pantalla que se ve es el modal de conexión, y las tarjetas de KPI quedan
// detrás, tapadas. Ese mismo día se midió lo que eso esconde: tres grises por debajo de AA
// —uno de ellos, 2,85:1, recién añadido— que esa compuerta **no podía ver**. Una prueba que
// mira la pantalla anterior a la que la gente usa pasa en verde por la razón equivocada.
//
// Aquí el panel se conecta de verdad: se le da una URL de backend y el backend se INTERCEPTA
// con un payload realista —con `resumen`, `modulos` y `courseStats`, que son las tres cosas
// que su backend empezó a servir ese día (ADR-082)—. Nada sale a producción. Y se audita lo
// que un administrador ve: las tarjetas pintadas, el pie de la tasa y el gráfico de módulos.
//
// ⚠️ Lo que esto NO cubre: el detalle con nombres (`registros[]`/`certificados[]`), porque el
// backend de Rover nunca lo ha servido y el panel dice por qué. Si algún día lo sirve, este
// payload tiene que crecer con él.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = process.env.ASC_BASE_URL
  || 'https://maximoaluna-blip.github.io/INDUCCION-ROVER/02-Plataforma-Web/';
const PANEL = BASE.replace(/02-Plataforma-Web\/?$/, '') + 'dashboard-admin.html';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const IMPACTOS = new Set(['serious', 'critical']);

// Un payload con la forma que sirve el backend de Rover desde @7, y cifras que ejercitan
// todas las ramas de pintado: tasa con huerfano, dos modulos con abandono.
const PAYLOAD = {
  success: true,
  data: {
    totalUsers: 3, totalCertificates: 2, totalQuizzes: 12,
    completionsByModule: { 'fundamentos-scout_modulo_0': 3, 'fundamentos-scout_modulo_1': 2 },
    modulos: [
      { curso: 'fundamentos-scout', modulo: '0', nombre: 'Introduccion', completados: 3, abandono: 0, abandonoPct: 0 },
      { curso: 'fundamentos-scout', modulo: '1', nombre: 'Leccion 1', completados: 2, abandono: 1, abandonoPct: 33 },
    ],
    courseStats: { 'fundamentos-scout': { registrations: 3, certificates: 2, avgScore: 95 } },
    averageScore: 95,
    resumen: {
      totalRovers: 3, totalCertificados: 2, inscripciones: 3, inscripcionesCompletadas: 1,
      tasaCompletacion: 33, certificadosSinInscripcion: 1, promedioPuntuacion: 95,
    },
    generatedAt: '2026-09-27T00:00:00.000Z',
  },
};

async function auditar(page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return r.violations
    .filter((v) => IMPACTOS.has(v.impact))
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})\n    ${v.nodes[0] ? v.nodes[0].target.join(' ') : ''}`);
}

test.describe('@solo-escritorio a11y del panel de Rover, conectado', () => {
  for (const tema of ['light', 'dark']) {
    test(`panel conectado y con datos [${tema}]`, async ({ page }) => {
      await page.route('**/macros/s/**', (route) => route.fulfill({
        status: 200, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(PAYLOAD),
      }));
      await page.addInitScript((t) => {
        try {
          localStorage.setItem('dashboard_gas_url', 'https://script.google.com/macros/s/PRUEBA/exec');
          localStorage.setItem('rover-theme', t);
        } catch (e) {}
      }, tema);

      const resp = await page.goto(PANEL, { waitUntil: 'domcontentloaded' });
      test.skip(!resp || resp.status() >= 400, 'dashboard-admin.html no disponible');
      await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' });

      // Que de verdad este conectado: la tasa pintada y el grafico con barras. Si no, la
      // auditoria de abajo miraria otra vez la pantalla equivocada.
      await expect(page.locator('#completionRate')).toHaveText('33%', { timeout: 15000 });
      await expect(page.locator('#completionNote')).toContainText('1 de 3 inscripciones');
      await expect(page.locator('.chart-row').first()).toBeVisible();

      const violaciones = await auditar(page);
      expect(violaciones, `Violaciones en el panel [${tema}]:\n${violaciones.join('\n')}`).toEqual([]);
    });
  }
});
