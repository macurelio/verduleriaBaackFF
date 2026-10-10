# AGENTS.md

## Storefront apps and admin panel

| | Root app | `web/` app |
|---|---|---|
| Stack | Expo ~55 / React Native 0.83 / React 19, plain **JavaScript** | Vite 5 / React 18 / **TypeScript strict** / Tailwind 3 |
| Entry | `index.js` → `App.js` → `src/screens/*` | `web/src/main.tsx` → `web/src/App.tsx` |
| Deployed? | No (legacy gh-pages script only) | Yes — GitHub Pages via CI (the live site) |

- Each has its own `package.json` + lockfile. Always run commands **inside the right directory**; `node_modules` is not installed by default (`npm install` first).
- Product data and UI features are duplicated across both apps and are edited in the **same commit**. Unless told otherwise, a catalog/content change means both apps.
  - Root: catalog `src/data/{products,combos,categories}.js`, shared config `src/config.js`
  - Web: catalog `web/src/data/{products,promos,categories}.ts`, shared config `web/src/config.ts`
- This is **Mora Verduras** (vegetable/fruit box store). Web product visuals are resolved by `web/src/produce.ts` (AI PNGs, SVGs, emoji fallback); Expo uses emoji + gradient. Web records orders through an external API, with or without continuing to WhatsApp; Expo requests orders through WhatsApp. Neither app collects online payment.
- `admin/` is a separate Vite/React TypeScript app for catalog, configuration and order management. The backend lives in `C:/verduleriaBaack`, outside this frontend repository. See `FLUJO_PEDIDOS.md` for the order contract.

## Commands (there is no lint/test/formatter — do not invent one)

- Web dev server: `cd web && npm run dev` → http://localhost:5173/verduleriaBaackFF/ (base path is part of the URL)
- Web build: `cd web && npm run build`; deploy prep `npm run predeploy` (build + Node copy of `dist/index.html` to `dist/404.html`, compatible with Windows)
- Typecheck: `cd web && npx tsc --noEmit` (no npm script exists; only `web/tsconfig.json` has real settings — the root `tsconfig.json` just extends `expo/tsconfig.base` and the root app is JS anyway)
- Expo app: `npm start` / `npm run android|ios|web` from repo root

Verify changes with the web build and/or `tsc --noEmit`.

## Deploy

- `.github/workflows/deploy.yml`: on push to `main`, builds `web/` (`npm ci` + `npm run predeploy`) and publishes `web/dist` with GitHub Pages Actions.
- Root `npm run deploy` (gh-pages branch) is the **legacy** Expo deploy path; `origin/gh-pages` still holds an old Expo export. Don't use it unless explicitly asked.

## `web/` specifics

- Base path `/verduleriaBaackFF/` is hardcoded in `web/vite.config.js` **and** `app.json`. The favicon is an emoji SVG (`web/public/favicon.svg`) referenced via `%BASE_URL%` in `web/index.html`. Never hardcode `/images/...`.
- Tailwind design tokens live only in `web/tailwind.config.js`: semantic colors `canvas`, `surface`, `ink`, `border`, `error`, `whatsapp`; brand `mora` (`DEFAULT #2F7D32`), plus `cream`, `sand`, `muted`, `cocoa`, `charcoal`; fonts `heading` (Outfit) / `body` (Inter); easings `smooth`, `premium`, `out-expo`. Use tokens instead of raw hex (`bg-charcoal`, `text-sand`, …).
- TS is strict with `noUnusedLocals` / `noUnusedParameters`. The `@/*` path alias is declared in `web/tsconfig.json` but **not** configured in `vite.config.js` — it would break at runtime; all existing code uses relative imports.
- Checkout (`web/src/components/ui/CartDrawer.tsx`) validates the form and calls `createOrder` in `web/src/api/orders.ts`. Payload lines are `{productId, quantity}`; the server calculates authoritative prices/totals. Preserve duplicate-click protection and uncertain-result handling. `useSiteConfig` supplies API overrides, including the WhatsApp number.
- Custom packs preserve real product components; order lines expand with optional `packId`. Never submit a synthetic pack ID as `productId`. Packs require at least 4 distinct products (10 %), or 6+ (15 %); exclude promotions and other packs. Global quantity limit is 99 per real product, including pack contents.
- `POST /orders/quote` validates pack/coupon pricing before checkout; `POST /orders` recalculates and stores it. One optional `couponCode` applies once after pack discounts. Free shipping uses the net subtotal; default fee CLP 2500, threshold CLP 20000. Never register discounted orders when quotation fails. Backend needs Flyway V3/V4 before deploying this frontend.
- Local previews share calculations in `web/src/utils/cart.ts` through `useCartCalculations`; Expo mirrors the policy in `src/utils/cart.js`. Expo uses API registration for custom-pack/coupon orders; ordinary orders retain WhatsApp direct. No per-comuna rates are supported.
- Web overlays use `Dialog.tsx` for focus, Escape, backdrop, inert background and coordinated scroll locking. Reuse it for new modals.
- `web/package.json` mixes React 18 runtime with `@types/react` 19 — don't "fix" versions without checking.

## Root Expo app specifics

- The light theme palette lives in `src/theme.js`, used by `App.js` and JS screens/components with `StyleSheet`. New screens must be registered in the `Stack.Navigator` in `App.js` (currently only `Home` and `Cart`).
- Navigation is React Navigation native-stack; state via `src/context/CartContext.js` (root) and `web/src/context/CartContext.tsx` (web) — separate implementations.

## Conventions

- UI copy is **Spanish** (Chilean market). Prices are integer CLP formatted with `toLocaleString('es-CL')`. The WhatsApp number, shipping fee, comunas, payment methods and Instagram handle live in the config files (`web/src/config.ts` / `src/config.js`) — change them there, not in components. The number is `+56 9 9577 8113` (the admin panel can override it via the API config).
- Commit messages: conventional commits (`feat:`/`fix:`/`refactor:`), often in Spanish.
- `.idea/` is partially tracked; new IDE files show up as untracked — don't commit IDE noise.
