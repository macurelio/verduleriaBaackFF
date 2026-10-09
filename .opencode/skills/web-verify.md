# web-verify

Checklist obligatorio tras cambios en `web/`.

## Pasos
1. **Typecheck estricto**
   ```powershell
   cd web
   npx tsc --noEmit
   ```
   Debe pasar sin errores.

2. **Build web**
   ```powershell
   cd web
   npm run build
   ```
   Genera `web/dist/`. Debe completar sin errores.

## Notas
- El script `predeploy` hace `cp dist/index.html dist/404.html`. Esto **falla en shell Windows** (PowerShell/cmd). El CI de GitHub Actions corre en Ubuntu y sí lo ejecuta. No es necesario "arreglarlo" para verificar localmente.
- Verificar rutas base `/verduleriaBaackFF/` intactas (vite.config.js, app.json, index.html con `%BASE_URL%`).
- Verificar que `waLink()` genera enlace correcto (sin hardcode URL).
- No añadir archivos `.md` de documentación innecesarios.