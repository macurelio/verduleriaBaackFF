# web-ui-ux

Guía de UI/UX para la web de Mora Verduras (`web/`). Aplicar siempre que se refactorice UI en web.

## Contexto
- Stack: Vite 5 + React 18 + TypeScript strict + Tailwind 3
- Desplegado en GitHub Pages con base path `/verduleriaBaackFF/`
- Solo WhatsApp (sin backend/pago online). Pedidos por `waLink()` en `web/src/config.ts`
- Identidad: emoji + gradiente, sin imágenes de producto
- Español (Chile), precios CLP enteros (`toLocaleString('es-CL')`)
- Carrito compartido solo web; root Expo app es JS separado

## Reglas obligatorias
- **Tokens Tailwind**: usar solo tokens definidos en `web/tailwind.config.js` (`mora.DEFAULT`, `cream`, `sand`, `muted`, `cocoa`, `charcoal`) + fonts `heading`/`body` + easings `smooth/premium/out-expo`. No usar hex crudos.
- **Base path**: respetar `/verduleriaBaackFF/`. No hardcodear `/images/...`. Favicon usa `%BASE_URL%`. Ver assets imports.
- **Imports relativos**: **nunca** usar alias `@/`. Mantener imports relativos (igual código existente). El alias existe en tsconfig pero no en vite.
- **TypeScript strict**: respetar `noUnusedLocals` / `noUnusedParameters`. Sin variables/imports sin usar.
- **Desktop-first**: priorizar escritorio (grid denso). Mantener usable móvil.
- **Stepper siempre visible**: en `ProductCard` mostrar `[-][qty][+]` siempre (qty >= 0). `+` añade 1 al instante. Si qty==0 aún visible (o con 0). No transición "Agregar → stepper".
- **Usar CartDrawer**: no crear sidebar resumen inline. Usar `CartDrawer.tsx` existente para checkout.
- **WhatsApp-only**: checkout valida mínimo (nombre + teléfono + comuna + dirección) y abre `wa.me` via `waLink()`.
- **React 18**: no asumir APIs React 19-only. Mantener compatibilidad con `@types/react` 19 actual sin subir/bajar versiones.
- **Duplicados**: si toca catálogo/config compartido (`products/combos/categories/config`) editar **ambos** (root y web). Ver `two-apps-sync.md`.

## UI
- CTAs primarios con `mora`, focus-visible con ring, espaciados compactos en desktop.
- Tarjetas con `bg-white`, borde sutil, emoji+gradiente intacto.
- Microcopy español CLP.