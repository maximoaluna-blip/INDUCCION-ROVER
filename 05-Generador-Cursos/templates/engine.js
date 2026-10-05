// ============================================
// MOTOR DE CURSOS - PLATAFORMA EDUCATIVA ROVER ASC
// Este archivo es generado automaticamente por build-course.js
// Las variables COURSE_CONFIG y QUIZ_ANSWERS son inyectadas por el builder
// ============================================

// --- Variables globales ---
let currentModule = 0;
let moduleProgress = [];
let quizScores = [];
let startTime = new Date();
let studyTime = 0;
let sessionStartTime = null;
let reflections = {};
let userProfile = {};

// --- Inicializacion ---
window.addEventListener('DOMContentLoaded', function () {
    moduleProgress = new Array(COURSE_CONFIG.totalModules).fill(false);
    sessionStartTime = new Date();
    shuffleQuizOptions();
    loadProgress();
    initKitBuilder();
    initPlanBuilder();
    updateElapsedTime();
});

window.addEventListener('beforeunload', function () {
    saveProgress();
});

// --- Registro ---
function handleRegistration(event) {
    event.preventDefault();
    var formData = new FormData(event.target);
    userProfile = {
        fullName: formData.get('fullName'),
        age: formData.get('age'),
        group: formData.get('group'),
        region: formData.get('region'),
        email: formData.get('email'),
        motivation: formData.get('motivation'),
        registrationDate: new Date().toISOString()
    };
    if (!userProfile.fullName || userProfile.fullName.trim() === '') {
        showNotification('⚠️ El nombre es requerido', 'warning');
        return;
    }
    saveProgress();
    // El curso va EXPLICITO: `userProfile` no lo lleva, y sin el la fila queda con la
    // columna Curso vacia. Era la unica accion del motor que no lo enviaba -- quiz,
    // progress y certificate si lo hacian, por eso los certificados salian bien y los
    // registros no. La plataforma lo corrigio el 03-ago-2026 (ADR-026) y a Rover nadie
    // se lo paso: el 27-sep-2026 su UNICA fila de registro seguia sin curso, y hubo que
    // migrarla a mano. Esto es la causa; aquella migracion fue el sintoma.
    sendToGoogleSheets({ action: 'register', ...userProfile, course: COURSE_CONFIG.courseId });
    showModule(1);
    var firstName = userProfile.fullName.split(' ')[0];
    var welcomeEl = document.getElementById('welcomeName');
    if (welcomeEl) welcomeEl.textContent = firstName;
    showNotification('¡Bienvenido/a ' + firstName + '! 🎉');
}

// --- Navegacion de modulos ---
function showModule(moduleIndex) {
    moduleIndex = parseInt(moduleIndex);
    if (moduleIndex > 0 && (!userProfile || !userProfile.fullName)) {
        showNotification('⚠️ Debes completar el registro primero', 'warning');
        return;
    }
    // Al certificado solo se llega con las lecciones completas y, donde hay plan, con el plan
    // completo: la barra de navegacion lleva ahi con un clic (re-auditoria de S2, ADR-120).
    if (moduleIndex === COURSE_CONFIG.totalModules - 1 && !_certificadoPermitido()) {
        showNotification('Para tu certificado te falta terminar el curso: ' + _certificadoFalta() + '.', 'warning');
        return;
    }
    // Pause and unload videos in the previously active module to free memory
    document.querySelectorAll('.module.active video[data-src]').forEach(function (v) {
        try { v.pause(); } catch (e) {}
        if (v.src) { v.removeAttribute('src'); v.load(); }
    });
    document.querySelectorAll('.module').forEach(function (m) { m.classList.remove('active'); });
    var target = document.getElementById('module-' + moduleIndex);
    if (target) {
        target.classList.add('active');
        // Lazy-load videos in the now-active module: copy data-src to src
        target.querySelectorAll('video[data-src]').forEach(function (v) {
            if (!v.src) { v.src = v.getAttribute('data-src'); }
        });
    }

    document.querySelectorAll('.nav-btn').forEach(function (btn, index) {
        btn.classList.remove('active');
        if (index === moduleIndex) btn.classList.add('active');
    });

    var mobileSelect = document.querySelector('.mobile-nav select');
    if (mobileSelect) mobileSelect.value = moduleIndex;

    currentModule = moduleIndex;

    if (moduleIndex === COURSE_CONFIG.totalModules - 1) {
        generateCertificate();
    }
    updateProgress();
    saveProgress();
    window.scrollTo(0, 0);
}

// --- Sistema de evaluaciones ---
function selectOption(element, optionIndex) {
    var question = element.closest('.question');
    // Limpiar marcas previas (selected, correct, incorrect) de TODAS las opciones de la pregunta:
    // permite reintentar sin que queden colores fantasma de un intento anterior.
    question.querySelectorAll('.option').forEach(function (opt) {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });
    element.classList.add('selected');
    element.setAttribute('data-selected-index', optionIndex);
    // Si el boton "Verificar" estaba oculto tras un fallo, lo restauramos en cuanto el usuario cambia de opcion.
    var quizContainer = element.closest('.quiz-container');
    if (quizContainer) {
        var checkBtn = quizContainer.querySelector('[id^="checkBtn-"]');
        if (checkBtn) checkBtn.style.display = '';
    }
}

// Baraja las opciones de cada pregunta una vez por sesion (Fisher-Yates).
// Cada <label class="option"> conserva su onclick="selectOption(this, oi)" con su indice original,
// asi que CALIFICAR sigue siendo correcto sin tocar build-course.js.
// ⚠️ Pero el FEEDBACK no lo era: checkQuiz indexaba el DOM ya barajado con el indice
// del JSON y resaltaba en verde una opcion equivocada al fallar. Por eso aqui se sella
// data-option-index (ADR-061). Rover llego tarde a este arreglo porque su motor es
// propio: nunca se migro a _MOTOR/ (ADR-025), asi que sincronizar-motor.py no lo toca.
function shuffleQuizOptions() {
    document.querySelectorAll('.quiz-container .question').forEach(function (question) {
        var options = Array.prototype.slice.call(question.querySelectorAll('.option'));
        if (options.length < 2) return;
        // Sella el indice ORIGINAL antes de mover nada: aqui el DOM todavia esta en el
        // orden del JSON, asi que la posicion ES el indice.
        options.forEach(function (opt, i) {
            if (!opt.hasAttribute('data-option-index')) opt.setAttribute('data-option-index', String(i));
        });
        barajarOpciones(question);
    });
}

// Baraja las opciones de UNA pregunta (Fisher-Yates). La usa shuffleQuizOptions al cargar
// y checkQuiz al fallar (ADR-127): rebarajar la pregunta fallada evita que el reintento
// se resuelva por la posicion de la opcion descartada.
function barajarOpciones(question) {
    var options = Array.prototype.slice.call(question.querySelectorAll('.option'));
    if (options.length < 2) return;
    for (var i = options.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = options[i]; options[i] = options[j]; options[j] = tmp;
    }
    options.forEach(function (opt) { question.appendChild(opt); });
}

