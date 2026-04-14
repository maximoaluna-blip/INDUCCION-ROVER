#!/usr/bin/env node
// ============================================
// BUILD-COURSE.JS - Constructor de HTML para Plataforma Educativa Rover
// Uso: node build-course.js <nombre-curso>
// Ejemplo: node build-course.js fundamentos-scout
// Sin dependencias externas — solo modulos nativos de Node.js
// ============================================

const fs = require('fs');
const path = require('path');

// --- Rutas ---
const BASE_DIR = __dirname;
const BORRADORES_DIR = path.join(BASE_DIR, 'borradores');
const TEMPLATES_DIR = path.join(BASE_DIR, 'templates');
const OUTPUT_DIR = path.join(BASE_DIR, '..', '02-Plataforma-Web');
const CATALOGO_PATH = path.join(OUTPUT_DIR, 'cursos.json');

// --- Leer argumentos ---
const courseName = process.argv[2];
if (!courseName) {
    console.error('❌ Uso: node build-course.js <nombre-curso>');
    console.error('   Ejemplo: node build-course.js fundamentos-scout');
    console.error('\n   Cursos disponibles en borradores/:');
    try {
        const files = fs.readdirSync(BORRADORES_DIR).filter(f => f.endsWith('.json'));
        files.forEach(f => console.error('   - ' + f.replace('.json', '')));
    } catch (e) { console.error('   (ninguno)'); }
    process.exit(1);
}

// --- Leer JSON del curso ---
const jsonPath = path.join(BORRADORES_DIR, courseName + '.json');
if (!fs.existsSync(jsonPath)) {
    console.error('❌ No se encontró: ' + jsonPath);
    process.exit(1);
}

const course = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log('📖 Leyendo curso: ' + course.title);

// --- Leer templates ---
const cssContent = fs.readFileSync(path.join(TEMPLATES_DIR, 'styles.css'), 'utf-8');
const jsEngine = fs.readFileSync(path.join(TEMPLATES_DIR, 'engine.js'), 'utf-8');

// --- Validacion basica ---
function validate(course) {
    const errors = [];
    if (!course.courseId) errors.push('Falta courseId');
    if (!course.title) errors.push('Falta title');
    if (!course.modules || course.modules.length < 3) errors.push('Se necesitan al menos 3 modulos');
    if (!course.achievements) errors.push('Falta achievements');
    if (!course.certificate) errors.push('Falta certificate');

    course.modules.forEach((mod, i) => {
        if (!mod.title) errors.push(`Modulo ${i}: falta title`);
        if (!mod.sections || mod.sections.length === 0) errors.push(`Modulo ${i}: falta sections`);
        if (!mod.isIntro && mod.quiz) {
            if (!mod.quiz.questions || mod.quiz.questions.length < 2)
                errors.push(`Modulo ${mod.id}: quiz necesita al menos 2 preguntas`);
            mod.quiz.questions.forEach((q, qi) => {
                if (q.correctIndex === undefined) errors.push(`Modulo ${mod.id}, pregunta ${qi}: falta correctIndex`);
                if (!q.options || q.options.length < 3) errors.push(`Modulo ${mod.id}, pregunta ${qi}: necesita al menos 3 opciones`);
            });
        }
    });

    return errors;
}

const errors = validate(course);
if (errors.length > 0) {
    console.error('❌ Errores de validacion:');
    errors.forEach(e => console.error('   - ' + e));
    process.exit(1);
}

// --- Departamentos colombianos ---
const DEPARTAMENTOS = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar',
    'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
    'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
    'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
    'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
    'Valle del Cauca', 'Vaupés', 'Vichada'
];

