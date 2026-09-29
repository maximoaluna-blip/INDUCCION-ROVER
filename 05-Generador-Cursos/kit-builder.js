// kit-builder (ADR-106): el kit propio del Nivel 2 de Rover. Aqui vive lo que el BUILD
// necesita -validar el JSON y dibujar el HTML-; el comportamiento (elegir, guardar,
// descargar) vive en templates/engine.js. El kit se guarda SOLO en localStorage: lo que
// el Rover escribe sobre su servicio no viaja a la hoja (ADR-087).
'use strict';

const LABELS = ['title', 'intro', 'gamesTitle', 'gamesHelp', 'gameWhyPlaceholder',
  'phrasesTitle', 'phrasePlaceholder', 'careTitle', 'careOwnPlaceholder', 'download', 'pdfTitle'];
const MAX_GAMES = 3;

function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function validateKit(s) {
  const e = [];
  const L = s.labels || {};
  LABELS.forEach((k) => { if (!L[k]) e.push('kit-builder: falta labels.' + k); });
  const games = s.games || [], phrases = s.phrases || [], care = s.care || [];
  if (games.length < 5) e.push('kit-builder: se necesitan al menos 5 games (hay ' + games.length + ')');
  if (phrases.length < 3 || phrases.length > 4) e.push('kit-builder: phrases debe tener 3 o 4 (hay ' + phrases.length + ')');
  if (care.length < 3) e.push('kit-builder: se necesitan al menos 3 care (hay ' + care.length + ')');
  const ids = [...games, ...phrases, ...care].map((x) => x && x.id);
  ids.forEach((id, i) => {
    if (!id) e.push('kit-builder: elemento sin id');
    else if (ids.indexOf(id) !== i) e.push('kit-builder: id repetido "' + id + '"');
  });
  games.forEach((g) => { if (!g.name || !g.source) e.push('kit-builder: juego "' + g.id + '" sin name o source'); });
  phrases.forEach((f) => { if (!f.situation) e.push('kit-builder: frase "' + f.id + '" sin situation'); });
  care.forEach((c) => { if (!c.text) e.push('kit-builder: cuidado "' + c.id + '" sin text'); });
  // Una norma de la Guia no se elige: sale fija y necesita su propio titulo.
  if (care.some((c) => c.rule) && !L.rulesTitle) e.push('kit-builder: hay care con rule:true y falta labels.rulesTitle');
  return e;
}

function renderKit(s) {
  const L = s.labels;
  const games = s.games.map((g) => `
                    <div class="kit-game">
                        <input type="checkbox" id="kit-game-${esc(g.id)}" data-kit-game="${esc(g.id)}">
                        <label for="kit-game-${esc(g.id)}"><strong>${g.name}</strong>${g.detail ? ' — ' + g.detail : ''} <small class="kit-source">${g.source}</small></label>
                        <textarea id="kit-why-${esc(g.id)}" data-kit-why="${esc(g.id)}" rows="2" hidden aria-label="${esc(L.gameWhyPlaceholder)}" placeholder="${esc(L.gameWhyPlaceholder)}"></textarea>
                    </div>`).join('');
  const phrases = s.phrases.map((f) => `
                    <div class="kit-phrase">
                        <label for="kit-phrase-${esc(f.id)}">${f.situation}</label>
                        <textarea id="kit-phrase-${esc(f.id)}" data-kit-phrase="${esc(f.id)}" rows="2" placeholder="${esc(L.phrasePlaceholder)}"></textarea>
                    </div>`).join('');
  const src = (c) => (c.source ? ' <small class="kit-source">' + c.source + '</small>' : '');
  const reglas = s.care.filter((c) => c.rule);
  const rules = reglas.length ? `
                    <p class="kit-rules-title"><strong>${L.rulesTitle}</strong></p>
                    <ul class="kit-rules">${reglas.map((c) => `
                        <li data-kit-rule="${esc(c.id)}">${c.text}${src(c)}</li>`).join('')}
                    </ul>` : '';
  const care = rules + s.care.filter((c) => !c.rule).map((c) => `
                    <div class="kit-care-item">
                        <input type="checkbox" id="kit-care-${esc(c.id)}" data-kit-care="${esc(c.id)}">
                        <label for="kit-care-${esc(c.id)}">${c.text}${c.source ? ' <small class="kit-source">' + c.source + '</small>' : ''}</label>
                    </div>`).join('');
  return `<div class="kit-builder" data-kit-builder data-max-games="${MAX_GAMES}" data-pdf-title="${esc(L.pdfTitle)}">
                <h3>${L.title}</h3>
                <p>${L.intro}</p>
                <fieldset class="kit-games">
                    <legend>${L.gamesTitle}</legend>
                    <p>${L.gamesHelp}</p>
                    <p class="kit-count" data-kit-count aria-live="polite"></p>${games}
                </fieldset>
                <fieldset class="kit-phrases">
                    <legend>${L.phrasesTitle}</legend>${phrases}
                </fieldset>
                <fieldset class="kit-care">
                    <legend>${L.careTitle}</legend>${care}
                    <label for="kit-care-own" class="kit-care-own-label">${esc(L.careOwnPlaceholder)}</label>
                    <textarea id="kit-care-own" data-kit-care-own rows="2" placeholder="${esc(L.careOwnPlaceholder)}"></textarea>
                </fieldset>
                <button type="button" class="btn" data-kit-download onclick="downloadKitPDF()">${L.download}</button>
            </div>`;
}

module.exports = { validateKit, renderKit, esc, MAX_GAMES };
