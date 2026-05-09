# apps-script/ — Backend versionado con clasp

Esta carpeta es la copia local sincronizada del proyecto Google Apps Script
que sirve como backend de la plataforma. Permite editar el codigo backend
directamente en este repositorio y desplegarlo con un solo comando, sin
copiar-pegar manualmente en el editor web de Google.

## Archivos

| Archivo | Proposito |
|---------|-----------|
| `Código.js` | Codigo fuente del backend (mismo contenido que `Code.gs` en el editor) |
| `appsscript.json` | Manifiesto del proyecto (timezone, runtime, permisos web app) |
| `.clasp.json` | Vinculo al Script ID en Google Apps Script (`scriptId`) |

## Workflow basico

### Editar localmente y desplegar

1. Edita `Código.js` con tu editor favorito (VSCode, Sublime, etc.).
2. Desde esta carpeta ejecuta:
   ```powershell
   clasp push
   ```
3. El cambio queda en el editor de Apps Script. Para que el Web App
   (URL publica que consumen los cursos) sirva el codigo nuevo, ademas
   debes crear una nueva implementacion:
   ```powershell
   clasp deploy --description "Cambio descriptivo"
   ```
   O bien manualmente desde el editor: **Implementar > Administrar implementaciones >
   editar la version vigente > Nueva version**.

### Bajar la version actual del editor (sobreescribe local)

Util si alguien hizo cambios manualmente en el editor web:
```powershell
clasp pull
```

### Ver lista de versiones desplegadas

```powershell
clasp deployments
```

### Abrir el editor en el navegador

```powershell
clasp open-script
```

## Requisitos previos

1. Node.js instalado (con npm)
2. Clasp instalado globalmente:
   ```powershell
   npm install -g @google/clasp
   ```
3. Login con la cuenta Google propietaria del Sheet:
   ```powershell
   clasp login
   ```
4. La API de Apps Script habilitada en tu cuenta:
   visita https://script.google.com/home/usersettings y activa el toggle.

## Notas importantes

- **No agregues `.clasp.json` a `.gitignore`** — el Script ID es publico (cualquiera
  necesita estar autenticado como propietario para hacer cambios).
- **NO subas `~/.clasprc.json`** — son tus credenciales OAuth personales. Ya esta
  fuera del repo por defecto.
- **NO renombres `Código.js`** sin cambiar tambien el archivo en el editor o
  podrias terminar con dos versiones (la vieja sin tilde y la nueva).
- **`clasp push` sobreescribe** todo el contenido del archivo en el editor sin
  pedir confirmacion. Si tienes dudas, primero `clasp pull` para sincronizar.

## Triggers (no se manejan via clasp)

Los triggers programados (como el backup nocturno) **no se instalan via clasp**
por seguridad. Hay que ejecutar manualmente desde el editor las funciones que
los crean (`instalarTriggerBackup`, etc.). Esto es una sola vez por trigger.