// --- Generadores de HTML para cada tipo de seccion ---
function renderSection(section) {
    switch (section.type) {
        case 'paragraph':
            return `<p>${section.text}</p>`;
        case 'heading':
            const lvl = section.level || 3;
            return `<h${lvl}>${section.text}</h${lvl}>`;
        case 'info-box':
            return `<div class="info-box">${section.text}</div>`;
        case 'mission-box':
            return `<div class="mission-box">${section.text}</div>`;
        case 'blockquote':
            return `<blockquote style="font-size: 1.1rem; font-style: italic; text-align: center; margin: 20px 0; color: #1a4b6b;">${section.text}</blockquote>`;
        case 'list':
            const tag = section.ordered ? 'ol' : 'ul';
            const items = section.items.map(item => `<li>${item}</li>`).join('\n                    ');
            return `<${tag}>\n                    ${items}\n                </${tag}>`;
        case 'timeline':
            const tItems = section.items.map(item => {
                let sub = '';
                if (item.subitems) {
                    sub = '\n                        <ul>\n' +
                        item.subitems.map(s => `                            <li>${s}</li>`).join('\n') +
                        '\n                        </ul>';
                }
                return `<div class="timeline-item">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>${sub}
                    </div>`;
            }).join('\n                    ');
            return `<div class="timeline">\n                    ${tItems}\n                </div>`;
        case 'method-grid':
            const mItems = section.items.map(item => {
                const bg = item.color || '#f5f5f5';
                const bc = item.borderColor || '#ddd';
                return `<div class="method-element" style="background: linear-gradient(135deg, ${bg}, ${bg}dd); border-color: ${bc};">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                    </div>`;
            }).join('\n                    ');
            return `<div class="method-elements">\n                    ${mItems}\n                </div>`;
        case 'course-objectives':
            return `<h3>🎯 Objetivos del Curso</h3>\n` + renderSection({ type: 'list', ordered: false, items: section.items });
        default:
            return `<p>${section.text || ''}</p>`;
    }
}

function renderReflection(moduleId, reflection) {
    if (!reflection) return '';
    return `
                <div class="reflection-area">
                    <h4>🤔 Reflexión Personal</h4>
                    <p>${reflection.prompt}</p>
                    <textarea id="reflection-${moduleId}" placeholder="Escribe tu reflexión aquí..." onchange="saveReflection(${moduleId}, this.value)"></textarea>
                </div>`;
}

function renderQuiz(moduleId, quiz, isLast) {
    if (!quiz) return '';
    let questionNum = 0;
    const globalQBase = (moduleId - 1) * 10; // namespace unico para radio buttons

    const questionsHtml = quiz.questions.map((q, qi) => {
        questionNum++;
        const radioName = 'q' + (globalQBase + qi);
        const optionsHtml = q.options.map((opt, oi) => {
            return `<label class="option" onclick="selectOption(this, ${oi})">
                            <input type="radio" name="${radioName}">
                            ${opt}
                        </label>`;
        }).join('\n                        ');

        return `<div class="question">
                        <h4>${questionNum}. ${q.text}</h4>
                        ${optionsHtml}
                    </div>`;
    }).join('\n\n                    ');

    const nextLabel = quiz.nextLabel || (isLast ? 'Obtener Certificado 🏆' : 'Continuar ➡️');

    return `
                <div class="quiz-container">
                    <h3>🧪 ${quiz.title}</h3>

                    ${questionsHtml}

                    <button class="btn" onclick="checkQuiz(${moduleId})" id="checkBtn-${moduleId}">Verificar Respuestas</button>
                    <button class="btn hidden" onclick="completeModule(${moduleId})" id="nextBtn-${moduleId}">${nextLabel}</button>
                </div>`;
}