function checkQuiz(moduleNum) {
    var quizData = QUIZ_ANSWERS[moduleNum];
    if (!quizData) return;

    var questions = document.querySelectorAll('#module-' + moduleNum + ' .question');
    var correctAnswers = 0;
    var totalQuestions = quizData.length;

    var acertadas = [];
    // Primero se califica y despues se marca: lo que se muestra depende de si aprueba (ADR-127).
    questions.forEach(function (question, qIndex) {
        var selectedOption = question.querySelector('.option.selected');
        var ok = false;
        if (selectedOption) {
            var selectedIdx = parseInt(selectedOption.getAttribute('data-selected-index'));
            ok = selectedIdx === quizData[qIndex];
        }
        acertadas.push(ok);
        if (ok) correctAnswers++;
    });

    var score = Math.round((correctAnswers / totalQuestions) * 100);
    quizScores[moduleNum] = score;
    var aprueba = score >= 70;
    var falladas = [];

    questions.forEach(function (question, qIndex) {
        var selectedOption = question.querySelector('.option.selected');
        if (acertadas[qIndex]) {
            if (selectedOption) selectedOption.classList.add('correct');
            return;
        }
        falladas.push(qIndex + 1);
        if (aprueba) {
            // Aprobo con alguna mala: ahi si se ensena cual era la buena.
            if (selectedOption) selectedOption.classList.add('incorrect');
            // POR EL ATRIBUTO, no por la posicion: el DOM esta barajado (ADR-061).
            var laCorrecta = question.querySelector('.option[data-option-index="' + quizData[qIndex] + '"]');
            if (!laCorrecta) laCorrecta = question.querySelectorAll('.option')[quizData[qIndex]];
            if (laCorrecta) laCorrecta.classList.add('correct');
        } else {
            // No aprobo: NO se revela la correcta ni se marca la descartada (ADR-127).
            question.querySelectorAll('.option').forEach(function (opt) {
                opt.classList.remove('selected', 'correct', 'incorrect');
                var radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });
            barajarOpciones(question);
        }
    });

    var checkBtn = document.getElementById('checkBtn-' + moduleNum);
    if (checkBtn) checkBtn.style.display = 'none';

    if (aprueba) {
        var nextBtn = document.getElementById('nextBtn-' + moduleNum);
        if (nextBtn) nextBtn.classList.remove('hidden');

        // Desbloquear logros
        COURSE_CONFIG.achievements.forEach(function (ach) {
            if (ach.unlockOnModule === moduleNum) unlockAchievement(ach.id);
        });

        showNotification('¡Excelente! Obtuviste ' + score + '% ✅');
        mostrarResultadoQuiz(moduleNum, '¡Excelente! Obtuviste ' + score + '% ✅');
        sendToGoogleSheets({
            action: 'quiz', name: userProfile.fullName, email: userProfile.email,
            module: moduleNum, score: score, course: COURSE_CONFIG.courseId
        });
    } else {
        // Habla de preguntas, no de porcentajes (ADR-091) y ya no revela la buena (ADR-127).
        var cuales = falladas.length === 1
            ? 'Fallaste la pregunta ' + falladas[0]
            : 'Fallaste las preguntas ' + falladas.slice(0, -1).join(', ') + ' y ' + falladas[falladas.length - 1];
        var aviso = cuales + '. Revisa ' + (falladas.length === 1 ? 'esa parte' : 'esas partes') +
            ' de la lección y vuelve a intentarlo; puedes hacerlo las veces que quieras.';
        showNotification(aviso, 'warning');
        mostrarResultadoQuiz(moduleNum, aviso, 'warning');
        // No auto-reset: en cuanto el usuario hace clic en una opcion, selectOption() limpia las marcas
        // de esa pregunta y vuelve a mostrar el boton "Verificar". Esto evita que un reset por tiempo
        // borrara la nueva seleccion del usuario antes de que pulsara verificar.
    }
    saveProgress();
}

function completeModule(moduleNum) {
    // El certificado del Nivel 3 dice que el Rover DISEÑÓ su plan: la leccion del resumen no
    // se completa con el plan incompleto (ADR-120).
    var modEl = document.getElementById('module-' + moduleNum);
    if (modEl && modEl.querySelector('[data-plan-summary]') && typeof planMissing === 'function') {
        var faltan = planMissing();
        if (faltan.length) {
            showNotification('Tu certificado espera tu plan completo. Te falta: ' +
                faltan.map(_planFaltaTexto).join('; ') + '. Sube a «Tu plan completo»: cada parte tiene su botón «Editar esta parte».', 'warning');
            return;
        }
    }
    moduleProgress[moduleNum] = true;
    sendToGoogleSheets({
        action: 'progress', name: userProfile.fullName, email: userProfile.email,
        moduleCompleted: moduleNum, course: COURSE_CONFIG.courseId
    });
    var navBtns = document.querySelectorAll('.nav-btn');
    if (navBtns[moduleNum]) navBtns[moduleNum].classList.add('completed');
    showModule(moduleNum + 1);
    saveProgress();
    updateProgress();
    updateStats();
}

// --- Progreso ---
function updateProgress() {
    var completed = moduleProgress.filter(Boolean).length;
    var total = COURSE_CONFIG.contentModules;
    var pct = Math.round((completed / total) * 100);
    var bar = document.getElementById('progressBar');
    var text = document.getElementById('progressText');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '%';

    updateElapsedTime();
}

function updateElapsedTime() {
    var timeEl = document.getElementById('elapsedTime');
    if (!timeEl || !sessionStartTime) return;
    var totalMinutes = studyTime;
    if (totalMinutes < 60) {
        timeEl.textContent = totalMinutes + ' min';
    } else {
        var hours = Math.floor(totalMinutes / 60);
        var mins = totalMinutes % 60;
        timeEl.textContent = hours + 'h ' + (mins < 10 ? '0' : '') + mins + 'min';
    }
}

function updateStats() {
    var completed = moduleProgress.filter(Boolean).length;
    var quizzes = quizScores.filter(function (s) { return s >= 70; }).length;
    var el1 = document.getElementById('modulesCompleted');
    var el2 = document.getElementById('quizzesCompleted');
    var el3 = document.getElementById('studyTime');
    if (el1) el1.textContent = completed;
    if (el2) el2.textContent = quizzes;
    if (el3) el3.textContent = studyTime;
}

// --- Persistencia ---
function saveProgress() {
    var key = 'courseProgress_' + COURSE_CONFIG.courseId;
    var progress = {
        userProfile: userProfile, moduleProgress: moduleProgress,
        quizScores: quizScores, studyTime: studyTime, reflections: reflections,
        currentModule: currentModule, startTime: startTime.toISOString(),
        lastSaved: new Date().toISOString(), version: '3.0'
    };
    localStorage.setItem(key, JSON.stringify(progress));
    var indicator = document.getElementById('saveIndicator');
    if (indicator) { indicator.classList.add('show'); setTimeout(function () { indicator.classList.remove('show'); }, 2000); }
}

function loadProgress() {
    var key = 'courseProgress_' + COURSE_CONFIG.courseId;
    var saved = localStorage.getItem(key);
    if (saved) {
        var p = JSON.parse(saved);
        userProfile = p.userProfile || {};
        moduleProgress = p.moduleProgress || new Array(COURSE_CONFIG.totalModules).fill(false);
        quizScores = p.quizScores || [];
        // Un quiz ya aprobado conserva su boton de avance al volver: quien se bloqueo por el
        // plan y regresa otro dia no tiene que contestarlo de nuevo (ADR-120).
        quizScores.forEach(function (sc, m) {
            var nb = sc >= 70 ? document.getElementById('nextBtn-' + m) : null;
            if (nb) nb.classList.remove('hidden');
        });
        studyTime = p.studyTime || 0;
        reflections = p.reflections || {};
        currentModule = p.currentModule || 0;
        startTime = new Date(p.startTime || new Date());
        if (userProfile.fullName) {
            showModule(currentModule);
            var welcomeEl = document.getElementById('welcomeName');
            if (welcomeEl) welcomeEl.textContent = userProfile.fullName.split(' ')[0];
            showNotification('¡Bienvenido de vuelta, ' + userProfile.fullName.split(' ')[0] + '! 👋');
        }
        Object.keys(reflections).forEach(function (k) {
            var ta = document.getElementById('reflection-' + k);
            if (ta) ta.value = reflections[k];
        });
        var compromiso = localStorage.getItem('commitment_' + COURSE_CONFIG.courseId);
        var compromisoTa = document.getElementById('commitment');
        if (compromiso && compromisoTa) compromisoTa.value = compromiso;
        updateStats();
        updateProgress();
    }
}

// --- Logros ---
function unlockAchievement(achievementId) {
    var el = document.getElementById(achievementId);
    if (el && !el.classList.contains('earned')) {
        el.classList.add('earned');
        showNotification('¡Logro desbloqueado: ' + el.textContent + '! 🏆');
    }
}

// --- Notificaciones ---
function showNotification(message, type) {
    var n = document.createElement('div');
    n.className = 'notification';
    if (type === 'warning') n.style.background = '#FF9800';
    n.textContent = message;
    // ADR-135: en el celular, abajo y a lo ancho, encima del selector de lecciones; arriba tapaba
    // el encabezado y el comienzo del texto.
    if (window.innerWidth <= 600) {
        n.style.top = 'auto';
        n.style.bottom = '90px';
        n.style.left = '12px';
        n.style.right = '12px';
        n.style.maxWidth = 'none';
    }
    document.body.appendChild(n);
    // ADR-135: dura según el largo (mínimo 3 s; unos 6 s el aviso de fallo): con 3 s fijos, un
    // aviso de 23 palabras desaparecía antes de poder leerlo.
    var dura = Math.max(3000, Math.min(8000, String(message).length * 55));
    setTimeout(function () {
        n.style.animation = 'slideOut 0.3s';
        setTimeout(function () { n.remove(); }, 300);
    }, dura);
}

