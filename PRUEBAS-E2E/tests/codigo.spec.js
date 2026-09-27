// Calidad de código de Rover: comprobaciones ESTÁTICAS sobre el motor y el HTML compilado.
//
// POR QUÉ ESTA Y NO LA DE LAS OTRAS LÍNEAS, TAL CUAL. La `codigo.spec.js` de Programa de
// Jóvenes tiene 14 comprobaciones y la mitad vigilan convenciones del **motor compartido**
// (`_MOTOR/`, ADR-025) que Rover **nunca adoptó**: logros por `unlockOnModule` (ADR-046),
// vocabulario por plano y claves de `localStorage` con apellido (ADR-034). Aquí fallarían por
// una razón que no es un defecto. Una de ellas es literalmente «no queda rastro del token viejo
// de la plataforma Rover» — que en Rover es el token propio. Esta es la versión que aplica.
//
// Y lleva DOS comprobaciones que no existen en ninguna otra línea, porque vigilan los dos
// defectos que la suite de Rover cazó el día que nació (27-sep-2026):
//   - el certificado generaba un código NUEVO en cada visita, y escribía otra fila por visita;
//   - el registro no mandaba su curso, que es la causa de la fila `sin-curso` que hubo que
//     migrar a mano ese mismo día.
// Las dos son del mismo tipo: arreglos que la plataforma hizo meses antes y que a Rover, con
// motor propio, nadie le pasó. *Esta línea no falla más: la miran menos.*
//
// POR QUÉ MIRAR EL HTML COMPILADO Y NO SOLO EL MOTOR: el motor se INLINEA en cada curso al
// construirlo. Arreglar `engine.js` no arregla nada hasta recompilar, y el modo de fallo real
// es «se arregló el motor y el curso publicado sigue igual».
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const GEN = path.join(REPO, '05-Generador-Cursos');
const MOTOR = path.join(GEN, 'templates', 'engine.js');
const WEB = path.join(REPO, '02-Plataforma-Web');

const leer = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : null);

// Solo lo que ES un curso compilado: lleva COURSE_CONFIG inlineado. En 02-Plataforma-Web/
// conviven paginas que no lo son -pagina-principal-menu-cursos.html, de 2025-, y exigirles
// token o certificado seria confundir una pagina con un curso.
function compilados() {
  if (!fs.existsSync(WEB)) return [];
  return fs.readdirSync(WEB)
    .filter((f) => f.endsWith('.html'))
    .map((f) => ({ nombre: f, html: fs.readFileSync(path.join(WEB, f), 'utf-8') }))
    .filter((c) => c.html.includes('COURSE_CONFIG'));
}

function catalogo() {
  const raw = leer(path.join(WEB, 'cursos.json'));
  if (!raw) return [];
  const cs = JSON.parse(raw);
  return Array.isArray(cs) ? cs : (cs.cursos || cs.courses || []);
}

