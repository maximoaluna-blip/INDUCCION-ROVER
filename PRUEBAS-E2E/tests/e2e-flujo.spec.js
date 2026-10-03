// E2E del flujo completo del alumno (Fase 1a) — sin escribir en prod.
// Registro -> responder cada quiz con >=70% -> recorrer modulos -> certificado.
// Verifica tambien que el frontend POSTea el contrato correcto al backend
// (action + token + course), interceptado por _backend.js.
//
// Checklist: §F (mecanica de componentes), §G (flujo y certificado).
// El codigo de certificado se genera en el cliente (engine.js generateCertificate).
const { test, expect } = require('@playwright/test');
const { llenarPlan } = require('./_plan');
const { CURSOS } = require('./cursos');
const { stubBackend, porAccion } = require('./_backend');

const CODIGO_CERT = /^ASC-\d{4}-[A-Z0-9]{5}$/;
// Rover tiene backend, hoja y TOKEN propios (ADR-020): no comparte nada con las 4
// lineas nacionales. La spec heredada esperaba el token de la plataforma y fallaba
// aqui con razon -- si alguna vez un curso de Rover enviara ADULTOS_ASC_2026, sus
// datos estarian yendo a la hoja equivocada, y este es el test que lo cazaria.
const TOKEN = 'ROVER_ASC_2025';

async function registrarse(page) {
  await page.locator('#fullName').fill('Participante E2E De Prueba');
  // age/group/region/motivation no son obligatorios; email se usa en payloads.
  const email = page.locator('#email');
  if (await email.count()) await email.fill('e2e-prueba@example.com');
  // 20 y no 30: Rover forma a ROVERS de 18 a 22 anios, y su campo de edad lleva
  // min=18 max=22. La spec heredada de la plataforma rellenaba 30 -- una edad de
  // adulto voluntario-- y el formulario no validaba. Es la primera diferencia real
  // que aparece al forquear una suite: el dominio no es el mismo.
  const age = page.locator('#age');
  if (await age.count()) await age.fill('20');
  // Ley 1581 (ADR-081): sin autorizar el tratamiento de datos, el formulario no se
  // envia. Es obligatoria a proposito, asi que el flujo de prueba la marca como la
  // marcaria una persona. El `if` no sobra: esta suite corre por defecto contra
  // PRODUCCION, y hasta que se publique alli la casilla no existe.
  const consent = page.locator('#consent');
  if (await consent.count()) await consent.check();
  await page.locator('#registrationForm button[type="submit"]').click();
  // Tras el registro el motor muestra el modulo 1 (bienvenida).
  await expect(page.locator('#module-1')).toHaveClass(/active/);
}

async function responderQuiz(page, moduleId, correctas) {
  await page.evaluate((m) => showModule(m), moduleId);
  await expect(page.locator(`#module-${moduleId}`)).toHaveClass(/active/);

  const preguntas = page.locator(`#module-${moduleId} .question`);
  for (let qi = 0; qi < correctas.length; qi++) {
    const idx = correctas[qi];
    // Las opciones se barajan, pero conservan su onclick con el indice original.
    await preguntas.nth(qi).locator(`.option[onclick="selectOption(this, ${idx})"]`).click();
  }
  await page.locator(`#checkBtn-${moduleId}`).click();
  // El boton "siguiente" solo aparece si se aprobo (>=70%).
  await expect(page.locator(`#nextBtn-${moduleId}`)).toBeVisible();
  await page.locator(`#nextBtn-${moduleId}`).click(); // completeModule -> POST progress
}

for (const curso of CURSOS) {
  test(`@solo-escritorio e2e: ${curso.courseId} registro -> quizzes -> certificado`, async ({ page }) => {
    const capturado = await stubBackend(page);

    await page.goto(curso.file, { waitUntil: 'domcontentloaded' });
    await registrarse(page);
    await llenarPlan(page); // el certificado del Nivel 3 exige el plan completo (ADR-120)

    const respuestas = await page.evaluate(() => QUIZ_ANSWERS);
    const cfg = await page.evaluate(() => COURSE_CONFIG);
    const idsQuiz = Object.keys(respuestas).map(Number).sort((a, b) => a - b);
    expect(idsQuiz.length, 'el curso debe tener al menos un quiz').toBeGreaterThan(0);

    for (const m of idsQuiz) {
      await responderQuiz(page, m, respuestas[m]);
    }

    // Ir al certificado y REVISITARLO a proposito: la emision debe ser idempotente
    // (mismo codigo, sin segundo POST).
    await page.evaluate(() => showModule(COURSE_CONFIG.totalModules - 1));
    await expect(page.locator('#certCode')).toHaveText(CODIGO_CERT);
    const codigo1 = await page.locator('#certCode').textContent();
    await page.evaluate(() => showModule(1));
    await page.evaluate(() => showModule(COURSE_CONFIG.totalModules - 1));
    await expect(page.locator('#certCode')).toHaveText(codigo1); // mismo codigo tras revisitar

    // --- Contrato frontend -> backend ---
    expect(porAccion(capturado, 'register').length, 'POST register').toBeGreaterThanOrEqual(1);
    expect(porAccion(capturado, 'quiz').length, 'POST quiz').toBeGreaterThanOrEqual(1);
    expect(porAccion(capturado, 'progress').length, 'POST progress').toBeGreaterThanOrEqual(1);

    // Idempotencia: aunque se revisite el modulo, el certificado se emite UNA sola vez.
    const certs = porAccion(capturado, 'certificate');
    expect(certs.length, 'POST certificate (idempotente)').toBe(1);
    expect(certs[0].certificateCode).toMatch(CODIGO_CERT);
    expect(certs[0].course).toBe(cfg.courseId);

    // Todo envio lleva el token de autenticacion.
    for (const p of capturado) {
      expect(p.token, `token en payload ${p.action}`).toBe(TOKEN);
    }
  });
}