// ADR-135: el resultado del quiz queda escrito DENTRO del quiz, bajo el botón Verificar, hasta el
// siguiente intento. El aviso flotante se va solo; este no, para que se pueda releer.
function mostrarResultadoQuiz(moduleNum, texto, tipo) {
    var cont = document.querySelector('#module-' + moduleNum + ' .quiz-container');
    if (!cont) return;
    var r = cont.querySelector('.quiz-resultado');
    if (!r) {
        r = document.createElement('div');
        r.className = 'quiz-resultado';
        r.setAttribute('role', 'status');
        r.setAttribute('aria-live', 'polite');
        r.style.cssText = 'margin-top: 14px; padding: 12px 14px; border-radius: 6px; font-weight: 600; line-height: 1.45;';
        var boton = document.getElementById('checkBtn-' + moduleNum);
        if (boton && boton.parentNode === cont) cont.insertBefore(r, boton.nextSibling);
        else cont.appendChild(r);
    }
    var ok = tipo !== 'warning';
    r.style.background = ok ? '#e8f5e9' : '#fff3e0';
    r.style.color = ok ? '#1b5e20' : '#5d3200';
    r.style.borderLeft = '4px solid ' + (ok ? '#2e7d32' : '#e65100');
    r.textContent = texto;
}

// --- Reflexiones ---
function saveReflection(moduleNum, text) {
    reflections[moduleNum] = text;
    saveProgress();
    // Sincronizacion en segundo plano al backend (fire-and-forget)
    if (userProfile && userProfile.email && typeof sendToGoogleSheets === 'function') {
        sendToGoogleSheets({
            action: 'reflection',
            email: userProfile.email,
            name: userProfile.fullName,
            course: COURSE_CONFIG.courseId,
            moduleId: String(moduleNum),
            texto: text || ''
        });
    }
}

function saveCommitment(text) {
    localStorage.setItem('commitment_' + COURSE_CONFIG.courseId, text);
}

// --- Certificado ---
// Lo que falta para el certificado: lecciones con quiz sin completar y campos del plan vacios.
function _certificadoFalta() {
    var faltan = [];
    document.querySelectorAll('[id^="checkBtn-"]').forEach(function (b) {
        var n = parseInt(b.id.replace('checkBtn-', ''), 10);
        if (!moduleProgress[n]) {
            var nav = document.querySelectorAll('.nav-btn')[n];
            faltan.push('la lección ' + (nav ? '«' + nav.textContent.replace(/\s+/g, ' ').trim() + '»' : n));
        }
    });
    if (document.querySelector('[data-plan-summary]') && typeof planMissing === 'function') {
        planMissing().forEach(function (x) { faltan.push(_planFaltaTexto(x)); });
    }
    return faltan.join('; ');
}

function _certificadoPermitido() {
    // Quien ya tiene su certificado emitido vuelve a verlo sin condiciones.
    try { if (JSON.parse(localStorage.getItem('certificate_issued_' + COURSE_CONFIG.courseId) || 'null')) return true; } catch (e) {}
    return _certificadoFalta() === '';
}

function generateCertificate() {
    var date = new Date();
    var el = function (id) { return document.getElementById(id); };

    // IDEMPOTENCIA: el certificado se emite UNA sola vez por curso.
    // Hasta el 27-sep-2026 esta funcion generaba un codigo ALEATORIO NUEVO en cada
    // llamada, y la llamada ocurre cada vez que se entra al ultimo modulo. Consecuencias
    // medidas: el codigo que la persona apunto dejaba de ser el que ve al volver, y
    // CADA VISITA escribia otra fila en la hoja de Certificados -- inflando el conteo y,
    // desde el ADR-082, la tasa de completacion que ese conteo alimenta. Lo caza la suite
    // E2E estrenada ese dia: fue su primer rojo. La plataforma lo resolvio asi y a Rover,
    // con motor propio, nadie se lo paso.
    var courseKey = 'certificate_issued_' + COURSE_CONFIG.courseId;
    var issued = null;
    try { issued = JSON.parse(localStorage.getItem(courseKey) || 'null'); } catch (e) { issued = null; }

    var esNuevo = !(issued && issued.code);
    var code = esNuevo
        ? 'ASC-' + date.getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase()
        : issued.code;
    var fechaISO = esNuevo ? date.toISOString() : (issued.date || date.toISOString());

    if (el('studentName')) el('studentName').textContent = userProfile.fullName || 'Rover Scout';
    if (el('certDate')) el('certDate').textContent = new Date(fechaISO).toLocaleDateString('es-CO');
    if (el('totalTime')) el('totalTime').textContent = studyTime;
    if (el('certGroup')) el('certGroup').textContent = userProfile.group || 'N/A';
    if (el('certRegion')) el('certRegion').textContent = userProfile.region || 'Colombia';
    if (el('certCode')) el('certCode').textContent = code;

    // quizScores se indexa por NUMERO DE MODULO, y los modulos con quiz empiezan en el 2:
    // los indices bajos quedan VACIOS. reduce() se salta los huecos pero length los CUENTA,
    // asi que seis quizzes perfectos daban 600/8 = 75. Se promedia sobre los que existen.
    // (19-sep-2026: el certificado imprimia 75 % a quien habia acertado todo, en las 5 lineas.)
    var puntajes = quizScores.filter(function (s) { return typeof s === 'number'; });
    var avg = esNuevo
        ? (puntajes.length > 0 ? Math.round(puntajes.reduce(function (a, b) { return a + b; }, 0) / puntajes.length) : 100)
        : issued.score;
    if (el('finalScore')) el('finalScore').textContent = avg;

    // Mismo criterio que el motor compartido: el logro final es el que declara
    // `unlockOnModule: -1`, no el que se llame 'achievement-5'. Aqui acertaba por
    // coincidencia (en Fundamentos el logro final SI se llama asi); se barre por la
    // convencion para que un tercer curso de la linea no herede el defecto.
    COURSE_CONFIG.achievements.forEach(function (ach) {
        if (ach.unlockOnModule === -1) unlockAchievement(ach.id);
    });
    var bar = document.getElementById('progressBar');
    var text = document.getElementById('progressText');
    if (bar) bar.style.width = '100%';
    if (text) text.textContent = '100%';

    // Solo la PRIMERA emision escribe y sincroniza: es lo que evita la fila duplicada
    // en la hoja cada vez que alguien vuelve a mirar su certificado.
    if (esNuevo) {
        sendToGoogleSheets({
            action: 'certificate', name: userProfile.fullName, email: userProfile.email,
            group: userProfile.group, region: userProfile.region, certificateCode: code,
            completionDate: fechaISO, score: avg, studyTime: studyTime,
            course: COURSE_CONFIG.courseId
        });
        var registro = JSON.stringify({
            name: userProfile.fullName, code: code, date: fechaISO,
            score: avg, course: COURSE_CONFIG.courseId
        });
        localStorage.setItem('certificate_' + code, registro);
        localStorage.setItem(courseKey, registro);
    }
}

// --- Descargar certificado como PDF ---
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768);
}

// --- Utilidades internas para el PDF ---
function _txt(id, fallback) {
    var el = document.getElementById(id);
    return el ? (el.textContent || '').trim() : (fallback || '');
}

function _imgToDataURL(imgEl) {
    return new Promise(function(resolve) {
        if (!imgEl) { resolve(null); return; }
        try {
            var canvas = document.createElement('canvas');
            var w = imgEl.naturalWidth || imgEl.width || 200;
            var h = imgEl.naturalHeight || imgEl.height || 200;
            canvas.width = w; canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(imgEl, 0, 0, w, h);
            resolve({ data: canvas.toDataURL('image/png'), w: w, h: h });
        } catch (e) { resolve(null); }
    });
}

function _wrapText(pdf, text, maxWidth) {
    return pdf.splitTextToSize(text || '', maxWidth);
}

// Dirección de la página que verifica los certificados de ESTA línea (ADR-128). Se
// deduce de la URL del curso: los cursos viven en <repo>/02-Plataforma-Web/ y la
// página en la raíz del repo (ADR-070). Sin http(s) (curso abierto como archivo) no
// hay dirección que imprimir y se devuelve null.
function urlVerificacion(code) {
    if (!/^https?:$/.test(location.protocol)) return null;
    var base = location.pathname.replace(/\/02-Plataforma-Web\/[^\/]*$/, '/');
    if (base === location.pathname) base = location.pathname.replace(/[^\/]*$/, '');
    var pagina = location.host + base + 'verificar-certificado.html';
    return {
        visible: pagina,
        enlace: location.protocol + '//' + pagina + (code ? '?codigo=' + encodeURIComponent(code) : '')
    };
}

