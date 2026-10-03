// Para los cursos con plan del Nivel 3 (ADR-120): el certificado exige el plan completo.
// Las pruebas de flujo llenan los obligatorios antes de pasar los quizzes. En un curso sin
// plan no hace nada.
async function llenarPlan(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-plan-section] [data-plan-field][data-required="true"]').forEach((f) => {
      const kind = f.getAttribute('data-kind');
      if (kind === 'rows') {
        const add = f.querySelector('[data-plan-add-row]');
        if (!f.querySelector('[data-plan-row]') && add) add.click();
        const celda = f.querySelector('[data-plan-row] [data-col]');
        if (celda) { celda.value = 'Prueba'; celda.dispatchEvent(new Event('input', { bubbles: true })); }
        return;
      }
      const inp = f.querySelector('[data-plan-input]');
      if (!inp) return;
      if (kind === 'date') inp.value = '2026-11-15';
      else if (kind === 'choice') inp.value = inp.options[1] ? inp.options[1].value : '';
      else inp.value = 'Prueba';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      inp.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

module.exports = { llenarPlan };
