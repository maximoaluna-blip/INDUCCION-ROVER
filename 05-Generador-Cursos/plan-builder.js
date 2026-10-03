// plan-builder (ADR-120): el plan de proyecto del Nivel 3 de Rover. Varias secciones, en
// distintas lecciones, escriben UN mismo plan; la de cierre (summary) lo muestra completo y
// lo descarga. Aqui vive lo que el BUILD necesita -validar el curso y dibujar el HTML-; el
// comportamiento (guardar, filas, resumen, PDF) vive en templates/engine.js. El plan se
// guarda SOLO en localStorage: lo que el Rover escribe de su proyecto no viaja a la hoja
// (ADR-087).
'use strict';

const KINDS = ['short', 'long', 'date', 'choice', 'rows'];
const MAX_ROWS = 8;
const ID_OK = /^[a-z0-9-]+$/;
const SUMMARY_LABELS = ['title', 'intro', 'missingTitle', 'download', 'pdfTitle', 'agreementTitle'];

function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function planSections(course) {
  const out = [];
  (course.modules || []).forEach((m, mi) => {
    (m.sections || []).forEach((s, si) => {
      if (s && s.type === 'plan-builder') out.push({ moduleId: m.id, mi, si, s });
    });
  });
  return out;
}

function validatePlan(course) {
  const e = [];
  const secs = planSections(course);
  if (!secs.length) return e;
  const ids = [];
  const porModulo = {};
  const summaries = secs.filter((x) => x.s.summary);
  secs.filter((x) => !x.s.summary).forEach(({ moduleId, s }) => {
    porModulo[moduleId] = (porModulo[moduleId] || 0) + 1;
    if (!Array.isArray(s.fields) || !s.fields.length) { e.push(`plan-builder (modulo ${moduleId}): sin fields`); return; }
    s.fields.forEach((f) => {
      if (!f || typeof f !== 'object') { e.push(`plan-builder (modulo ${moduleId}): campo que no es objeto`); return; }
      if (!f.id || !ID_OK.test(f.id)) e.push(`plan-builder: id "${f.id}" vacio o con caracteres no permitidos (a-z, 0-9, -)`);
      else if (ids.includes(f.id)) e.push(`plan-builder: id repetido "${f.id}"`);
      else ids.push(f.id);
      if (!f.label) e.push(`plan-builder: campo "${f.id}" sin label`);
      if (!KINDS.includes(f.kind)) e.push(`plan-builder: campo "${f.id}" con kind desconocido "${f.kind}"`);
      if (f.kind === 'rows') {
        if (!Array.isArray(f.columns) || !f.columns.length) e.push(`plan-builder: rows "${f.id}" sin columns`);
        else f.columns.forEach((c) => { if (!c || !c.id || !ID_OK.test(c.id) || !c.label) e.push(`plan-builder: rows "${f.id}" con una columna sin id valido o sin label`); });
        if (!Number.isInteger(f.max) || f.max < 1 || f.max > MAX_ROWS) e.push(`plan-builder: rows "${f.id}" necesita max entre 1 y ${MAX_ROWS}`);
      }
      if (f.kind === 'choice' && (!Array.isArray(f.options) || !f.options.length)) e.push(`plan-builder: choice "${f.id}" sin options`);
    });
  });
  Object.keys(porModulo).forEach((m) => {
    if (porModulo[m] > 1) e.push(`plan-builder: el modulo ${m} tiene ${porModulo[m]} secciones de campos (maximo 1)`);
  });
  if (summaries.length !== 1) {
    e.push(`plan-builder: debe haber exactamente una seccion summary (hay ${summaries.length})`);
  } else {
    const sum = summaries[0];
    const ultima = secs.filter((x) => !x.s.summary).pop();
    if (ultima && (ultima.mi > sum.mi || (ultima.mi === sum.mi && ultima.si > sum.si))) {
      e.push('plan-builder: la summary debe ir despues de todas las secciones de campos');
    }
    const L = sum.s.labels || {};
    SUMMARY_LABELS.forEach((k) => { if (!L[k]) e.push('plan-builder: summary sin labels.' + k); });
    if (!Array.isArray(L.agreementRoles) || !L.agreementRoles.length) e.push('plan-builder: summary sin labels.agreementRoles');
  }
  return e;
}