function downloadCertificatePDF() {
    var certModule = document.getElementById('module-' + (COURSE_CONFIG.totalModules - 1));
    var cert = certModule ? certModule.querySelector('.certificate') : null;
    if (!cert) {
        showNotification('El certificado aún no está disponible.');
        return;
    }

    // Localizar jsPDF (viene incluido en el bundle de html2pdf)
    var JsPDF = (window.jspdf && window.jspdf.jsPDF) || (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!JsPDF) {
        showNotification('La librería de PDF no cargó. Verifica tu conexión.');
        if (confirm('¿Deseas usar la opción de Imprimir en su lugar?')) { window.print(); }
        return;
    }

    var code = _txt('certCode', 'certificado');
    var filename = 'Certificado-' + code + '.pdf';
    var mobile = isMobileDevice();
    showNotification('Generando PDF...');

    // Datos del certificado
    var student = _txt('studentName', 'Estudiante');
    var date = _txt('certDate', '');
    var score = _txt('finalScore', '');
    var group = _txt('certGroup', '');
    var region = _txt('certRegion', '');
    var totalTime = _txt('totalTime', '');
    var courseName = (COURSE_CONFIG.certificateCourseName || COURSE_CONFIG.title || '').toUpperCase();
    var courseDescription = COURSE_CONFIG.certificateDescription ||
        'ha completado exitosamente el curso de formación de la Plataforma Rover ASC';

    // Cargar logos
    var ascImg = cert.querySelector('img[src*="logo-asc"]');
    var valleImg = cert.querySelector('img[src*="logo-vallescout"]');

    Promise.all([_imgToDataURL(ascImg), _imgToDataURL(valleImg)]).then(function(logos) {
        var logoASC = logos[0], logoValle = logos[1];

        // A4 portrait: 210 x 297 mm
        var pdf = new JsPDF('p', 'mm', 'a4');
        var pageW = 210, pageH = 297;

        // --- Marco morado exterior ---
        pdf.setDrawColor(98, 37, 153);
        pdf.setLineWidth(1.2);
        pdf.rect(8, 8, pageW - 16, pageH - 16);

        // --- Esquinas decorativas amarillas ---
        pdf.setDrawColor(255, 230, 117);
        pdf.setLineWidth(2);
        var cs = 20; // corner size
        // Top-left
        pdf.line(8, 8, 8 + cs, 8);
        pdf.line(8, 8, 8, 8 + cs);
        // Top-right
        pdf.line(pageW - 8, 8, pageW - 8 - cs, 8);
        pdf.line(pageW - 8, 8, pageW - 8, 8 + cs);
        // Bottom-left
        pdf.line(8, pageH - 8, 8 + cs, pageH - 8);
        pdf.line(8, pageH - 8, 8, pageH - 8 - cs);
        // Bottom-right
        pdf.line(pageW - 8, pageH - 8, pageW - 8 - cs, pageH - 8);
        pdf.line(pageW - 8, pageH - 8, pageW - 8, pageH - 8 - cs);

        var y = 30; // cursor vertical

        // --- Logos ---
        var logoH = 18;
        var logoGap = 8;
        var logoASCw = logoASC ? logoH * (logoASC.w / logoASC.h) : 0;
        var logoValleW = logoValle ? logoH * (logoValle.w / logoValle.h) : 0;
        var totalLogosW = logoASCw + logoGap + logoValleW;
        var logosX = (pageW - totalLogosW) / 2;
        if (logoASC) pdf.addImage(logoASC.data, 'PNG', logosX, y, logoASCw, logoH);
        if (logoValle) pdf.addImage(logoValle.data, 'PNG', logosX + logoASCw + logoGap, y, logoValleW, logoH);
        y += logoH + 6;

        // --- Encabezado institucional ---
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(98, 37, 153);
        pdf.text('ASOCIACIÓN SCOUTS DE COLOMBIA', pageW / 2, y, { align: 'center' });
        y += 5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text('Regional Valle del Cauca', pageW / 2, y, { align: 'center' });
        y += 5;

        // --- Línea divisoria morada ---
        pdf.setDrawColor(98, 37, 153);
        pdf.setLineWidth(0.6);
        pdf.line(40, y, pageW - 40, y);
        y += 10;

        // --- Título "CERTIFICADO DE APROBACIÓN" ---
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(98, 37, 153);
        pdf.text('CERTIFICADO DE APROBACIÓN', pageW / 2, y, { align: 'center' });
        y += 12;

        // --- Banner morado con nombre del curso ---
        pdf.setFillColor(98, 37, 153);
        pdf.rect(20, y, pageW - 40, 14, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(255, 255, 255);
        var courseLines = _wrapText(pdf, courseName, pageW - 50);
        if (courseLines.length > 1) {
            pdf.setFontSize(11);
        }
        pdf.text(courseLines[0], pageW / 2, y + 9, { align: 'center' });
        y += 20;

        // --- "Se otorga a" ---
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(99, 99, 99);
        pdf.text('Se otorga el presente certificado a', pageW / 2, y, { align: 'center' });
        y += 10;

        // --- Nombre del estudiante ---
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(98, 37, 153);
        pdf.text(student, pageW / 2, y, { align: 'center' });
        // Subrayado amarillo bajo el nombre
        var nameW = pdf.getTextWidth(student);
        pdf.setDrawColor(255, 230, 117);
        pdf.setLineWidth(1.5);
        pdf.line((pageW - nameW) / 2 - 5, y + 2, (pageW + nameW) / 2 + 5, y + 2);
        y += 12;

        // --- Descripción ---
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(99, 99, 99);
        var descLines = _wrapText(pdf, courseDescription, pageW - 60);
        for (var i = 0; i < descLines.length && i < 3; i++) {
            pdf.text(descLines[i], pageW / 2, y, { align: 'center' });
            y += 5;
        }
        y += 5;

        // --- Tarjeta de detalles ---
        var detX = 25, detW = pageW - 50, detH = 38;
        pdf.setFillColor(249, 247, 252);
        pdf.rect(detX, y, detW, detH, 'F');
        pdf.setFillColor(98, 37, 153);
        pdf.rect(detX, y, 2, detH, 'F'); // borde izquierdo morado

        var colX1 = detX + 8;
        var colX2 = detX + detW / 2 + 5;
        var rowY = y + 8;
        var rowGap = 7;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);

        function _detail(label, value, x, yy) {
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(98, 37, 153);
            pdf.text(label, x, yy);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(60, 60, 60);
            pdf.text(String(value || '-'), x + pdf.getTextWidth(label) + 2, yy);
        }

        _detail('Fecha: ', date, colX1, rowY);
        _detail('Puntuación: ', score + '%', colX2, rowY);
        _detail('Grupo Scout: ', group, colX1, rowY + rowGap);
        _detail('Región: ', region, colX2, rowY + rowGap);
        _detail('Tiempo: ', totalTime + ' min', colX1, rowY + rowGap * 2);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(98, 37, 153);
        pdf.text('Estado: ', colX2, rowY + rowGap * 2);
        pdf.setTextColor(46, 125, 50);
        pdf.text('APROBADO', colX2 + pdf.getTextWidth('Estado: ') + 2, rowY + rowGap * 2);

        y += detH + 8;

        // --- Código de verificación ---
        var codeBoxH = 14;
        pdf.setDrawColor(98, 37, 153);
        pdf.setLineWidth(0.4);
        pdf.setLineDashPattern([1.5, 1.5], 0);
        pdf.setFillColor(250, 248, 253);
        pdf.rect(50, y, pageW - 100, codeBoxH, 'FD');
        pdf.setLineDashPattern([], 0);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(140, 140, 140);
        pdf.text('CÓDIGO DE VERIFICACIÓN', pageW / 2, y + 5, { align: 'center' });
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(98, 37, 153);
        pdf.text(code, pageW / 2, y + 11, { align: 'center' });
        y += codeBoxH + 6;

        // --- Footer ---
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Plataforma de Formación Rover ASC  |  vallescout.org.co', pageW / 2, pageH - 16, { align: 'center' });
        pdf.setFontSize(6);
        // ADR-128: el pie dice DONDE se verifica y, en el PDF, se puede pulsar con el
        // codigo ya puesto. Antes decia «en la plataforma web» sin decir cual.
        var verif = urlVerificacion(code);
        if (verif) {
            var pie = 'Verifica este certificado en ' + verif.visible;
            pdf.textWithLink(pie, (pageW - pdf.getTextWidth(pie)) / 2, pageH - 12, { url: verif.enlace });
        } else {
            pdf.text('Verifica este certificado con su código en la página de verificación de la plataforma', pageW / 2, pageH - 12, { align: 'center' });
        }

        // --- Guardar ---
        if (mobile) {
            var blob = pdf.output('blob');
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url; link.download = filename; link.target = '_blank';
            document.body.appendChild(link); link.click();
            setTimeout(function() { document.body.removeChild(link); URL.revokeObjectURL(url); }, 5000);
        } else {
            pdf.save(filename);
        }
        showNotification('PDF descargado: ' + filename + ' 📥');
    }).catch(function(err) {
        if (typeof console !== 'undefined') console.error('Error PDF:', err);
        showNotification('Error al generar PDF. Intenta con Imprimir.', 'warning');
        if (confirm('¿Deseas usar la opción de Imprimir?')) { window.print(); }
    });
}