// --- Construir modulos ---
function buildRegistrationModule(course) {
    const deptOptions = DEPARTAMENTOS.map(d => `<option value="${d}">${d}</option>`).join('\n                            ');

    return `
            <!-- MÓDULO 0: REGISTRO -->
            <div class="module active" id="module-0">
                <h2>📝 Registro al Curso</h2>

                <div class="info-box">
                    <strong>🎯 Objetivo del Curso:</strong><br>
                    ${course.description}
                </div>

                <div class="toggle-buttons">
                    <button class="toggle-btn active" id="toggleNewReg" onclick="toggleRegistrationMode('new')">🆕 Nuevo Registro</button>
                    <button class="toggle-btn" id="toggleRecover" onclick="toggleRegistrationMode('recover')">🔄 Recuperar mi Avance</button>
                </div>

                <div class="recovery-section hidden" id="recoverySection">
                    <h3>🔄 Recuperar tu avance anterior</h3>
                    <p style="color: #636363; margin-bottom: 15px;">Ingresa el correo electronico con el que te registraste para recuperar tu progreso.</p>
                    <div class="form-group">
                        <label for="recoveryEmail">Correo Electronico</label>
                        <input type="email" id="recoveryEmail" placeholder="Ej: juan.perez@email.com" required>
                    </div>
                    <div style="text-align: center;">
                        <button class="btn" onclick="recoverProgress()">🔍 Recuperar</button>
                    </div>
                    <div id="recoveryMessage" style="margin-top: 15px; text-align: center; display: none;"></div>
                </div>

                <form id="registrationForm" onsubmit="handleRegistration(event)">
                    <div class="form-group">
                        <label for="fullName">Nombre Completo *</label>
                        <input type="text" id="fullName" name="fullName" required placeholder="Ej: Juan Carlos Pérez Gómez">
                    </div>
                    <div class="form-group">
                        <label for="age">Edad</label>
                        <input type="number" id="age" name="age" min="18" max="22" placeholder="Ej: 19">
                    </div>
                    <div class="form-group">
                        <label for="group">Grupo Scout</label>
                        <input type="text" id="group" name="group" placeholder="Ej: Grupo Scout 25">
                    </div>
                    <div class="form-group">
                        <label for="region">Región/Departamento</label>
                        <select id="region" name="region">
                            <option value="">Seleccionar...</option>
                            ${deptOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <input type="email" id="email" name="email" placeholder="Ej: juan.perez@email.com">
                    </div>
                    <div class="form-group">
                        <label for="motivation">¿Por qué quieres ser sinodal/ayudante?</label>
                        <textarea id="motivation" name="motivation" rows="4" placeholder="Describe brevemente tu motivación..."></textarea>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                        <button type="submit" class="btn" style="font-size: 1.1rem; padding: 15px 30px;">🚀 Comenzar Curso</button>
                    </div>
                </form>

                <div class="data-privacy">
                    <h4>📊 Información sobre tus datos</h4>
                    <p>Este curso guarda tu progreso de dos formas:</p>
                    <ul>
                        <li>📱 <strong>Localmente:</strong> En tu navegador para que puedas continuar sin internet</li>
                        <li>☁️ <strong>Google Sheets:</strong> Para que los dirigentes puedan verificar certificados y hacer seguimiento</li>
                    </ul>
                    <p style="margin-top: 10px; font-size: 0.9em;">Tus datos solo se usan para fines educativos de la Asociación Scout de Colombia.</p>
                </div>
            </div>`;
}

function buildContentModule(mod, course, contentIndex, totalContent, isLast) {
    const badge = mod.isIntro ? '' : `\n                <div class="badge">Módulo ${contentIndex}/${totalContent}</div>`;

    const sectionsHtml = mod.sections.map(s => renderSection(s)).join('\n\n                ');

    // Si es intro, agregar achievements y stats
    let introExtras = '';
    if (mod.isIntro) {
        const achHtml = course.achievements.map(a =>
            `<div class="achievement" id="${a.id}">${a.emoji} ${a.name}</div>`
        ).join('\n                    ');

        introExtras = `
                <h3>🏆 Logros por Desbloquear</h3>
                <div class="achievements">
                    ${achHtml}
                </div>

                <div class="stats">
                    <div class="stat-card"><h4 id="modulesCompleted">0</h4><p>Módulos Completados</p></div>
                    <div class="stat-card"><h4 id="quizzesCompleted">0</h4><p>Evaluaciones Aprobadas</p></div>
                    <div class="stat-card"><h4 id="studyTime">0</h4><p>Minutos de Estudio</p></div>
                </div>

                <button class="btn" onclick="showModule(2)">🚀 Comenzar el Curso</button>`;
    }

    const welcomeSpan = mod.isIntro ? ' <span id="welcomeName"></span>' : '';
    const reflectionHtml = renderReflection(mod.id, mod.reflection);
    const quizHtml = renderQuiz(mod.id, mod.quiz, isLast);

    return `
            <!-- MÓDULO ${mod.id}: ${mod.title.toUpperCase()} -->
            <div class="module" id="module-${mod.id}">
                <h2>${mod.emoji} ${mod.title}${welcomeSpan}</h2>${badge}

                ${sectionsHtml}
${introExtras}${reflectionHtml}${quizHtml}
            </div>`;
}

