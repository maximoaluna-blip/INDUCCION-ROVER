# INDUCCION-ROVER - Plataforma Educativa para Rovers
## Asociacion Scouts de Colombia - Regional Valle del Cauca

**Proyecto:** Formacion digital gratuita para Rovers (18-22 anos) que desean ser sinodales o ayudantes en ramas de Manada y Scouts.

**URL Produccion:** https://maximoaluna-blip.github.io/INDUCCION-ROVER/
**Repositorio:** https://github.com/maximoaluna-blip/INDUCCION-ROVER

---

## Arquitectura General

```
Usuario → GitHub Pages (HTML estatico) → Google Apps Script → Google Sheets
                                       ← JSON responses ←
```

- **Frontend:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- **Hosting:** GitHub Pages (branch main, despliegue automatico)
- **Backend datos:** Google Sheets como base de datos via Google Apps Script
- **Generacion de cursos:** Node.js (build-course.js) desde JSON a HTML
- **Certificados PDF:** html2pdf.js + html2canvas + jsPDF (client-side)
- **Tema oscuro:** CSS custom properties + localStorage

---

## Estructura de Carpetas

```
INDUCCION-ROVER/
├── index.html                          ← Landing page principal (catalogo de cursos)
├── 404.html                            ← Pagina de error personalizada
├── dashboard-admin.html                ← Panel administrativo (lectura Google Sheets)
├── verificar-certificado.html          ← Verificador publico de certificados
│
├── assets/                             ← Recursos compartidos (todos los cursos referencian aqui)
│   ├── logo-asc.png                    ← Logo Asociacion Scouts de Colombia
│   ├── logo-vallescout.png             ← Logo Scouts del Valle
│   ├── favicon.svg                     ← Icono del sitio
│   ├── dark-theme.css                  ← Estilos para modo oscuro
│   └── theme-toggle.js                 ← Script inyector del boton de tema
│
├── fundamentos/                        ← CURSO 1: Fundamentos del Movimiento Scout
│   └── index.html                      ← Curso completo (2h, 6 modulos contenido + intro + certificado)
│
├── caracteristicas-educativas/         ← CURSO 2: Caracteristicas Educativas del Movimiento Scout
│   └── index.html                      ← Curso completo (2h, 6 modulos contenido + intro + certificado)
│
├── 01-Documentacion-Scout/             ← Documentos fuente PDF (excluidos de git por tamano)
│   ├── Colombia-ASC/                   ← Documentos oficiales ASC
│   ├── Mundial-OMMS/                   ← Documentos OMMS/World Scout Bureau
│   └── Guia-Dirigentes-Rama-Rover/     ← Guia OMMS para dirigentes Rover (6 secciones)
│
├── 02-Plataforma-Web/                  ← Archivos generados y catalogo
│   ├── cursos.json                     ← Catalogo maestro de cursos (leido por index.html)
│   ├── pagina-principal-menu-cursos.html ← Version fuente de la landing page
│   ├── fundamentos-scout.html          ← Version fuente del curso fundamentos
│   ├── caracteristicas-educativas.html ← Version generada del curso caract. educativas
│   └── assets/                         ← Logos duplicados (legacy, usar /assets/ en su lugar)
│
├── 03-Textos-Referencia/               ← Versiones Markdown de documentos clave
│   ├── Rover-Guidelines-WOSM-EN.md
│   └── Proyecto-Educativo-ASC-2022-2032-Texto.md
│
├── 04-Informes/                        ← Documentacion del desarrollo
│   └── Informe-Desarrollo-Plataforma-Educativa-Rover.md
│
├── 05-Generador-Cursos/                ← Sistema automatizado de generacion de cursos
│   ├── SKILL.md                        ← Instrucciones para el skill /generate-course
│   ├── build-course.js                 ← Constructor HTML: JSON → curso completo
│   ├── preview-course.js               ← Generador de preview visual pre-publicacion
│   ├── fix-tildes.py                   ← Utilidad para corregir acentos en JSONs
│   ├── course-schema.json              ← Esquema de referencia para cursos
│   ├── course-schema.example.json      ← Ejemplo completo basado en curso existente
│   ├── google-apps-script.js           ← Codigo fuente del backend Google Apps Script (incluye backup)
│   ├── backup-automatico.js            ← Modulo standalone de backup nocturno (referencia)
│   ├── INSTRUCCIONES-GOOGLE-APPS-SCRIPT.md ← Guia de configuracion del backend + backup
│   ├── templates/
│   │   ├── styles.css                  ← CSS compartido para todos los cursos generados
│   │   └── engine.js                   ← Motor JS compartido (registro, quizzes, progreso, PDF)
│   ├── borradores/                     ← JSONs de cursos para revision/edicion
│   │   ├── fundamentos-scout.json
│   │   └── caracteristicas-educativas.json
│   ├── input/                          ← (gitignored) Documentos fuente para nuevos cursos
│   └── previews/                       ← (gitignored) Previews HTML generados
│
└── .github/workflows/
    └── build-course.yml                ← GitHub Action para regenerar cursos
```