// --- Compartir ---
function shareResults() {
    var text = '¡He completado el curso ' + COURSE_CONFIG.title + '! 🏕️\n\n' +
        'Certificado: ' + document.getElementById('certCode').textContent + '\n' +
        'Puntuación: ' + document.getElementById('finalScore').textContent + '%\n\n' +
        '#ScoutsSiempreListos #RoverScout #ASC';
    if (navigator.share) {
        navigator.share({ title: COURSE_CONFIG.title + ' Completado', text: text });
    } else {
        navigator.clipboard.writeText(text);
        showNotification('¡Texto copiado al portapapeles! 📋');
    }
}

function restartCourse() {
    if (confirm('¿Estás seguro de que quieres reiniciar el curso? Se perderá todo el progreso.')) {
        localStorage.removeItem('courseProgress_' + COURSE_CONFIG.courseId);
        localStorage.removeItem('commitment_' + COURSE_CONFIG.courseId);
        localStorage.removeItem('rover:kit_' + COURSE_CONFIG.courseId);
        localStorage.removeItem('rover:plan_' + COURSE_CONFIG.courseId);
        location.reload();
    }
}

// --- Registration mode toggle ---
function toggleRegistrationMode(mode) {
    var newRegBtn = document.getElementById('toggleNewReg');
    var recoverBtn = document.getElementById('toggleRecover');
    var recoverySection = document.getElementById('recoverySection');
    var registrationForm = document.getElementById('registrationForm');

    if (mode === 'recover') {
        newRegBtn.classList.remove('active');
        recoverBtn.classList.add('active');
        recoverySection.classList.remove('hidden');
        registrationForm.style.display = 'none';
    } else {
        newRegBtn.classList.add('active');
        recoverBtn.classList.remove('active');
        recoverySection.classList.add('hidden');
        registrationForm.style.display = '';
    }
}

