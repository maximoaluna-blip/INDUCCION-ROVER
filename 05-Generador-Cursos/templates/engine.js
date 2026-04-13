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
    loadProgress();
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
    sendToGoogleSheets({ action: 'register', ...userProfile });
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
    document.querySelectorAll('.module').forEach(function (m) { m.classList.remove('active'); });
    var target = document.getElementById('module-' + moduleIndex);
    if (target) target.classList.add('active');

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
function selectOption(element, questionIndex) {
    var question = element.closest('.question');
    question.querySelectorAll('.option').forEach(function (opt) { opt.classList.remove('selected'); });
    element.classList.add('selected');
    element.setAttribute('data-selected-index', questionIndex);
}

function checkQuiz(moduleNum) {
    var quizData = QUIZ_ANSWERS[moduleNum];
    if (!quizData) return;

    var questions = document.querySelectorAll('#module-' + moduleNum + ' .question');
    var correctAnswers = 0;
    var totalQuestions = quizData.length;

    questions.forEach(function (question, qIndex) {
        var selectedOption = question.querySelector('.option.selected');
        if (selectedOption) {
            var selectedIdx = parseInt(selectedOption.getAttribute('data-selected-index'));
            if (selectedIdx === quizData[qIndex]) {
                selectedOption.classList.add('correct');
                correctAnswers++;
            } else {
                selectedOption.classList.add('incorrect');
                // Mostrar la correcta
                var options = question.querySelectorAll('.option');
                if (options[quizData[qIndex]]) options[quizData[qIndex]].classList.add('correct');
            }
        }
    });

    var score = Math.round((correctAnswers / totalQuestions) * 100);
    quizScores[moduleNum] = score;

    var checkBtn = document.getElementById('checkBtn-' + moduleNum);
    if (checkBtn) checkBtn.style.display = 'none';

    if (score >= 70) {
        var nextBtn = document.getElementById('nextBtn-' + moduleNum);
        if (nextBtn) nextBtn.classList.remove('hidden');

        // Desbloquear logros
        COURSE_CONFIG.achievements.forEach(function (ach) {
            if (ach.unlockOnModule === moduleNum) unlockAchievement(ach.id);
        });

        showNotification('¡Excelente! Obtuviste ' + score + '% ✅');
        sendToGoogleSheets({
            action: 'quiz', name: userProfile.fullName, email: userProfile.email,
            module: moduleNum, score: score, course: COURSE_CONFIG.courseId
        });
    } else {
        showNotification('Puntuación: ' + score + '%. Necesitas 70% para continuar. Revisa el contenido.', 'warning');
        // Permitir reintentar sin recargar
        setTimeout(function () {
            questions.forEach(function (q) {
                q.querySelectorAll('.option').forEach(function (opt) {
                    opt.classList.remove('selected', 'correct', 'incorrect');
                });
            });
            if (checkBtn) checkBtn.style.display = '';
        }, 3000);
    }
    saveProgress();
}

function completeModule(moduleNum) {
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
    document.body.appendChild(n);
    setTimeout(function () {
        n.style.animation = 'slideOut 0.3s';
        setTimeout(function () { n.remove(); }, 300);
    }, 3000);
}

// --- Reflexiones ---
function saveReflection(moduleNum, text) {
    reflections[moduleNum] = text;
    saveProgress();
}

function saveCommitment(text) {
    localStorage.setItem('commitment_' + COURSE_CONFIG.courseId, text);
}

// --- Certificado ---
function generateCertificate() {
    var date = new Date();
    var code = 'ASC-' + date.getFullYear() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    var el = function (id) { return document.getElementById(id); };
    if (el('studentName')) el('studentName').textContent = userProfile.fullName || 'Rover Scout';
    if (el('certDate')) el('certDate').textContent = date.toLocaleDateString('es-CO');
    if (el('totalTime')) el('totalTime').textContent = studyTime;
    if (el('certGroup')) el('certGroup').textContent = userProfile.group || 'N/A';
    if (el('certRegion')) el('certRegion').textContent = userProfile.region || 'Colombia';
    if (el('certCode')) el('certCode').textContent = code;

    var avg = quizScores.length > 0 ? Math.round(quizScores.reduce(function (a, b) { return a + b; }, 0) / quizScores.length) : 100;
    if (el('finalScore')) el('finalScore').textContent = avg;

    sendToGoogleSheets({
        action: 'certificate', name: userProfile.fullName, email: userProfile.email,
        group: userProfile.group, region: userProfile.region, certificateCode: code,
        completionDate: date.toISOString(), score: avg, studyTime: studyTime,
        course: COURSE_CONFIG.courseId
    });

    unlockAchievement('achievement-5');
    var bar = document.getElementById('progressBar');
    var text = document.getElementById('progressText');
    if (bar) bar.style.width = '100%';
    if (text) text.textContent = '100%';

    localStorage.setItem('certificate_' + code, JSON.stringify({
        name: userProfile.fullName, code: code, date: date.toISOString(),
        score: avg, course: COURSE_CONFIG.courseId
    }));
}

