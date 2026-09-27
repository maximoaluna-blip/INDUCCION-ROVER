// Catalogo de cursos del target bajo prueba.
// Por defecto lo provee el globalSetup (_setup-cursos.js), que descarga el
// cursos.json del ASC_BASE_URL y lo escribe en .cursos.json -> la suite es
// AGNOSTICA DE LINEA (Adultos, PJ, DI...).
// Si no hay generado (sin red en globalSetup), se usa el fallback de Rover.
const fs = require('fs');
const path = require('path');

const GENERADO = path.join(__dirname, '.cursos.json');

// Fallback: espejo de INDUCCION-ROVER/02-Plataforma-Web/cursos.json (status: "active").
// Solo cursos activos -- igual que cursos.json filtrando por status.
const FALLBACK = [
  { courseId: 'fundamentos-scout', file: 'fundamentos-scout.html', tituloIncluye: 'Fundamentos' },
  { courseId: 'caracteristicas-educativas', file: 'caracteristicas-educativas.html', tituloIncluye: 'Caracter' },
];

let CURSOS = FALLBACK;
try {
  if (fs.existsSync(GENERADO)) {
    const cargados = JSON.parse(fs.readFileSync(GENERADO, 'utf8'));
    if (Array.isArray(cargados) && cargados.length) CURSOS = cargados;
  }
} catch (e) {
  // JSON corrupto o ilegible: usar fallback.
}

module.exports = { CURSOS };