// --- Recovery from server ---
function recoverProgress() {
    var emailInput = document.getElementById('recoveryEmail');
    var email = emailInput.value.trim();
    var msgDiv = document.getElementById('recoveryMessage');

    if (!email) {
        showNotification('⚠️ Ingresa tu correo electronico', 'warning');
        return;
    }

    // Ley 1581 de 2012. La autorizacion va donde se capturan los datos, y recuperar
    // el avance PUEDE CREAR LA INSCRIPCION: es una puerta de entrada mas. La del
    // registro la bloquea el navegador con `required`; esta no vive dentro de un
    // <form>, asi que se mira a mano.
    var consentRec = document.getElementById('consentRecover');
    if (consentRec && !consentRec.checked) {
        showNotification('⚠️ Para continuar, autoriza el tratamiento de tus datos', 'warning');
        return;
    }

    msgDiv.style.display = 'block';
    msgDiv.innerHTML = '<p style="color: #622599; font-weight: 600;">🔄 Buscando tu avance...</p>';

    var url = COURSE_CONFIG.googleScriptUrl +
        '?action=recover&email=' + encodeURIComponent(email) +
        '&course=' + encodeURIComponent(COURSE_CONFIG.courseId) +
        '&token=ROVER_ASC_2025';

    fetch(url, { redirect: 'follow' })
        .then(function(response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(function(data) {

            // El Apps Script devuelve: { success: true, data: { registration, modules, quizzes, certificates } }
            var isFound = (data && data.found) || (data && data.success && data.data);

            if (isFound) {
                var serverData = data.data || data;
                var reg = serverData.registration || data.userProfile || {};
                // El backend devuelve filas de TODOS los cursos del correo: solo cuentan las de
                // este curso. Sin este filtro, terminar la Tropa abria el certificado de la Manada
                // (revision final del ADR-120).
                var deEsteCurso = function (x) { return x && x.course === COURSE_CONFIG.courseId; };
                var mods = (serverData.modules || []).filter(deEsteCurso);
                var quizzes = (serverData.quizzes || []).filter(deEsteCurso);
                // Un certificado ya emitido para este curso se reabre en este equipo con su mismo
                // codigo: el plan del Nivel 3 vive solo en el navegador donde se escribio, y sin
                // esto un certificado ganado quedaba bloqueado (y al rehacerlo, salia otro codigo).
                var certEmitido = (serverData.certificates || []).filter(deEsteCurso)[0];
                if (certEmitido && certEmitido.certificateCode) {
                    try {
                        var claveCert = 'certificate_issued_' + COURSE_CONFIG.courseId;
                        if (!localStorage.getItem(claveCert)) {
                            localStorage.setItem(claveCert, JSON.stringify({
                                name: (reg && reg.fullName) || '', code: certEmitido.certificateCode,
                                date: certEmitido.completionDate || '', score: certEmitido.score,
                                course: COURSE_CONFIG.courseId }));
                        }
                    } catch (e) {}
                }

                // Reconstruir userProfile desde registration
                if (reg.fullName || reg.name) {
                    userProfile = {
                        fullName: reg.fullName || reg.name || '',
                        age: reg.age || '',
                        group: reg.group || '',
                        region: reg.region || '',
                        email: reg.email || email,
                        motivation: reg.motivation || '',
                        registrationDate: reg.registrationDate || reg.timestamp || ''
                    };
                } else if (data.userProfile) {
                    userProfile = data.userProfile;
                }

                // Reconstruir moduleProgress desde modules array
                if (mods.length > 0) {
                    moduleProgress = new Array(COURSE_CONFIG.totalModules).fill(false);
                    mods.forEach(function(m) {
                        var modNum = m.moduleCompleted || m.module;
                        if (modNum !== undefined && modNum < moduleProgress.length) {
                            moduleProgress[modNum] = true;
                        }
                    });
                } else if (data.moduleProgress) {
                    moduleProgress = data.moduleProgress;
                }

                // Reconstruir quizScores desde quizzes array
                if (quizzes.length > 0) {
                    quizScores = [];
                    quizzes.forEach(function(q) {
                        var modNum = q.module;
                        var score = q.score;
                        if (modNum !== undefined && score !== undefined) {
                            quizScores[modNum] = parseInt(score);
                        }
                    });
                } else if (data.quizScores) {
                    quizScores = data.quizScores;
                }

                // StudyTime: el unico dato de sesion que el backend sigue devolviendo
                if (data.studyTime) studyTime = data.studyTime;

                // ADR-074 - AQUI NO SE HIDRATA NINGUN TEXTO, A PROPOSITO.
                // `recover` no esta autenticado: pide un correo y nada mas. Por eso el
                // backend de Rover -que es propio, con su hoja y su token- dejo de mandar
                // lo que la persona escribio y solo dice QUE hay guardado (serverData.saved).
                // Lo escrito vive en el navegador donde se escribio, y alli sigue.
                var guardado = serverData.saved || {};
                var anotaciones = 0;
                Object.keys(guardado.reflections || {}).forEach(function (cid) {
                    anotaciones += (guardado.reflections[cid] || []).length;
                });
                Object.keys(guardado.commitments || {}).forEach(function (cid) {
                    anotaciones += guardado.commitments[cid] || 0;
                });
                anotaciones += (guardado.plans || []).length + (guardado.assessments || []).length;

                saveProgress();
                updateStats();
                updateProgress();

                // --- Recuperar TAMBIEN inscribe en este curso (ADR-082) ---
                // `recover` busca por correo y devuelve la inscripcion que encuentre,
                // sea del curso que sea: se entraba aqui con el registro de OTRO curso,
                // se hacia este entero y al final se escribia el certificado pero nunca
                // la inscripcion. En la plataforma eso dejo 7 certificados sin fila y
                // una linea entera figurando con 0 adultos (ADR-080).
                // Se inscribe SOLO ante un `false` explicito: un `undefined` de un
                // despliegue anterior no puede leerse como "vuelve a inscribirla".
                var inscritoAhora = false;
                if (serverData.registeredInCourse === false && userProfile && userProfile.fullName) {
                    // Campo a campo y no con spread, para que se vea que `motivation`
                    // va vacia: `recover` no la devuelve desde el ADR-074.
                    sendToGoogleSheets({
                        action: 'register',
                        fullName: userProfile.fullName,
                        age: userProfile.age,
                        group: userProfile.group,
                        region: userProfile.region,
                        email: userProfile.email,
                        motivation: '',
                        registrationDate: new Date().toISOString(),
                        course: COURSE_CONFIG.courseId
                    });
                    inscritoAhora = true;
                }

                // Determinar último módulo completado
                var lastModule = data.currentModule || 0;
                if (!lastModule && moduleProgress.length > 0) {
                    for (var i = moduleProgress.length - 1; i >= 0; i--) {
                        if (moduleProgress[i]) { lastModule = i + 1; break; }
                    }
                }

                var firstName = userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Scout';
                var welcomeEl = document.getElementById('welcomeName');
                if (welcomeEl) welcomeEl.textContent = firstName;

                var completedCount = moduleProgress.filter(Boolean).length;
                showNotification('¡Avance recuperado, ' + firstName + '! ' + completedCount + ' módulos completados 🎉');

                // Si acabamos de inscribirla en este curso, se dice: el dato se arregla
                // y el texto lo cuenta, que son la misma mitad de la decision.
                var avisoInscripcion = inscritoAhora
                    ? '<p style="color: #2e7d32; margin-top: 10px;">Te inscribimos en <strong>este curso</strong> con esos mismos datos.</p>'
                    : '';
                var avisoAnotaciones = anotaciones > 0
                    ? '<p style="color: #636363; margin-top: 10px;">Tienes <strong>' + anotaciones +
                      '</strong> anotaciones guardadas. Lo que escribes <strong>no se recupera por correo</strong>: ' +
                      'se queda en el navegador donde lo escribiste.</p>'
                    : '';

                if ((anotaciones > 0 || inscritoAhora) && typeof msgDiv !== 'undefined' && msgDiv) {
                    msgDiv.style.display = 'block';
                    msgDiv.innerHTML = '<p style="color: #2e7d32; font-weight: 600;">✅ Recuperamos tu avance.</p>' +
                        avisoInscripcion + avisoAnotaciones;
                }
                showModule(lastModule > 0 ? lastModule : 1);
            } else {
                var reason = (data && data.message) ? data.message : 'No se encontro avance asociado a este correo.';
                msgDiv.innerHTML = '<p style="color: #FF9800; font-weight: 600;">⚠️ ' + reason + '</p>' +
                    '<p style="color: #636363; margin-top: 10px;">Puedes registrarte como nuevo usuario.</p>' +
                    '<button class="btn" style="margin-top: 10px;" onclick="toggleRegistrationMode(\'new\')">🆕 Registrarme</button>';
            }
        })
        .catch(function(err) {
            if (typeof console !== 'undefined') console.error('[Recovery] Error:', err);
            msgDiv.innerHTML = '<p style="color: #f44336; font-weight: 600;">❌ Error al conectar con el servidor.</p>' +
                '<p style="color: #636363; margin-top: 10px;">Error: ' + err.message + '</p>' +
                '<p style="color: #636363; margin-top: 5px;">Verifica tu conexion a internet e intenta de nuevo.</p>';
        });
}

// --- Google Sheets ---
function sendToGoogleSheets(data) {
    if (!COURSE_CONFIG.googleScriptUrl) return;
    try {
        var indicator = document.getElementById('syncIndicator');
        if (indicator) indicator.classList.add('show');
        var payload = Object.assign({}, data, {
            token: 'ROVER_ASC_2025',
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        // Try CORS first, fall back to no-cors
        fetch(COURSE_CONFIG.googleScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (indicator) {
                indicator.textContent = '☁️ Guardado en la nube';
                indicator.classList.add('show');
                setTimeout(function () { indicator.classList.remove('show'); }, 2000);
            }
            return response.json().catch(function() { return {}; });
        }).catch(function () {
            // Fallback to no-cors mode for older Apps Script deployments
            fetch(COURSE_CONFIG.googleScriptUrl, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(function () {
                if (indicator) {
                    indicator.textContent = '☁️ Sincronizado con Google Sheets';
                    indicator.classList.add('show');
                    setTimeout(function () { indicator.classList.remove('show'); }, 2000);
                }
            }).catch(function () {
                if (indicator) {
                    indicator.textContent = '💾 Guardado localmente';
                    indicator.classList.add('show');
                    setTimeout(function () { indicator.classList.remove('show'); }, 2000);
                }
                // Datos guardados localmente (fallback silencioso)
            });
        });
    } catch (e) {
        // Google Sheets no disponible, progreso guardado localmente
        var indicator = document.getElementById('syncIndicator');
        if (indicator) {
            indicator.textContent = '💾 Guardado localmente';
            indicator.classList.add('show');
            setTimeout(function () { indicator.classList.remove('show'); }, 2000);
        }
    }
}

// --- Timers ---
// Incrementar studyTime cada minuto y guardar progreso (solo si esta en un modulo de contenido)
setInterval(function () {
    if (currentModule > 0) {
        studyTime += 1;
        updateStats();
        updateElapsedTime();
    }
    saveProgress();
}, 60000);

// --- Kit del Nivel 2 (ADR-106) ---
// Se guarda SOLO en localStorage: nada de esto pasa por el backend (ADR-087).
function _kitKey() { return 'rover:kit_' + COURSE_CONFIG.courseId; }
function _kitRoot() { return document.querySelector('[data-kit-builder]'); }

// Busca por atributo sin armar un selector con el id: un id raro no rompe nada.
function _kitFind(root, attr, id) {
    var els = root.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < els.length; i++) if (els[i].getAttribute(attr) === id) return els[i];
    return null;
}

// Un kit guardado corrupto o de otra version no puede dejar el kit sin tope ni sin guardado:
// se normaliza su forma y, si no se puede leer, se descarta.
function loadKit() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(_kitKey())); } catch (e) { raw = null; }
    if (!raw || typeof raw !== 'object') return null;
    var obj = function (v) { return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; };
    return {
        games: obj(raw.games),
        phrases: obj(raw.phrases),
        care: Array.isArray(raw.care) ? raw.care : [],
        careOwn: typeof raw.careOwn === 'string' ? raw.careOwn : ''
    };
}

function saveKit() {
    var root = _kitRoot();
    if (!root) return;
    var kit = { games: {}, phrases: {}, care: [], careOwn: '' };
    root.querySelectorAll('[data-kit-game]').forEach(function (cb) {
        if (!cb.checked) return;
        var id = cb.getAttribute('data-kit-game');
        var ta = _kitFind(root, 'data-kit-why', id);
        kit.games[id] = ta ? ta.value : '';
    });
    root.querySelectorAll('[data-kit-phrase]').forEach(function (ta) {
        kit.phrases[ta.getAttribute('data-kit-phrase')] = ta.value;
    });
    root.querySelectorAll('[data-kit-care]').forEach(function (cb) {
        if (cb.checked) kit.care.push(cb.getAttribute('data-kit-care'));
    });
    var own = root.querySelector('[data-kit-care-own]');
    kit.careOwn = own ? own.value : '';
    try { localStorage.setItem(_kitKey(), JSON.stringify(kit)); } catch (e) {}
}

function _kitRefresh() {
    var root = _kitRoot();
    if (!root) return;
    var max = parseInt(root.getAttribute('data-max-games'), 10) || 3;
    var boxes = root.querySelectorAll('[data-kit-game]');
    var n = 0;
    boxes.forEach(function (cb) { if (cb.checked) n++; });
    boxes.forEach(function (cb) {
        cb.disabled = !cb.checked && n >= max;
        var ta = _kitFind(root, 'data-kit-why', cb.getAttribute('data-kit-game'));
        if (ta) ta.hidden = !cb.checked;
    });
    var count = root.querySelector('[data-kit-count]');
    if (count) count.textContent = n + ' de ' + max + ' elegidos';
}

