# two-apps-sync

Cuando cambies catálogo o configuración compartida entre ambas apps, debes editar **ambas** en el mismo commit.

## Archivos afectados
| Tipo | Root (Expo JS) | Web (Vite TS) |
|---|---|---|
| Productos | `src/data/products.js` | `web/src/data/products.ts` |
| Combos | `src/data/combos.js` | `web/src/data/combos.ts` |
| Categorías | `src/data/categories.js` | `web/src/data/categories.ts` |
| Promos/Testimonios | (si aplica) revisar | `web/src/data/promos.ts`, `web/src/data/testimonials.ts` |
| Config compartida | `src/config.js` | `web/src/config.ts` |

## Reglas
- Mantén estructura coherente (campos equivalentes). Precios enteros CLP.
- WhatsApp number, shipping fee, comunas, payment methods, IG: cambiar **solo** en config (no hardcodear en componentes).
- Commit con mensaje claro (`feat:`/`fix:`/`refactor:`). Si solo web UI → no toca root. Si toca datos/config compartido → editar ambos.
- Tras cambios, verificar web con `web-verify.md`. Root Expo es JS (no requiere tsc).