function buildCertificateModule(course, certModuleId) {
    const achHtml = course.achievements.map(a =>
        `<div class="achievement earned">${a.emoji} ${a.name}</div>`
    ).join('\n                    ');

    return `
            <!-- MÓDULO ${certModuleId}: CERTIFICADO -->
            <div class="module" id="module-${certModuleId}">
                <div class="certificate" style="max-width: 700px; margin: 0 auto; background: white; border: 3px solid #622599; border-radius: 0; padding: 30px 35px; position: relative; overflow: hidden;">
                    <!-- Decorative corners -->
                    <div style="position: absolute; top: 0; left: 0; width: 60px; height: 60px; border-top: 4px solid #ffe675; border-left: 4px solid #ffe675;"></div>
                    <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; border-top: 4px solid #ffe675; border-right: 4px solid #ffe675;"></div>
                    <div style="position: absolute; bottom: 0; left: 0; width: 60px; height: 60px; border-bottom: 4px solid #ffe675; border-left: 4px solid #ffe675;"></div>
                    <div style="position: absolute; bottom: 0; right: 0; width: 60px; height: 60px; border-bottom: 4px solid #ffe675; border-right: 4px solid #ffe675;"></div>

                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 10px;">
                            <img src="../assets/logo-asc.png" alt="ASC" style="height: 45px;">
                            <div style="width: 1px; height: 35px; background: #ddd;"></div>
                            <img src="../assets/logo-vallescout.png" alt="Valle Scout" style="height: 45px;">
                        </div>
                        <p style="font-size: 0.75em; text-transform: uppercase; letter-spacing: 2px; color: #622599; font-weight: 600; margin: 5px 0;">Asociacion Scouts de Colombia</p>
                        <p style="font-size: 0.7em; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin: 2px 0;">Regional Valle del Cauca</p>
                    </div>

                    <hr style="border: none; border-top: 2px solid #622599; margin: 10px 30px;">

                    <!-- Title -->
                    <div style="text-align: center; margin: 15px 0 10px;">
                        <h2 style="color: #622599; font-size: 1.3em; letter-spacing: 2px; margin: 0;">CERTIFICADO DE APROBACION</h2>
                    </div>

                    <!-- Course name -->
                    <div style="text-align: center; background: linear-gradient(135deg, #622599 0%, #3d1660 100%); color: white; padding: 10px 20px; margin: 10px 0;">
                        <h3 style="font-size: 1.1em; letter-spacing: 1px; margin: 0; color: white;">${course.certificate.courseName}</h3>
                    </div>

                    <!-- Body -->
                    <div style="text-align: center; margin: 15px 0;">
                        <p style="font-size: 0.9em; color: #636363; margin-bottom: 8px;">Se otorga el presente certificado a</p>
                        <h3 style="color: #622599; font-size: 1.5em; margin: 8px 0; border-bottom: 2px solid #ffe675; display: inline-block; padding-bottom: 5px;" id="studentName"></h3>
                        <p style="font-size: 0.85em; color: #636363; margin-top: 10px; line-height: 1.5;">${course.certificate.description}</p>
                    </div>

                    <!-- Details grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 15px 0; padding: 12px 15px; background: #f9f7fc; border-left: 3px solid #622599; font-size: 0.82em;">
                        <p style="margin: 0;"><strong>Fecha:</strong> <span id="certDate"></span></p>
                        <p style="margin: 0;"><strong>Puntuacion:</strong> <span id="finalScore"></span>%</p>
                        <p style="margin: 0;"><strong>Grupo Scout:</strong> <span id="certGroup"></span></p>
                        <p style="margin: 0;"><strong>Region:</strong> <span id="certRegion"></span></p>
                        <p style="margin: 0;"><strong>Tiempo de estudio:</strong> <span id="totalTime"></span> min</p>
                        <p style="margin: 0;"><strong>Estado:</strong> <span style="color: #2e7d32; font-weight: 700;">APROBADO ✅</span></p>
                    </div>

                    <!-- Verification code -->
                    <div style="text-align: center; margin: 12px 0; padding: 8px; border: 1px dashed #622599; background: #faf8fd;">
                        <p style="font-size: 0.75em; color: #888; margin: 0 0 3px;">Codigo de Verificacion</p>
                        <strong style="font-size: 1em; color: #622599; letter-spacing: 2px;" id="certCode">ASC-2024-XXXXX</strong>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; margin-top: 12px;">
                        <p style="font-size: 0.7em; color: #999;">Plataforma de Formacion Rover ASC | vallescout.org.co</p>
                    </div>
                </div>

                <h3 style="margin-top: 30px;">🎯 Logros Desbloqueados</h3>
                <div class="achievements">
                    ${achHtml}
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <button class="btn" onclick="downloadCertificatePDF()">📥 Descargar PDF</button>
                    <button class="btn" onclick="window.print()">🖨️ Imprimir Certificado</button>
                    <button class="btn" onclick="shareResults()">📤 Compartir Logros</button>
                    <button class="btn" onclick="restartCourse()">🔄 Reiniciar Curso</button>
                </div>

                <div class="reflection-area">
                    <h4>🎯 Compromiso Personal</h4>
                    <p>Escribe tu compromiso como rover certificado para servir a las nuevas generaciones scouts:</p>
                    <textarea id="commitment" placeholder="Mi compromiso como rover scout certificado es..." onchange="saveCommitment(this.value)"></textarea>
                </div>
            </div>`;
}