function initKitBuilder() {
    var root = _kitRoot();
    if (!root) return;
    var kit = loadKit();
    if (kit) {
        // Nunca se restauran mas juegos que el tope, aunque el guardado traiga mas.
        var max = parseInt(root.getAttribute('data-max-games'), 10) || 3;
        var marcados = 0;
        Object.keys(kit.games).forEach(function (id) {
            var cb = _kitFind(root, 'data-kit-game', id);
            var ta = _kitFind(root, 'data-kit-why', id);
            if (!cb || marcados >= max) return;
            cb.checked = true; marcados++;
            if (ta) ta.value = String(kit.games[id] || '');
        });
        Object.keys(kit.phrases).forEach(function (id) {
            var ta = _kitFind(root, 'data-kit-phrase', id);
            if (ta) ta.value = String(kit.phrases[id] || '');
        });
        kit.care.forEach(function (id) {
            var cb = _kitFind(root, 'data-kit-care', String(id));
            if (cb) cb.checked = true;
        });
        var own = root.querySelector('[data-kit-care-own]');
        if (own) own.value = kit.careOwn;
    }
    root.addEventListener('change', function () { _kitRefresh(); saveKit(); });
    root.addEventListener('input', function () { saveKit(); });
    _kitRefresh();
}

function downloadKitPDF() {
    var root = _kitRoot();
    if (!root) return;
    saveKit();
    // Un kit con menos juegos de los pedidos no esta listo: se avisa y no se descarga.
    var max = parseInt(root.getAttribute('data-max-games'), 10) || 3;
    if (root.querySelectorAll('[data-kit-game]:checked').length !== max) {
        showNotification('Te faltan juegos: marca tres antes de descargar tu kit.', 'warning');
        return;
    }
    var JsPDF = (window.jspdf && window.jspdf.jsPDF) || (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!JsPDF) { showNotification('La librería de PDF no cargó. Verifica tu conexión.'); return; }
    var pdf = new JsPDF({ unit: 'mm', format: 'a4' });
    var M = 18, y = 20, ancho = 210 - 2 * M;
    function linea(texto, tam, negrita) {
        pdf.setFont('helvetica', negrita ? 'bold' : 'normal');
        pdf.setFontSize(tam);
        _wrapText(pdf, texto, ancho).forEach(function (l) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(l, M, y); y += tam * 0.45;
        });
        y += 1.5;
    }
    function textoDe(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
    linea(root.getAttribute('data-pdf-title') || 'Mi kit', 16, true);
    var nombre = (userProfile && userProfile.fullName) ? userProfile.fullName : '';
    linea([nombre, COURSE_CONFIG.title, new Date().toLocaleDateString('es-CO')].filter(Boolean).join(' · '), 10, false);
    y += 3;
    linea(textoDe(root.querySelector('.kit-games legend')), 13, true);
    root.querySelectorAll('[data-kit-game]').forEach(function (cb) {
        if (!cb.checked) return;
        var id = cb.getAttribute('data-kit-game');
        linea('• ' + textoDe(root.querySelector('label[for="kit-game-' + id + '"]')), 11, true);
        var ta = _kitFind(root, 'data-kit-why', id);
        if (ta && ta.value.trim()) linea(ta.value.trim(), 11, false);
    });
    y += 3;
    linea(textoDe(root.querySelector('.kit-phrases legend')), 13, true);
    root.querySelectorAll('[data-kit-phrase]').forEach(function (ta) {
        var id = ta.getAttribute('data-kit-phrase');
        linea(textoDe(root.querySelector('label[for="kit-phrase-' + id + '"]')), 11, true);
        linea(ta.value.trim() ? '«' + ta.value.trim() + '»' : '—', 11, false);
    });
    y += 3;
    linea(textoDe(root.querySelector('.kit-care legend')), 13, true);
    // Las normas de la Guia van SIEMPRE, con su rotulo: no dependen de lo que el Rover marque.
    if (root.querySelector('[data-kit-rule]')) linea(textoDe(root.querySelector('.kit-rules-title')), 11, true);
    root.querySelectorAll('[data-kit-rule]').forEach(function (li) {
        linea('• ' + textoDe(li), 11, false);
    });
    root.querySelectorAll('[data-kit-care]').forEach(function (cb) {
        if (cb.checked) linea('[x] ' + textoDe(root.querySelector('label[for="' + cb.id + '"]')), 11, false);
    });
    var own = root.querySelector('[data-kit-care-own]');
    if (own && own.value.trim()) linea('[x] ' + own.value.trim(), 11, false);
    pdf.save('Kit-' + COURSE_CONFIG.courseId + '.pdf');
    showNotification('Kit descargado 📥');
}

// --- Plan del Nivel 3 (ADR-120) ---
// Varias secciones, en distintas lecciones, escriben UN mismo plan; la de cierre lo muestra
// completo y lo descarga. Se guarda SOLO en este navegador: nada del plan va a la hoja (ADR-087).
function _planKey() { return 'rover:plan_' + COURSE_CONFIG.courseId; }

// Busca por atributo sin armar un selector con datos: un id raro no rompe nada.
function _planFind(root, attr, id) {
    var els = (root || document).querySelectorAll('[' + attr + ']');
    for (var i = 0; i < els.length; i++) if (els[i].getAttribute(attr) === id) return els[i];
    return null;
}

function _planFields() { return document.querySelectorAll('[data-plan-section] [data-plan-field]'); }

function _planCols(box) {
    var cols = [];
    box.querySelector('template').content.querySelectorAll('[data-col]').forEach(function (c) { cols.push(c.getAttribute('data-col')); });
    return cols;
}

// Un guardado corrupto, viejo o de otra version no puede romper el plan: se normaliza contra
// los campos que el curso tiene HOY, y si no se puede leer se descarta.
function loadPlan() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(_planKey())); } catch (e) {
        try { localStorage.removeItem(_planKey()); } catch (e2) {}
        return {};
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    var plan = {};
    _planFields().forEach(function (f) {
        var id = f.getAttribute('data-plan-field'), v = raw[id];
        if (f.getAttribute('data-kind') === 'rows') {
            if (!Array.isArray(v)) return;
            var box = f.querySelector('[data-plan-rows]');
            var max = parseInt(box.getAttribute('data-max'), 10) || 1;
            var cols = _planCols(box);
            plan[id] = v.filter(function (r) { return r && typeof r === 'object' && !Array.isArray(r); })
                .slice(0, max).map(function (r) {
                    var limpia = {};
                    cols.forEach(function (c) { limpia[c] = typeof r[c] === 'string' ? r[c] : ''; });
                    return limpia;
                });
        } else if (typeof v === 'string') {
            plan[id] = v;
        }
    });
    return plan;
}

function _planRowsData(box) {
    var filas = [];
    box.querySelectorAll('[data-plan-row]').forEach(function (row) {
        var r = {};
        row.querySelectorAll('[data-col]').forEach(function (inp) { r[inp.getAttribute('data-col')] = inp.value; });
        filas.push(r);
    });
    return filas;
}

function savePlan() {
    var plan = {};
    _planFields().forEach(function (f) {
        var id = f.getAttribute('data-plan-field');
        if (f.getAttribute('data-kind') === 'rows') plan[id] = _planRowsData(f.querySelector('[data-plan-rows]'));
        else { var inp = f.querySelector('[data-plan-input]'); plan[id] = inp ? inp.value : ''; }
    });
    try { localStorage.setItem(_planKey(), JSON.stringify(plan)); } catch (e) {}
}

function _planRefreshRows(box) {
    var max = parseInt(box.getAttribute('data-max'), 10) || 1;
    var add = box.querySelector('[data-plan-add-row]');
    if (add) add.disabled = box.querySelectorAll('[data-plan-row]').length >= max;
}

function _planAddRow(box, datos) {
    var max = parseInt(box.getAttribute('data-max'), 10) || 1;
    var list = box.querySelector('[data-plan-row-list]');
    if (list.querySelectorAll('[data-plan-row]').length >= max) return;
    var row = box.querySelector('template').content.firstElementChild.cloneNode(true);
    if (datos) row.querySelectorAll('[data-col]').forEach(function (inp) { inp.value = datos[inp.getAttribute('data-col')] || ''; });
    list.appendChild(row);
    _planRefreshRows(box);
}