// --- Descargar certificado como PDF ---
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768);
}

function downloadCertificatePDF() {
    var certModule = document.getElementById('module-' + (COURSE_CONFIG.totalModules - 1));
    var cert = certModule ? certModule.querySelector('.certificate') : null;
    if (!cert) {
        showNotification('El certificado aún no está disponible.');
        return;
    }
    if (typeof html2pdf === 'undefined') {
        showNotification('La librería de PDF no cargó. Verifica tu conexión a internet.');
        if (confirm('¿Deseas usar la opción de Imprimir en su lugar?')) { window.print(); }
        return;
    }

    var code = (document.getElementById('certCode') || {}).textContent || 'certificado';
    var filename = 'Certificado-' + code + '.pdf';
    var mobile = isMobileDevice();

    showNotification(mobile ? 'Generando PDF (puede tardar unos segundos)...' : 'Generando PDF...');

    // Clonar certificado en contenedor oculto con ancho fijo
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:600px;background:white;z-index:-1;';
    var clone = cert.cloneNode(true);
    clone.style.cssText = 'width:600px;max-width:600px;margin:0;padding:20px 25px;border:3px solid #622599;background:white;box-shadow:none;font-size:13px;position:relative;overflow:hidden;';
    clone.querySelectorAll('h2').forEach(function(el) { el.style.fontSize = '1.1em'; el.style.margin = '6px 0'; });
    clone.querySelectorAll('h3').forEach(function(el) { el.style.fontSize = '1em'; el.style.margin = '5px 0'; });
    clone.querySelectorAll('p').forEach(function(el) { el.style.margin = el.style.margin || '3px 0'; });
    clone.querySelectorAll('img').forEach(function(el) { el.style.height = '35px'; });
    clone.querySelectorAll('hr').forEach(function(el) { el.style.margin = '6px 30px'; });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    var canvasScale = mobile ? 1.5 : 2;

    // Renderizar a canvas y escalar para que quepa en 1 página A4
    html2canvas(clone, {
        scale: canvasScale, useCORS: true, scrollY: 0,
        width: 600, windowWidth: 600, backgroundColor: '#ffffff'
    }).then(function(canvas) {
        if (wrapper.parentNode) document.body.removeChild(wrapper);

        var imgData = canvas.toDataURL('image/jpeg', 0.95);

        // A4: 210 x 297 mm, márgenes 10mm
        var pageW = 210, pageH = 297, margin = 10;
        var usableW = pageW - margin * 2;
        var usableH = pageH - margin * 2;

        // Convertir canvas px a mm: px / scale / 96 * 25.4
        var imgWmm = canvas.width / canvasScale / 96 * 25.4;
        var imgHmm = canvas.height / canvasScale / 96 * 25.4;

        // Escalar para que quepa (nunca agrandar)
        var ratio = Math.min(usableW / imgWmm, usableH / imgHmm, 1);
        var finalW = imgWmm * ratio;
        var finalH = imgHmm * ratio;

        // Centrar en la página
        var x = margin + (usableW - finalW) / 2;
        var y = margin + (usableH - finalH) / 2;

        // Crear PDF de 1 sola página
        var JsPDF = (window.jspdf && window.jspdf.jsPDF) || (typeof jsPDF !== 'undefined' ? jsPDF : null);
        if (!JsPDF) {
            // Fallback: buscar en el bundle de html2pdf
            try { JsPDF = html2pdf().then ? null : null; } catch(e) {}
        }

        if (JsPDF) {
            var pdf = new JsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', x, y, finalW, finalH);

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
        } else {
            // Fallback si no se encuentra jsPDF: usar html2pdf normal con imagen ya escalada
            var fallbackDiv = document.createElement('div');
            fallbackDiv.style.cssText = 'width:190mm;background:white;';
            var img = document.createElement('img');
            img.src = imgData;
            img.style.cssText = 'width:100%;height:auto;';
            fallbackDiv.appendChild(img);
            document.body.appendChild(fallbackDiv);
            html2pdf().set({
                margin: [10,10,10,10], filename: filename,
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all'] }
            }).from(fallbackDiv).save().then(function() {
                document.body.removeChild(fallbackDiv);
                showNotification('PDF descargado: ' + filename + ' 📥');
            });
        }
    }).catch(function(err) {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
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
                var mods = serverData.modules || [];
                var quizzes = serverData.quizzes || [];

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

                // StudyTime y reflections (si vienen directamente)
                if (data.studyTime) studyTime = data.studyTime;
                if (data.reflections) {
                    reflections = data.reflections;
                    Object.keys(reflections).forEach(function(k) {
                        var ta = document.getElementById('reflection-' + k);
                        if (ta) ta.value = reflections[k];
                    });
                }

                saveProgress();
                updateStats();
                updateProgress();

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