---

## Cursos Activos

| # | Curso | ID | Modulos | Duracion | Estado |
|---|-------|----|---------|----------|--------|
| 1 | Fundamentos del Movimiento Scout | `fundamentos-scout` | 6 contenido + intro + cert | ~2 horas | Activo |
| 2 | Caracteristicas Educativas del Movimiento Scout | `caracteristicas-educativas` | 6 contenido + intro + cert | ~2 horas | Activo |

### Cursos planificados (coming-soon en cursos.json):
- Primeros Auxilios Scout (3h, 8 modulos)
- Tecnicas de Campismo (3h, 10 modulos)
- Liderazgo y Trabajo en Equipo (2h, 6 modulos)
- Pedagogia Scout (3h, 8 modulos)
- Juegos y Dinamicas Scout (1.5h, 5 modulos)

---

## Flujo de Generacion de Cursos

```
1. Documentos PDF/MD  →  05-Generador-Cursos/input/
2. Claude Code analiza  →  Genera JSON borrador en borradores/
3. Usuario revisa JSON  →  Edita contenido, preguntas, tildes
4. preview-course.js   →  Genera preview HTML visual para revision
5. build-course.js     →  Genera HTML final en 02-Plataforma-Web/
6. Copiar a carpeta/   →  cp al directorio raiz del curso (ej: curso-id/index.html)
7. git push            →  GitHub Pages despliega automaticamente
```

### Comando para generar un curso:
```bash
node 05-Generador-Cursos/build-course.js nombre-curso
cp 02-Plataforma-Web/nombre-curso.html nombre-curso/index.html
```

### Comando para generar preview:
```bash
node 05-Generador-Cursos/preview-course.js nombre-curso
```

---

## Sistema de Backend (Google Sheets)

### Endpoint
```
URL: https://script.google.com/macros/s/AKfycbzHd4KB4MafCKKPp8kEf9V-vLnlsCKUhmqR6eMFB-Qvz2f03xy9bYSx86eGUuS5RkfX2g/exec
Token: ROVER_ASC_2025
```

### Acciones soportadas (POST):
| Accion | Datos | Descripcion |
|--------|-------|-------------|
| `register` | fullName, age, group, region, email, motivation | Registro inicial del usuario |
| `progress` | name, email, moduleCompleted, course | Modulo completado |
| `quiz` | name, email, module, score, course | Resultado de evaluacion |
| `certificate` | name, email, group, region, certificateCode, score, course | Certificado generado |

### Recuperacion de progreso (GET):
```
?action=recover&email=correo@example.com&course=courseId&token=ROVER_ASC_2025
```
Respuesta: `{ success: true, data: { registration, modules, quizzes, certificates } }`

---

## Componentes del Motor de Cursos (engine.js)

### Funciones principales:

| Funcion | Descripcion |
|---------|-------------|
| `handleRegistration(event)` | Procesa formulario de registro, guarda perfil, envia a Sheets |
| `toggleRegistrationMode(mode)` | Alterna entre registro nuevo y recuperacion de avance |
| `recoverProgress()` | Recupera progreso del servidor por email |
| `showModule(index)` | Navega a un modulo especifico |
| `selectOption(element, index)` | Selecciona opcion en evaluacion |
| `checkQuiz(moduleNum)` | Verifica respuestas del quiz (requiere 70% para aprobar) |
| `completeModule(moduleNum)` | Marca modulo como completado y avanza |
| `saveProgress()` | Guarda progreso en localStorage |
| `loadProgress()` | Carga progreso desde localStorage |
| `updateProgress()` | Actualiza barra de progreso visual |
| `updateElapsedTime()` | Actualiza contador de tiempo transcurrido |
| `updateStats()` | Actualiza estadisticas (modulos, quizzes, tiempo) |
| `unlockAchievement(id)` | Desbloquea logro con animacion |
| `showNotification(msg, type)` | Muestra notificacion flotante |
| `saveReflection(moduleNum, text)` | Guarda reflexion personal |
| `generateCertificate()` | Genera certificado con datos del usuario |
| `downloadCertificatePDF()` | Descarga certificado como PDF de 1 pagina |
| `sendToGoogleSheets(data)` | Envia datos al backend con token y fallback CORS |
| `shareResults()` | Comparte logros via Web Share API o clipboard |
| `restartCourse()` | Reinicia todo el progreso del curso |

