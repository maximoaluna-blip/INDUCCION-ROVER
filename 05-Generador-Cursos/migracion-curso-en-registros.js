/**
 * migracion-curso-en-registros.js (Rover) — reparación puntual, se ejecuta a mano.
 *
 * QUÉ ARREGLA. Hasta el 03-ago-2026 el motor no enviaba el `course` al registrar:
 * era la única acción que no lo hacía. La columna "Curso" de la hoja Registros
 * quedaba vacía, y el panel —que filtra por `courseId`— no ve esas filas. La
 * plataforma lo corrigió ese día sobre su Sheet; **a Rover nadie se lo pasó**, y se
 * vio el 27-sep-2026 al publicar por primera vez el `resumen` (ADR-082): Rover
 * declaraba **1 inscripción, 0 completadas y 1 certificado sin inscripción**.
 *
 * QUÉ HACE. Para cada fila de Registros con la columna Curso vacía, busca la PRIMERA
 * actividad POSTERIOR de ese mismo correo —quiz, módulo completado o certificado— y
 * toma su curso. Un registro es el inicio de un curso, así que la primera actividad
 * que le sigue pertenece a ese curso.
 *
 * QUÉ NO HACE. Si un correo no tiene actividad posterior al registro, la fila se
 * deja como está. **No se inventa un curso.**
 *
 * ⚠️ POR QUÉ AQUÍ NO HAY UN BOOLEANO `SIMULAR`. La versión de la plataforma recibe
 * uno, y el 03-ago-2026 se le pasó `aplicar === 'si'` desde un router temporal: la
 * llamada que debía simular **escribió en el Sheet**. El resultado fue correcto por
 * suerte, no por diseño. Aquí hay **dos funciones con nombre propio** y ninguna
 * bandera que invertir:
 *
 *     simularCursoEnRegistros()   → no escribe nunca. Devuelve qué haría.
 *     aplicarCursoEnRegistros()   → escribe. Devuelve qué hizo.
 *
 * Las dos **devuelven** su informe (no solo lo escriben en el Logger), para poder
 * leerlo desde `clasp run` sin abrir ninguna ruta pública en el backend.
 *
 * CÓMO SE EJECUTA:
 *     cd 05-Generador-Cursos/apps-script
 *     npx clasp push
 *     npx clasp run simularCursoEnRegistros     # mirar el informe
 *     npx clasp run aplicarCursoEnRegistros     # solo si el informe es correcto
 *
 * …o desde el editor de Apps Script, eligiendo la función por su nombre.
 */

function simularCursoEnRegistros() {
  return _migrarCursoEnRegistros(true);
}

function aplicarCursoEnRegistros() {
  return _migrarCursoEnRegistros(false);
}

function _migrarCursoEnRegistros(simular) {
  // El backend usa siempre getActiveSpreadsheet() (el script esta vinculado al
  // Sheet), no openById: se hace igual aqui para no depender de un id suelto.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaReg = ss.getSheetByName(SHEET_CONFIG.registros.name);
  if (!hojaReg) return { error: 'No existe la hoja de Registros.' };

  var COL_TIMESTAMP = 0, COL_EMAIL = 5, COL_CURSO = 7;

  // --- Reunir toda la actividad por correo: [timestamp, curso] ---
  var actividad = {};
  function recolectar(nombreHoja, colTs, colEmail, colCurso) {
    var h = ss.getSheetByName(nombreHoja);
    if (!h) return;
    var datos = h.getDataRange().getValues();
    for (var i = 1; i < datos.length; i++) {
      var email = String(datos[i][colEmail] || '').toLowerCase().trim();
      var curso = String(datos[i][colCurso] || '').trim();
      var ts = datos[i][colTs];
      if (!email || !curso || !ts) continue;
      if (!actividad[email]) actividad[email] = [];
      actividad[email].push({ ts: new Date(ts).getTime(), curso: curso });
    }
  }
  // Evaluaciones, Progreso y Certificados: Timestamp, Email, Nombre, Curso
  recolectar(SHEET_CONFIG.evaluaciones.name, 0, 1, 3);
  recolectar(SHEET_CONFIG.progreso.name, 0, 1, 3);
  recolectar(SHEET_CONFIG.certificados.name, 0, 1, 3);

  for (var e in actividad) {
    actividad[e].sort(function (a, b) { return a.ts - b.ts; });
  }

  var datosReg = hojaReg.getDataRange().getValues();
  var informe = {
    modo: simular ? 'SIMULACION (no se escribe nada)' : 'APLICADO',
    filas: datosReg.length - 1,
    asignadas: [],      // lo que se escribiria o se escribio, fila a fila
    yaTenianCurso: 0,
    sinEvidencia: []    // filas que se dejan como estan, y por que
  };

  var usados = {};
  for (var f = 1; f < datosReg.length; f++) {
    var curso = String(datosReg[f][COL_CURSO] || '').trim();
    if (curso) { informe.yaTenianCurso++; continue; }

    var email = String(datosReg[f][COL_EMAIL] || '').toLowerCase().trim();
    var tsReg = datosReg[f][COL_TIMESTAMP] ? new Date(datosReg[f][COL_TIMESTAMP]).getTime() : null;
    var evs = actividad[email];

    // El informe no lleva el correo entero: basta el dominio para reconocer la
    // fila sin ponerlo por escrito en una salida que puede acabar pegada en
    // cualquier sitio. El criterio del ADR-074 vale tambien para las migraciones.
    var pista = email ? ('fila ' + (f + 1) + ' · …@' + email.split('@')[1]) : ('fila ' + (f + 1) + ' · sin correo');

    if (!email || !tsReg || !evs) {
      informe.sinEvidencia.push(pista + ' → ' + (!email ? 'sin correo' : (!tsReg ? 'sin fecha de registro' : 'sin actividad de ese correo')));
      continue;
    }

    if (!usados[email]) usados[email] = {};
    var elegido = null;
    for (var k = 0; k < evs.length; k++) {
      if (usados[email][k]) continue;
      if (evs[k].ts < tsReg) continue;
      elegido = evs[k].curso;
      for (var z = 0; z < evs.length; z++) {
        if (evs[z].curso === elegido && evs[z].ts >= tsReg) usados[email][z] = true;
      }
      break;
    }

    if (!elegido) {
      informe.sinEvidencia.push(pista + ' → toda su actividad es ANTERIOR al registro');
      continue;
    }

    informe.asignadas.push(pista + ' → ' + elegido);
    if (!simular) {
      hojaReg.getRange(f + 1, COL_CURSO + 1).setValue(elegido);
    }
  }

  informe.total = informe.asignadas.length;
  Logger.log(JSON.stringify(informe));
  return informe;
}
