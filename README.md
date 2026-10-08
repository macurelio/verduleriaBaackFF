# Mora Verduras — verduleriaBaackFF

Tienda online de **Mora Verduras** (verduras y frutas a domicilio). Tres apps en un solo repo:

| App | Carpeta | Stack | Descripción |
|---|---|---|---|
| Storefront web | `web/` | Vite 5 · React 18 · TypeScript strict · Tailwind 3 | Sitio público (desplegado en GitHub Pages) |
| Panel admin | `admin/` | Vite 5 · React 18 · TypeScript strict · Tailwind 3 | CRUD de productos, promos, pedidos, configuración y usuarios (con login JWT) |
| App móvil (Expo) | raíz | Expo ~55 · React Native 0.83 · React 19 · JavaScript | App nativa (iOS/Android/web) aún sin conectar a la API |

No hay backend en este repo: los datos vienen de la API **`mora-verduras-api`** (https://mora-verduras-api.onrender.com/api/v1, CORS habilitado). Los pedidos se hacen **solo por WhatsApp**; no hay pago online.

## Sitios

- Tienda: https://macurelio.github.io/verduleriaBaackFF/
- Admin: https://macurelio.github.io/verduleriaBaackFF/admin/

## Estructura

```
.
├── App.js                      # Expo: navigator (solo Home y Cart)
├── src/                        # Expo: screens, components, context, data
├── web/                        # Storefront (TS estricto)
│   ├── src/config.ts           # WhatsApp, envío, comunas, pagos, Instagram
│   ├── src/api/                # client, catalog, orders, useApiResource
│   ├── src/data/               # catálogo estático (fallback de la API)
│   └── .env / .env.development # VITE_API_URL
├── admin/                      # Panel de administración (TS estricto)
│   ├── src/api/                # client (JWT), resources (CRUD tipado)
│   ├── src/screens/            # Login, Orders, Products, Promotions, …
│   └── .env / .env.development # VITE_API_URL
└── .github/workflows/deploy.yml# Build de web + admin → GitHub Pages
```

## Imágenes

El catálogo usa **fotos PNG realistas** de frutas/verduras (generadas con IA, 768×768) sobre los gradientes de cada producto:

- `web/src/assets/photos/*.png` — fotos principal. El mapeo está en `web/src/produce.ts` (`id` → foto, con fallback por emoji para productos nuevos del admin).
- `web/src/assets/produce/*.svg` — ilustraciones SVG de respaldo (pack **Open Crop Icons** de `openfarmcc/open-crop-icons`, licencia **CC0 / dominio público**; `palta.svg` y `limon.svg` son propias).
- Backup sin empaquetar de ambos juegos en `assets/produce/` y `assets/photos/` (raíz del repo).
- La app Expo sigue usando emojis (pendiente portar las imágenes).

## Configuración

- Número de WhatsApp, tarifa de envío / envío gratis, comunas, métodos de pago, horarios e Instagram viven en:
  - `web/src/config.ts` (web)
  - `src/config.js` (Expo)
  - La API devuelve (`GET /api/v1/config`) y se pueden editar desde el **admin**, ya que el storefront carga la configuración desde la API con fallback a `src/config.ts`.
- El número de WhatsApp es un placeholder con `TODO: confirmar`.

## Desarrollo

```bash
# Storefront web (dev) → http://localhost:5173/verduleriaBaackFF/
cd web && npm install && npm run dev

# Admin (dev) → http://localhost:5174/verduleriaBaackFF/admin/
cd admin && npm install && npm run dev

# App Expo
npm install && npm start        # o npm run android|ios|web
```

### Verificación

No hay lint/test/formatter configurados. Se verifica con:

```bash
cd web   && npx tsc --noEmit && npm run build
cd admin && npx tsc --noEmit && npm run build
```

> En Windows, `npm run predeploy` falla en el paso `cp dist/index.html dist/404.html` (shell limitado); CI corre en Ubuntu.

### Variables de entorno (API)

La URL base se toma de `VITE_API_URL` (`.env` = producción, `.env.development` = `http://localhost:8080/api/v1`). Si no está, el código usa por defecto la API de producción. El admin guarda el token JWT en `localStorage` (`mv_admin_token`).

## Datos

- Web: catálogo en `web/src/data/` como fallback; la fuente primaria es la API (`GET /api/v1/products|categories|promotions|testimonials`). El checkout registra el pedido en la API (`POST /api/v1/orders`) y abre WhatsApp; si la API no responde, genera el link `wa.me` directamente.
- Admin: CRUD contra la API (`/api/v1/admin/*`) con JWT, y login en `/api/v1/auth/login`. El usuario admin inicial lo crea la API desde sus variables de entorno (por defecto `admin`/`admin123`, solo si la tabla está vacía).
- Combinados/combos usan IDs `promo-*` que no existen como productos en la API, por lo que el checkout los manda directo por WhatsApp.

## Despliegue

`.github/workflows/deploy.yml` corre en `main` (y manualmente con `workflow_dispatch`):

1. `npm ci` + `predeploy` en `web/`.
2. `npm ci` + `predeploy` en `admin/`.
3. Copia `admin/dist/*` → `web/dist/admin/` (incluye `404.html` para SPA).
4. Publica `web/dist` completo en GitHub Pages.

El deploy de Expo (rama `gh-pages`, comando `npm run deploy` en la raíz) es legacy y no se usa salvo que se pida explícitamente.