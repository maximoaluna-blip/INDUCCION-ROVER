#!/usr/bin/env node
/**
 * probar-backend.js — la primera compuerta automática de Rover (ADR-082).
 *
 * POR QUÉ EXISTE. Rover es la línea que siempre se queda fuera: no tiene suite
 * E2E, ni `lexico.json`, ni diseño de curso versionado, ni trazabilidad — y por
 * eso concentró 4 de los 14 hallazgos del barrido de cargos del 21-sep con solo
 * el 6 % de los cursos. Las tres correcciones que la plataforma hizo entre el 21
 * y el 27 de septiembre (ADR-079, ADR-080 y ADR-081) llegaron aquí **después**, y
 * lo único que impide que vuelvan a divergir es esto.
 *
 * *Una compuerta que no está en una línea no es una que falla: es una que nadie
 * escribió.* Esta es la que faltaba.
 *
 * QUÉ VIGILA, en un sandbox con hojas simuladas, sin red y sin producción:
 *   1. Que `stats` publique un `resumen` con la tasa medida por INSCRIPCIONES —
 *      el panel de Rover mostraba 0 % porque este backend no publicaba ninguna.
 *   2. Que esa tasa no pueda pasar del 100 %, que es lo que pasa cuando el
 *      numerador y el denominador salen de conjuntos distintos.
 *   3. Que `recover` diga si hay inscripción para el curso que se le pregunta.
 *   4. Que ese GET **no escriba nada**: es público y sin autenticar, y uno que
 *      escribiera dejaría crear inscripciones a quien sepa un correo.
 *   5. Que ni `stats` ni `recover` devuelvan lo que la persona escribió (ADR-074).
 *
 * Uso:   node probar-backend.js [ruta/a/google-apps-script.js]
 * Salida: exit 0 si todo pasa, exit 1 al primer fallo real.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SCRIPT_PATH = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, 'google-apps-script.js');

const TOKEN = 'ROVER_ASC_2025';

// --- Hojas simuladas -------------------------------------------------------
// Ana está inscrita en UN curso y tiene certificados de DOS: es la forma que
// tenía producción en la plataforma cuando su panel publicaba 105 %.
const SHEETS = {
  'Registros': [
    ['Timestamp', 'Nombre Completo', 'Edad', 'Grupo', 'Region', 'Email', 'Motivacion', 'Curso', 'UserAgent', 'URL'],
    ['2026-09-01', 'Ana Prueba', 24, 'Clan 12 Cali', 'Valle', 'ana@example.com', 'me interesa', 'fundamentos-scout', 'UA', 'u'],
    ['2026-09-02', 'Luis Prueba', 22, 'Clan 3 Cali', 'Valle', 'luis@example.com', 'por el clan', 'fundamentos-scout', 'UA', 'u'],
  ],
  'Certificados': [
    ['Timestamp', 'Email', 'Nombre', 'Curso', 'Grupo', 'Region', 'Codigo Certificado', 'Fecha Completacion', 'Puntuacion', 'Tiempo Estudio'],
    ['2026-09-03', 'ana@example.com', 'Ana Prueba', 'fundamentos-scout', 'Clan 12 Cali', 'Valle', 'ROV-CERT-0001', '2026-09-03', 100, '35'],
    // Sin fila de inscripcion: Ana hizo este otro curso entrando por "Recuperar".
    ['2026-09-04', 'ana@example.com', 'Ana Prueba', 'caracteristicas-educativas', 'Clan 12 Cali', 'Valle', 'ROV-CERT-0002', '2026-09-04', 100, '28'],
  ],
  'Progreso': [
    ['Timestamp', 'Email', 'Nombre', 'Curso', 'Modulo Completado', 'Nombre Modulo'],
    ['2026-09-01', 'ana@example.com', 'Ana Prueba', 'fundamentos-scout', 0, 'Introduccion'],
    ['2026-09-02', 'ana@example.com', 'Ana Prueba', 'fundamentos-scout', 1, 'Leccion 1'],
    ['2026-09-02', 'luis@example.com', 'Luis Prueba', 'fundamentos-scout', 0, 'Introduccion'],
  ],
  'Evaluaciones': [
    ['Timestamp', 'Email', 'Nombre', 'Curso', 'Modulo', 'Puntuacion'],
    ['2026-09-02', 'ana@example.com', 'Ana Prueba', 'fundamentos-scout', 1, 100],
  ],
};

function sheetRows(name, headers) {
  if (!SHEETS[name]) SHEETS[name] = [headers.slice()];
  return SHEETS[name];
}

function makeSheet(name) {
  const headers = (SHEETS[name] && SHEETS[name][0]) || [];
  return {
    getDataRange: () => ({ getValues: () => sheetRows(name, headers) }),
    appendRow: (row) => sheetRows(name, headers).push(row),
    getRange: () => ({
      setFontWeight() { return this; }, setBackground() { return this; },
      setFontColor() { return this; }, setValues() { return this; }, getValues: () => [],
    }),
    setFrozenRows: () => {},
    getLastRow: () => sheetRows(name, headers).length,
  };
}

function makeSandbox() {
  const noop = () => {};
  const chainable = new Proxy({}, { get: () => () => chainable });
  return {
    console,
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (n) => (SHEETS[n] ? makeSheet(n) : null),
        insertSheet: (n) => { SHEETS[n] = []; return makeSheet(n); },
      }),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) },
    CacheService: { getScriptCache: () => ({ get: () => null, put: noop }) },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (t) => ({ _t: t, setMimeType() { return this; }, getContent() { return this._t; } }),
    },
    Logger: { log: noop },
    Utilities: { formatDate: () => '2026-09-27', getUuid: () => 'uuid', sleep: noop },
    Session: { getActiveUser: () => ({ getEmail: () => '' }), getScriptTimeZone: () => 'America/Bogota' },
    ScriptApp: { getService: () => ({ getUrl: () => 'https://example.invalid/exec' }), newTrigger: () => chainable, getProjectTriggers: () => [] },
    GmailApp: { sendEmail: noop },
    MailApp: { sendEmail: noop },
    DriveApp: { getFileById: () => chainable, getRootFolder: () => chainable },
  };
}

const ctx = vm.createContext(makeSandbox());
vm.runInContext(fs.readFileSync(SCRIPT_PATH, 'utf8'), ctx, { filename: SCRIPT_PATH });

const get = (params) => JSON.parse(ctx.doGet({ parameter: params }).getContent());
const filasRegistros = () => SHEETS['Registros'].length - 1;

const results = [];
let failed = 0;
function check(label, condition, detail) {
  results.push({ label, ok: !!condition, detail });
  if (!condition) failed++;
}

const filasAntes = filasRegistros();

// --- stats: la tasa por inscripciones --------------------------------------
const stats = get({ action: 'stats', token: TOKEN });
const d = stats.data || {};
const r = d.resumen || {};

check('`stats` responde y trae los agregados',
  stats.success === true && typeof d.totalUsers === 'number', stats.error);
check('...y publica un `resumen`, que es lo que el panel lee',
  !!d.resumen, 'sin resumen: el panel de Rover mostraria 0 %');
check('...con la tasa medida por INSCRIPCIONES, no por certificados',
  r.tasaCompletacion === 50,
  `tasaCompletacion=${r.tasaCompletacion} (2 inscripciones, 1 completada; la division vieja daria 100)`);
check('...que NO puede pasar del 100 %',
  typeof r.tasaCompletacion === 'number' && r.tasaCompletacion <= 100, String(r.tasaCompletacion));
check('...publicando las dos cifras de las que sale',
  r.inscripciones === 2 && r.inscripcionesCompletadas === 1,
  `inscripciones=${r.inscripciones} completadas=${r.inscripcionesCompletadas}`);
check('...y los certificados sin inscripción aparte, no escondidos en el numerador',
  r.certificadosSinInscripcion === 1, String(r.certificadosSinInscripcion));
check('...sin que el agregado identifique a nadie',
  !/Ana Prueba|@example\.com/.test(JSON.stringify(d.resumen)));

// --- modulos: el array que el panel pinta ----------------------------------
const mods = d.modulos;
check('`stats` publica `modulos`, que es de donde el panel pinta su grafico',
  Array.isArray(mods) && mods.length > 0,
  'sin `modulos` el grafico dice "No hay datos para mostrar" con los datos dentro');
check('...con lo que ese grafico lee de cada barra: nombre y completados',
  mods && mods[0] && typeof mods[0].nombre === 'string' && typeof mods[0].completados === 'number',
  JSON.stringify(mods && mods[0]));
check('...y el MODULO 0 no se pierde en el comodin `?`',
  !!(d.completionsByModule || {})['fundamentos-scout_modulo_0'] && mods.some(function (m) { return m.modulo === '0'; }),
  JSON.stringify(Object.keys(d.completionsByModule || {})));
check('...ordenados por curso y numero de modulo',
  mods && mods.length >= 2 && mods[0].modulo === '0' && mods[1].modulo === '1',
  mods && mods.map(function (m) { return m.modulo; }).join(','));
check('...con el abandono por leccion, que sale de lo que ya se guardaba',
  mods && mods[0].abandonoPct === 0 && mods[1].abandono === 1 && mods[1].abandonoPct === 50,
  mods && JSON.stringify(mods.map(function (m) { return [m.modulo, m.completados, m.abandonoPct]; })));

// --- recover: dice si hay inscripcion, y no escribe -------------------------
const ajeno = get({ action: 'recover', email: 'ana@example.com', course: 'caracteristicas-educativas', token: TOKEN });
const dAjeno = ajeno.data || {};
check('En un curso donde NO está inscrita, `recover` lo dice (`false`)',
  dAjeno.registeredInCourse === false, String(dAjeno.registeredInCourse));
check('...y aun así devuelve el registro, que es lo que le deja continuar',
  !!(dAjeno.registration && dAjeno.registration.fullName));

const propio = get({ action: 'recover', email: 'ana@example.com', course: 'fundamentos-scout', token: TOKEN });
const dPropio = propio.data || {};
check('En un curso donde SÍ está inscrita, también lo dice (`true`)',
  dPropio.registeredInCourse === true, String(dPropio.registeredInCourse));
check('...y devuelve la inscripción DE ESE curso',
  dPropio.registration && dPropio.registration.course === 'fundamentos-scout',
  dPropio.registration && dPropio.registration.course);

const sinCurso = get({ action: 'recover', email: 'ana@example.com', token: TOKEN });
check('Sin preguntar por un curso, el campo es null y no false',
  (sinCurso.data || {}).registeredInCourse === null, String((sinCurso.data || {}).registeredInCourse));

check('Recuperar NO escribe: las filas de Registros no cambian',
  filasRegistros() === filasAntes, `antes=${filasAntes} despues=${filasRegistros()}`);

check('Y `recover` sigue sin devolver lo escrito (ADR-074): ni la motivación',
  JSON.stringify(dPropio).indexOf('me interesa') === -1);

// --- Informe ---------------------------------------------------------------
const c = { verde: '\x1b[32m', rojo: '\x1b[31m', gris: '\x1b[90m', fin: '\x1b[0m' };
console.log('\nRover — la tasa se mide por inscripciones y recuperar no escribe (ADR-082)\n');
results.forEach((x) => {
  const marca = x.ok ? `${c.verde}OK  ${c.fin}` : `${c.rojo}FALLA${c.fin}`;
  const extra = !x.ok && x.detail ? ` ${c.gris}(${x.detail})${c.fin}` : '';
  console.log(`  ${marca} ${x.label}${extra}`);
});
console.log(`\n  ${results.length - failed} de ${results.length} comprobaciones en verde.\n`);
process.exit(failed > 0 ? 1 : 0);