test.describe('Calidad de codigo de Rover (estatica)', () => {

  // --- Lo que Rover comparte con la plataforma -------------------------------

  test('el motor no lleva console.log ni debugger de depuracion', () => {
    const motor = leer(MOTOR);
    test.skip(!motor, 'sin engine.js');
    const lineas = motor.split('\n')
      .map((l, i) => ({ l, n: i + 1 }))
      .filter((x) => /^\s*(console\.log|debugger)\b/.test(x.l));
    expect(lineas.map((x) => `engine.js:${x.n}  ${x.l.trim()}`)).toEqual([]);
  });

  test('ningun curso compilado supera los 500 KB', () => {
    const grandes = compilados()
      .filter((c) => Buffer.byteLength(c.html, 'utf-8') > 500 * 1024)
      .map((c) => `${c.nombre} — ${(Buffer.byteLength(c.html, 'utf-8') / 1024).toFixed(0)} KB`);
    expect(grandes).toEqual([]);
  });

  test('ninguna seccion compilada sale vacia (ADR-066)', () => {
    // El `default` del build imprimia un <p> vacio para un tipo sin `case`: el curso podia
    // declararlo, pasar el esquema y no imprimir nada. Rover solo dibuja 10 tipos.
    const vacias = [];
    for (const c of compilados()) {
      const m = c.html.match(/<p>\s*<\/p>/g);
      if (m) vacias.push(`${c.nombre} — ${m.length} parrafo(s) vacio(s)`);
    }
    expect(vacias).toEqual([]);
  });

  test('cada curso activo del catalogo conserva su JSON fuente', () => {
    // Rover no versiona el DISENO de sus cursos (decision abierta), asi que el JSON es el
    // unico original que existe. Perderlo seria perder el curso.
    const faltan = catalogo()
      .filter((c) => c.status === 'active')
      .filter((c) => !fs.existsSync(path.join(GEN, 'borradores', `${c.courseId}.json`)))
      .map((c) => `${c.courseId} — no hay borradores/${c.courseId}.json`);
    expect(faltan).toEqual([]);
  });

  test('ningun curso compilado marca la correcta por posicion (ADR-061)', () => {
    const rotos = [];
    for (const c of compilados()) {
      if (!c.html.includes('shuffleQuizOptions')) continue;   // sin barajado no hay defecto
      if (/options\s*\[\s*quizData\s*\[\s*qIndex\s*\]\s*\]/.test(c.html)) {
        rotos.push(`${c.nombre} — indexa el DOM barajado con el indice del JSON`);
      } else if (!c.html.includes('data-option-index')) {
        rotos.push(`${c.nombre} — sin data-option-index: compilado antes del arreglo`);
      }
    }
    expect(rotos, 'Al fallar un quiz, estos cursos marcan en VERDE una opcion equivocada').toEqual([]);
  });

  // --- Lo que es propio de Rover --------------------------------------------

  test('cada curso habla con el backend de ROVER, no con el de la plataforma', () => {
    // Rover tiene backend, hoja y token propios (ADR-020). Un curso que mandara el token
    // de la plataforma estaria escribiendo en la hoja de otras cuatro lineas; y al reves,
    // el 20-sep-2026 las paginas de verificacion de la plataforma consultaban el backend
    // de Rover y ningun certificado real se podia validar (ADR-070). El cruce ya paso una vez.
    const mal = [];
    for (const c of compilados()) {
      if (c.html.includes('ADULTOS_ASC_2026')) mal.push(`${c.nombre} — lleva el token de la plataforma`);
      if (!c.html.includes('ROVER_ASC_2025')) mal.push(`${c.nombre} — no lleva el token de Rover`);
    }
    expect(mal).toEqual([]);
  });

  test('el certificado se emite UNA vez: el codigo no cambia al volver (27-sep-2026)', () => {
    // Hasta ese dia `generateCertificate()` sacaba un codigo aleatorio NUEVO en cada llamada
    // -y se llama cada vez que se entra al ultimo modulo-, y en cada una escribia otra fila en
    // la hoja de Certificados. Lo cazo `e2e-flujo.spec.js` en su primera corrida.
    const sinIdempotencia = compilados()
      .filter((c) => c.html.includes('function generateCertificate'))
      .filter((c) => !c.html.includes("'certificate_issued_'"))
      .map((c) => `${c.nombre} — sin certificate_issued_: emite un certificado nuevo en cada visita`);
    expect(sinIdempotencia).toEqual([]);
  });

  test('el registro manda su curso al backend (27-sep-2026)', () => {
    // Sin `course`, la fila de Registros queda con la columna Curso vacia y el panel no la ve.
    // La plataforma lo arreglo el 03-ago-2026 (ADR-026); en Rover seguia, y su unica fila de
    // registro hubo que migrarla a mano. Esto vigila la causa; aquella migracion fue el sintoma.
    const sinCurso = [];
    for (const c of compilados()) {
      const m = c.html.match(/sendToGoogleSheets\(\s*\{\s*action:\s*'register'[^}]*\}/);
      if (!m) continue;
      if (!/course\s*:/.test(m[0])) sinCurso.push(`${c.nombre} — el register no lleva course`);
    }
    expect(sinCurso).toEqual([]);
  });
});
