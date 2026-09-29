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

  // --- ADR-086: Rover pasa a plataforma de servicio ----------------------------
  test('el generador no dice sinodal/ayudante ni 18-22 (ADR-086)', () => {
    // «Sinodal» es en las fuentes el experto que ASESORA al joven (Guia de Clan 2018 p. 43;
    // Buenas Practicas de Tropa 2023 p. 28), no el Rover en servicio; y la Rama Rover es de
    // 18 a 20 anos (Modelo de Aplicacion 2026 p. 19 y 21), con salida antes de 21 a. 2 m.
    // Lo que el generador escribe a mano lo hereda cada curso: se vigila en la fuente.
    const src = leer(path.join(GEN, 'build-course.js'));
    expect(src).not.toMatch(/sinodal/i);
    expect(src).not.toMatch(/max="22"/);
    expect(src).toMatch(/min="18" max="21"/);
  });

  test('las guias de autoria no siembran el vocabulario prohibido (ADR-094)', () => {
    // SKILL.md y el comando /generate-course siguieron pidiendo «sinodales/ayudantes» de
    // «18-22 anos» un dia entero despues del ADR-086: lo que la guia pide, el curso lo trae.
    const lex = JSON.parse(leer(path.join(__dirname, '..', 'lexico.json')));
    const guias = [
      path.join(GEN, 'SKILL.md'),
      path.join(REPO, '.claude', 'commands', 'generate-course.md'),
    ];
    const fallos = [];
    for (const f of guias) {
      const txt = leer(f);
      if (txt === null) { fallos.push(`${path.basename(f)}: no existe`); continue; }
      for (const r of lex.prohibido) {
        const m = txt.match(new RegExp(r.patron, 'i'));
        if (m) fallos.push(`${path.basename(f)}: «${m[0]}» — ${r.porQue}`);
      }
    }
    expect(fallos, fallos.join('\n')).toEqual([]);
  });

  test('ningun texto publicado usa el vocabulario prohibido (ADR-086)', () => {
    // Barre la PROSA, no solo el motor: el defecto vivia en los cursos, la portada y los correos.
    const lex = JSON.parse(leer(path.join(__dirname, '..', 'lexico.json')));
    const activos = catalogo().filter((c) => c.status === 'active' && c.file);
    const archivos = [
      ...activos.map((c) => path.join(WEB, c.file)),
      path.join(REPO, 'index.html'),
      path.join(WEB, 'cursos.json'),
      path.join(GEN, 'apps-script', 'Código.js'),
    ];
    const fallos = [];
    for (const f of archivos) {
      const crudo = leer(f);
      if (crudo === null) { fallos.push(`${path.basename(f)}: no existe`); continue; }
      const txt = crudo
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ');
      for (const r of lex.prohibido) {
        const m = txt.match(new RegExp(r.patron, 'i'));
        if (m) fallos.push(`${path.basename(f)}: «${m[0]}» — ${r.porQue} En su lugar: ${r.enSuLugar}`);
      }
    }
    expect(fallos, fallos.join('\n')).toEqual([]);
  });

  // --- ADR-106: kit-builder (Nivel 2) -----------------------------------------
  const kitBueno = () => ({
    type: 'kit-builder',
    labels: { title: 'T', intro: 'I', gamesTitle: 'G', gamesHelp: 'GH', gameWhyPlaceholder: 'P',
      phrasesTitle: 'F', phrasePlaceholder: 'FP', careTitle: 'C', careOwnPlaceholder: 'CO',
      download: 'D', pdfTitle: 'PDF' },
    games: [1, 2, 3, 4, 5].map((n) => ({ id: 'g' + n, name: 'J' + n, detail: 'd', source: 'Guía, p. 1' })),
    phrases: [1, 2, 3].map((n) => ({ id: 'f' + n, situation: 'S' + n })),
    care: [1, 2, 3].map((n) => ({ id: 'c' + n, text: 'C' + n, source: 'Guía, p. 2' })),
  });
  const KIT = () => require(path.join(GEN, 'kit-builder.js'));

  test('validateKit acepta un kit completo (ADR-106)', () => {
    expect(KIT().validateKit(kitBueno())).toEqual([]);
  });

  test('validateKit rechaza labels incompletos, pocos juegos, frases fuera de rango e ids repetidos (ADR-106)', () => {
    const a = kitBueno(); delete a.labels.pdfTitle;
    const b = kitBueno(); b.games = b.games.slice(0, 4);
    const c = kitBueno(); c.phrases = c.phrases.slice(0, 2);
    const d = kitBueno(); d.care = d.care.slice(0, 2);
    const e = kitBueno(); e.games[1].id = 'g1';
    for (const k of [a, b, c, d, e]) expect(KIT().validateKit(k).length).toBeGreaterThan(0);
  });

  test('renderKit dibuja los ganchos del motor y escapa atributos (ADR-106)', () => {
    const k = kitBueno(); k.labels.pdfTitle = 'Mi "kit" <1>'; k.labels.gameWhyPlaceholder = 'a"b';
    const html = KIT().renderKit(k);
    expect(html).toContain('data-kit-builder');
    expect(html).toContain('data-max-games="3"');
    expect((html.match(/data-kit-game="/g) || []).length).toBe(5);
    expect((html.match(/data-kit-why="/g) || []).length).toBe(5);
    expect((html.match(/data-kit-phrase="/g) || []).length).toBe(3);
    expect((html.match(/data-kit-care="/g) || []).length).toBe(3);
    expect(html).toContain('data-kit-care-own');
    expect(html).toContain('data-kit-download');
    expect(html).toContain('data-pdf-title="Mi &quot;kit&quot; &lt;1&gt;"');
    expect(html).not.toContain('placeholder="a"b"');
  });

  test('las normas del kit salen fijas, sin casilla, y piden su titulo (ADR-106)', () => {
    // Una norma de la Guia ("nunca a solas con un cachorro") no se elige: si saliera como
    // casilla, el Rover podria descargar su lista sin ella (auditoria doctrinal, M3).
    const k = kitBueno(); k.care[0].rule = true; k.care[1].rule = true;
    expect(KIT().validateKit(k).join(' ')).toMatch(/rulesTitle/);
    k.labels.rulesTitle = 'Reglas de la Guía';
    expect(KIT().validateKit(k)).toEqual([]);
    const html = KIT().renderKit(k);
    expect((html.match(/data-kit-rule="/g) || []).length).toBe(2);
    expect((html.match(/data-kit-care="/g) || []).length).toBe(1);
    expect(html).not.toContain('data-kit-care="c1"');
  });

  test('el esquema y el build de Rover conocen kit-builder (ADR-106)', () => {
    expect(leer(path.join(GEN, 'course-schema.json'))).toContain('"kit-builder"');
    expect(leer(path.join(GEN, 'build-course.js'))).toMatch(/case 'kit-builder'/);
  });
});