function planIndex(course) {
  return planSections(course).filter((x) => !x.s.summary)
    .map(({ moduleId, s }) => ({ moduleId, title: s.title || '', fields: s.fields || [] }));
}

function renderField(f) {
  const id = 'plan-' + f.id;
  const req = f.required ? 'true' : 'false';
  const help = f.help ? `<p class="plan-help" id="${id}-help">${esc(f.help)}</p>` : '';
  const desc = f.help ? ` aria-describedby="${id}-help"` : '';
  const mark = f.required ? ' <span class="plan-req" aria-hidden="true">*</span>' : '';
  let control;
  if (f.kind === 'long') control = `<textarea id="${id}" data-plan-input="${esc(f.id)}" rows="3"${desc}></textarea>`;
  else if (f.kind === 'date') control = `<input type="date" id="${id}" data-plan-input="${esc(f.id)}"${desc}>`;
  else if (f.kind === 'choice') {
    control = `<select id="${id}" data-plan-input="${esc(f.id)}"${desc}><option value=""></option>` +
      f.options.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('') + '</select>';
  } else if (f.kind === 'rows') {
    const cols = f.columns.map((c) => `<label class="plan-col"><span>${esc(c.label)}</span><input type="text" data-col="${esc(c.id)}"></label>`).join('');
    control = `<div class="plan-rows" data-plan-rows="${esc(f.id)}" data-max="${f.max}" id="${id}"${desc}>
                        <template data-plan-row-template><div class="plan-row" data-plan-row>${cols}<button type="button" class="plan-remove" data-plan-remove-row aria-label="Quitar esta fila">✕</button></div></template>
                        <div class="plan-row-list" data-plan-row-list></div>
                        <button type="button" class="plan-add" data-plan-add-row>+ Agregar</button>
                    </div>`;
  } else control = `<input type="text" id="${id}" data-plan-input="${esc(f.id)}"${desc}>`;
  const etiqueta = f.kind === 'rows'
    ? `<p class="plan-label"><strong>${esc(f.label)}</strong>${mark}</p>`
    : `<label class="plan-label" for="${id}"><strong>${esc(f.label)}</strong>${mark}</label>`;
  return `
                <div class="plan-field" data-plan-field="${esc(f.id)}" data-kind="${esc(f.kind)}" data-required="${req}" data-label="${esc(f.label)}">
                    ${etiqueta}
                    ${help}
                    ${control}
                </div>`;
}

function renderSummary(s, index) {
  const L = s.labels;
  const fases = index.map((fase) => `
                <div class="plan-phase" data-plan-phase="${fase.moduleId}" data-phase-title="${esc(fase.title)}">
                    <h4>${esc(fase.title)}</h4>
                    <dl>${fase.fields.map((f) => `<dt>${esc(f.label)}</dt><dd data-plan-value="${esc(f.id)}" data-kind="${esc(f.kind)}"></dd>`).join('')}</dl>
                    <button type="button" class="plan-goto" data-plan-goto="${fase.moduleId}">Editar esta parte</button>
                </div>`).join('');
  return `
            <div class="plan-builder plan-summary" data-plan-summary data-pdf-title="${esc(L.pdfTitle)}" data-agreement-title="${esc(L.agreementTitle)}" data-agreement-roles="${esc(JSON.stringify(L.agreementRoles))}">
                <h3>${esc(L.title)}</h3>
                <p>${L.intro}</p>
                ${fases}
                <div class="plan-missing" data-plan-missing aria-live="polite" data-missing-title="${esc(L.missingTitle)}"></div>
                <button type="button" class="btn btn-primary plan-download" data-plan-download>${esc(L.download)}</button>
            </div>`;
}

function renderPlanSection(s, moduleId, index) {
  if (s.summary) return renderSummary(s, index || []);
  return `
            <div class="plan-builder" data-plan-section data-module="${esc(moduleId)}">
                <h3>${esc(s.title || '')}</h3>${(s.fields || []).map(renderField).join('')}
            </div>`;
}

module.exports = { validatePlan, planIndex, renderPlanSection, esc, KINDS, MAX_ROWS };