// --- Construir QUIZ_ANSWERS ---
function buildQuizAnswers(modules) {
    const answers = {};
    modules.forEach(mod => {
        if (mod.quiz && mod.quiz.questions) {
            answers[mod.id] = mod.quiz.questions.map(q => q.correctIndex);
        }
    });
    return answers;
}

// --- Construir navegacion ---
function buildNavigation(course, certModuleId) {
    const navItems = [{ emoji: '📝', label: 'Registro', id: 0 }];
    course.modules.forEach(mod => {
        navItems.push({ emoji: mod.emoji, label: mod.navLabel || mod.title.substring(0, 12), id: mod.id });
    });
    navItems.push({ emoji: '🏆', label: 'Certificado', id: certModuleId });

    const desktopBtns = navItems.map((item, i) =>
        `<button class="nav-btn${i === 0 ? ' active' : ''}" onclick="showModule(${item.id})">${item.emoji} ${item.label}</button>`
    ).join('\n            ');

    const mobileOpts = navItems.map(item =>
        `<option value="${item.id}">${item.emoji} ${item.label}</option>`
    ).join('\n                ');

    return { desktopBtns, mobileOpts };
}

// --- CONSTRUIR HTML COMPLETO ---
function buildHTML(course) {
    const certModuleId = course.modules[course.modules.length - 1].id + 1;
    const totalModules = certModuleId + 1; // 0..certModuleId
    const contentModules = course.totalContentModules;
    const nav = buildNavigation(course, certModuleId);
    const quizAnswers = buildQuizAnswers(course.modules);

    const googleUrl = course.googleScriptUrl || 'https://script.google.com/macros/s/AKfycbzHd4KB4MafCKKPp8kEf9V-vLnlsCKUhmqR6eMFB-Qvz2f03xy9bYSx86eGUuS5RkfX2g/exec';

    // Build modules HTML
    const registrationHtml = buildRegistrationModule(course);

    let contentIndex = 0;
    const contentModulesArray = course.modules.filter(m => !m.isIntro);
    const modulesHtml = course.modules.map((mod, i) => {
        if (!mod.isIntro) contentIndex++;
        const isLast = (i === course.modules.length - 1);
        return buildContentModule(mod, course, contentIndex, contentModules, isLast);
    }).join('\n');

    const certificateHtml = buildCertificateModule(course, certModuleId);

    const subtitle = course.subtitle || 'Formación para Rovers - Sinodales y Ayudantes';

    // Determine asset path prefix (courses are deployed in subfolders: courseId/index.html)
    const assetPrefix = '../assets';

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title} - Curso para Rovers</title>
    <link rel="icon" type="image/svg+xml" href="${assetPrefix}/favicon.svg">
    <link rel="icon" type="image/png" href="${assetPrefix}/logo-asc.png">
    <link rel="stylesheet" href="${assetPrefix}/dark-theme.css">
    <!-- Early theme init para evitar FOUC en modo oscuro -->
    <script>(function(){try{var t=localStorage.getItem('rover-theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();</script>
    <style>
${cssContent}
    </style>
</head>
<body>
    <!-- Top Bar -->
    <div class="top-bar">
        <div class="top-bar-inner">
            <div class="logos">
                <img src="${assetPrefix}/logo-asc.png" alt="Asociacion Scouts de Colombia">
                <div class="separator"></div>
                <img src="${assetPrefix}/logo-vallescout.png" alt="Scouts del Valle">
            </div>
            <a href="../index.html" class="back-link">&#8592; Volver a Cursos</a>
        </div>
    </div>

    <div class="sync-indicator" id="syncIndicator">☁️ Sincronizado con Google Sheets</div>

    <div class="container">
        <div class="header">
            <h1>${course.icon} ${course.title}</h1>
            <p>${subtitle}</p>
            <div class="progress-container">
                <div class="progress-bar" id="progressBar"></div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
            <p style="margin-top: 10px; font-size: 0.9em; color: #666;">
                ⏱️ Tiempo en el curso: <span id="elapsedTime">0 min</span>
            </p>
        </div>

        <div class="nav-menu">
            ${nav.desktopBtns}
        </div>

        <div class="mobile-nav">
            <select onchange="showModule(this.value)">
                ${nav.mobileOpts}
            </select>
        </div>

        <div class="content">
${registrationHtml}
${modulesHtml}
${certificateHtml}
        </div>
    </div>

    <div class="save-indicator" id="saveIndicator">💾 Guardando...</div>

    <!-- jsPDF para generar el certificado en una sola página A4 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script>
    // --- Configuracion del curso (generada automaticamente) ---
    var COURSE_CONFIG = {
        courseId: ${JSON.stringify(course.courseId)},
        title: ${JSON.stringify(course.title)},
        totalModules: ${totalModules},
        contentModules: ${contentModules},
        googleScriptUrl: ${JSON.stringify(googleUrl)},
        achievements: ${JSON.stringify(course.achievements)}
    };

    // --- Respuestas correctas (indice base 0) ---
    var QUIZ_ANSWERS = ${JSON.stringify(quizAnswers)};

${jsEngine}
    </script>
    <script src="${assetPrefix}/theme-toggle.js"></script>
</body>
</html>`;
}

// --- Generar y guardar ---
const html = buildHTML(course);
const outputPath = path.join(OUTPUT_DIR, course.courseId + '.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log('✅ Curso generado: ' + outputPath);

// --- Actualizar catalogo ---
let catalogo = [];
if (fs.existsSync(CATALOGO_PATH)) {
    catalogo = JSON.parse(fs.readFileSync(CATALOGO_PATH, 'utf-8'));
}

const existingIndex = catalogo.findIndex(c => c.courseId === course.courseId);
const entry = {
    courseId: course.courseId,
    title: course.title,
    description: course.description,
    icon: course.icon,
    duration: course.duration,
    modules: course.modules.length,
    status: 'active',
    file: course.courseId + '.html',
    folder: course.courseId
};

if (existingIndex >= 0) {
    catalogo[existingIndex] = entry;
} else {
    catalogo.push(entry);
}

fs.writeFileSync(CATALOGO_PATH, JSON.stringify(catalogo, null, 2), 'utf-8');
console.log('📋 Catálogo actualizado: ' + CATALOGO_PATH);
console.log('\n🎉 ¡Listo! Abre el archivo en tu navegador para verificar.');