// Una fila agregada y dejada en blanco no cuenta como dato.
function _planFilled(f) {
    if (f.getAttribute('data-kind') === 'rows') {
        return _planRowsData(f.querySelector('[data-plan-rows]')).some(function (r) {
            return Object.keys(r).some(function (k) { return String(r[k]).trim() !== ''; });
        });
    }
    var inp = f.querySelector('[data-plan-input]');
    return !!(inp && inp.value.trim());
}

function planMissing() {
    var faltan = [];
    _planFields().forEach(function (f) {
        if (f.getAttribute('data-required') !== 'true' || _planFilled(f)) return;
        var sec = f.closest('[data-plan-section]');
        var mid = sec ? sec.getAttribute('data-module') : '';
        var fase = _planFind(document, 'data-plan-phase', mid);
        faltan.push({ fieldId: f.getAttribute('data-plan-field'), label: f.getAttribute('data-label') || '',
            moduleId: mid, lesson: fase ? fase.getAttribute('data-lesson') : '' });
    });
    return faltan;
}

function _planFaltaTexto(x) { return x.label + (x.lesson ? ' (lección «' + x.lesson + '»)' : ''); }

// Fechas del plan en DD/MM/AAAA (lo que se lleva a firmar no va en ISO).
function _planFecha(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : (v || '');
}

// Cada fila se lee sola: «Columna: valor · Columna: valor».
function _planValueText(f) {
    if (f.getAttribute('data-kind') === 'rows') {
        var box = f.querySelector('[data-plan-rows]');
        var rotulos = {};
        box.querySelector('template').content.querySelectorAll('.plan-col').forEach(function (c) {
            var inp = c.querySelector('[data-col]'), sp = c.querySelector('span');
            if (inp) rotulos[inp.getAttribute('data-col')] = sp ? sp.textContent.trim() : '';
        });
        return _planRowsData(box).map(function (r) {
            return Object.keys(r).filter(function (k) { return String(r[k]).trim(); }).map(function (k) {
                return (rotulos[k] ? rotulos[k] + ': ' : '') + String(r[k]).trim();
            }).join(' · ');
        }).filter(Boolean);
    }
    var inp = f.querySelector('[data-plan-input]');
    var v = inp ? inp.value.trim() : '';
    return f.getAttribute('data-kind') === 'date' ? _planFecha(v) : v;
}

// El resumen se escribe con textContent: lo que el Rover teclea se ve tal cual, nunca como HTML.
function renderPlanSummary() {
    var sum = document.querySelector('[data-plan-summary]');
    if (!sum) return;
    _planFields().forEach(function (f) {
        var dd = _planFind(sum, 'data-plan-value', f.getAttribute('data-plan-field'));
        if (!dd) return;
        var v = _planValueText(f);
        dd.textContent = '';
        if (Array.isArray(v)) {
            if (!v.length) { dd.textContent = '—'; return; }
            var ul = document.createElement('ul');
            v.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
            dd.appendChild(ul);
        } else dd.textContent = v || '—';
    });
    var box = sum.querySelector('[data-plan-missing]');
    if (!box) return;
    var faltan = planMissing();
    box.textContent = '';
    if (!faltan.length) return;
    var p = document.createElement('p');
    p.textContent = box.getAttribute('data-missing-title') || '';
    box.appendChild(p);
    var ul2 = document.createElement('ul');
    faltan.forEach(function (x) { var li = document.createElement('li'); li.textContent = _planFaltaTexto(x); ul2.appendChild(li); });
    box.appendChild(ul2);
}

function initPlanBuilder() {
    if (!document.querySelector('[data-plan-section], [data-plan-summary]')) return;
    var plan = loadPlan();
    _planFields().forEach(function (f) {
        var id = f.getAttribute('data-plan-field');
        if (f.getAttribute('data-kind') === 'rows') {
            var box = f.querySelector('[data-plan-rows]');
            (plan[id] || []).forEach(function (r) { _planAddRow(box, r); });
            _planRefreshRows(box);
        } else if (typeof plan[id] === 'string') {
            var inp = f.querySelector('[data-plan-input]');
            if (inp) inp.value = plan[id];
        }
    });
    function cambio() { savePlan(); renderPlanSummary(); }
    document.querySelectorAll('[data-plan-section]').forEach(function (sec) {
        sec.addEventListener('input', cambio);
        sec.addEventListener('change', cambio);
        sec.addEventListener('click', function (ev) {
            var add = ev.target.closest('[data-plan-add-row]');
            var rem = ev.target.closest('[data-plan-remove-row]');
            if (add) { _planAddRow(add.closest('[data-plan-rows]')); cambio(); }
            if (rem) {
                var box = rem.closest('[data-plan-rows]');
                rem.closest('[data-plan-row]').remove();
                _planRefreshRows(box); cambio();
            }
        });
    });
    var sum = document.querySelector('[data-plan-summary]');
    if (sum) {
        sum.addEventListener('click', function (ev) {
            var go = ev.target.closest('[data-plan-goto]');
            if (go) showModule(parseInt(go.getAttribute('data-plan-goto'), 10));
            if (ev.target.closest('[data-plan-download]')) downloadPlanPDF();
        });
    }
    renderPlanSummary();
}

// Lo que la fuente del PDF no imprime (emoji y otros fuera de Latin-1) se omite. Antes se
// traduce la tipografia que ponen los teclados de celular: un apostrofo o unas comillas no
// pueden desaparecer del documento que se firma (revision final del ADR-120).
function _planSanear(t) {
    return String(t == null ? '' : t)
        .replace(/[‘’‚′]/g, "'").replace(/[“”„″]/g, '"')
        .replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/•/g, '-')
        .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
}

function downloadPlanPDF() {
    var sum = document.querySelector('[data-plan-summary]');
    if (!sum) return;
    savePlan(); renderPlanSummary();
    var faltan = planMissing();
    if (faltan.length) {
        showNotification('Te falta: ' + faltan.map(_planFaltaTexto).join('; ') + '.', 'warning');
        return;
    }
    var JsPDF = (window.jspdf && window.jspdf.jsPDF) || (typeof jsPDF !== 'undefined' ? jsPDF : null);
    if (!JsPDF) { showNotification('La librería de PDF no cargó. Verifica tu conexión.'); return; }
    var pdf = new JsPDF({ unit: 'mm', format: 'a4' });
    var M = 18, y = 20, ancho = 210 - 2 * M;
    function linea(texto, tam, negrita) {
        var t = _planSanear(texto);
        if (!t.trim()) return;
        pdf.setFont('helvetica', negrita ? 'bold' : 'normal');
        pdf.setFontSize(tam);
        _wrapText(pdf, t, ancho).forEach(function (l) {
            if (y > 280) { pdf.addPage(); y = 20; }
            pdf.text(l, M, y); y += tam * 0.45;
        });
        y += 1.5;
    }
    // Un titulo no queda huerfano al pie: si no caben ~12 mm, va a la pagina siguiente.
    function titulo(texto) { if (y > 268) { pdf.addPage(); y = 20; } linea(texto, 13, true); }
    linea(sum.getAttribute('data-pdf-title') || 'Mi plan', 16, true);
    var nombre = (userProfile && userProfile.fullName) ? userProfile.fullName : '';
    linea([nombre, COURSE_CONFIG.title, new Date().toLocaleDateString('es-CO')].filter(Boolean).join(' · '), 10, false);
    y += 3;
    sum.querySelectorAll('[data-plan-phase]').forEach(function (fase) {
        var h = fase.querySelector('h4');
        titulo(h ? h.textContent : '');
        fase.querySelectorAll('[data-plan-value]').forEach(function (dd) {
            var f = _planFind(document, 'data-plan-field', dd.getAttribute('data-plan-value'));
            if (!f) return;
            linea(f.getAttribute('data-label') || '', 11, true);
            var v = _planValueText(f);
            if (Array.isArray(v)) {
                if (!v.length) linea('—', 11, false);
                v.forEach(function (t) { linea('• ' + t, 11, false); });
            } else linea(v || '—', 11, false);
        });
        y += 2;
    });
    var roles = [];
    try { roles = JSON.parse(sum.getAttribute('data-agreement-roles') || '[]'); } catch (e) {}
    titulo(sum.getAttribute('data-agreement-title') || '');
    roles.forEach(function (r) { linea(r + ' · Fecha: ____________ · Firma: ______________________', 11, false); y += 3; });
    pdf.save('Plan-' + COURSE_CONFIG.courseId + '.pdf');
    showNotification('Plan descargado 📥');
}