### Variables de configuracion (inyectadas por build-course.js):
```javascript
var COURSE_CONFIG = {
    courseId: "fundamentos-scout",       // ID unico sin tildes
    title: "Fundamentos del...",         // Titulo para mostrar
    totalModules: 9,                     // Total incluyendo registro y certificado
    contentModules: 6,                   // Solo modulos de contenido
    googleScriptUrl: "https://...",      // URL del Apps Script
    achievements: [...]                  // Array de logros
};

var QUIZ_ANSWERS = {                     // Respuestas correctas por modulo
    2: [1, 0, 2],                        // Modulo 2: indices de opciones correctas
    3: [0, 1],                           // Modulo 3: etc.
};
```

### Persistencia:
- **localStorage:** `courseProgress_{courseId}` — Perfil, progreso, quizzes, tiempo, reflexiones
- **Google Sheets:** Registro, progreso por modulo, quizzes, certificados (con token auth)
- **Timer:** Incrementa `studyTime` cada 60 segundos si el usuario esta en un modulo de contenido

---

## Archivos de Estilo

### styles.css (template compartido)
CSS para todos los cursos generados. Incluye:
- Layout responsive (mobile-first, breakpoint 768px)
- Top-bar con logos y enlace de retorno
- Sistema de navegacion (desktop: botones, mobile: select)
- Modulos de contenido (info-box, mission-box, timeline, method-grid)
- Sistema de evaluaciones (quiz, opciones, feedback visual)
- Logros (achievements con animacion de desbloqueo)
- Certificado con decoraciones
- Toggle de registro/recuperacion
- Indicadores de sincronizacion y guardado
- Estilos de impresion (@media print)

### dark-theme.css
Tema oscuro activado por `html[data-theme="dark"]`. Usa custom properties para invertir colores. Compatible con `prefers-color-scheme: dark`.

### theme-toggle.js
Inyecta boton de tema (sol/luna) en el top-bar. Persiste preferencia en `localStorage('rover-theme')`.

---

## Historial de Versiones

| Version | Tag | Descripcion |
|---------|-----|-------------|
| v1.0.0 | - | Curso Fundamentos completo, registro, quizzes, certificado |
| v1.1.0 | - | Google Sheets backend, dashboard admin, verificador certificados |
| v1.2.0 | - | Sistema generador de cursos (build-course.js, schemas, templates) |
| v1.3.0 | v1.3.0 | Dark mode, PDF descargable, GitHub Actions workflow |
| v1.4.0 | v1.4.0 | Nuevo curso Caracteristicas Educativas, preview pre-publicacion |
| v1.5.0 | actual | Top-bar, sync Google Sheets, recuperacion sesion, certificado rediseñado, limpieza de codigo |

---

## Notas Tecnicas

### Certificado PDF
El certificado se genera client-side:
1. Se clona el `.certificate` en un contenedor oculto de 600px
2. `html2canvas` renderiza el clon como imagen JPEG
3. Se calcula la escala para que quepa en el area util de A4 (190x277mm)
4. `jsPDF` crea un PDF de exactamente 1 pagina con la imagen centrada
5. En movil: se genera blob y se ofrece via `<a download>`

### Recuperacion de Sesion
- El usuario puede alternar entre "Nuevo Registro" y "Recuperar mi Avance"
- La recuperacion hace un GET al Apps Script con email + courseId + token
- El Apps Script devuelve: `{ success, data: { registration, modules, quizzes, certificates } }`
- La funcion reconstruye userProfile, moduleProgress y quizScores desde la respuesta

### Google Sheets Sync
- Cada envio incluye `token: 'ROVER_ASC_2025'` para autenticacion
- Primero intenta fetch CORS normal, si falla reintenta con `mode: 'no-cors'`
- Feedback visual al usuario: "Guardado en la nube" / "Sincronizado" / "Guardado localmente"

### Rutas de Assets
- Cursos en subcarpetas (`curso-id/index.html`) usan `../assets/` para recursos compartidos
- El build-course.js genera automaticamente las rutas relativas correctas
