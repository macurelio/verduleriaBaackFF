# Implementación UI/UX — Mora Verduras

## Alcance de esta entrega (fases 0–4)

- Contexto actualizado en `AGENTS.md`: tienda web, Expo, admin y API externa.
- Tema claro con tokens semánticos en Tailwind y paleta Expo en `src/theme.js`.
- Previsualización de importes centralizada, sin alterar precios, tarifa, cobertura ni umbral.
- Catálogo con vista rápida accesible sin hover, controles táctiles y límite de 99 unidades.
- Modales web con foco inicial, foco contenido, devolución del foco, Escape, backdrop, fondo inert y bloqueo coordinado del scroll.
- Carrito con un solo scroll de contenido y acciones/resumen fijos, formulario separado, etiquetas visibles y errores por campo.
- CTA principal “Registrar y abrir WhatsApp”, conservando registro sin WhatsApp. Registrar no equivale a confirmar ni cobrar.
- Banner de progreso de despacho en catálogo y carrito, con configuración remota en web y configuración local en Expo.
- Bienvenida automática web y popup por scroll Expo desactivados. Ofertas siguen disponibles por interacción.
- Expo adapta tema, búsqueda, acceso inferior al pedido, banner, cantidades y formulario sin cambiar su canal WhatsApp.

## Contratos que se conservan

`Product`: `id`, `name`, `category`, `description`, `price`, `unit`, `emoji`, `badge`, `gradientFrom`, `gradientTo`. No hay campos de stock, procedencia, cosecha o nutrición en este contrato.

`POST /api/v1/orders`: datos del cliente y entrega, más `items: [{productId, quantity}]`. La API determina subtotal, despacho y total; el navegador no envía precios. El resumen local es estimado y, después del registro, se muestra el total del servidor. El enlace de respuesta solo se acepta si usa HTTPS y un host permitido de WhatsApp.

Web conserva `mv_cart_v1`, validación de cantidades y reconciliación del catálogo. Expo conserva su estado en memoria. La API todavía no tiene idempotencia de reintentos: una respuesta incierta requiere consultar a la tienda antes de repetir.

Los valores por defecto siguen siendo $2.500 de despacho y envío gratis **desde** $20.000, con cantidades enteras de 1 a 99. Un carrito vacío no cobra despacho ni anuncia envío gratis alcanzado. No se agregan descuentos en esta entrega.

## Archivos de lógica

- `web/src/utils/cart.ts` / `src/utils/cart.js`: formato y cálculo local, con pruebas de paridad.
- `web/src/hooks/useCartCalculations.ts`: conecta carrito y configuración.
- `web/src/utils/checkout.ts`: teléfono chileno, fecha en Chile y mensaje estructurado.
- `web/src/components/ui/{Dialog,CartItems,DeliveryFields,FreeShippingBanner}.tsx`: piezas reutilizables.

No se añaden paquetes ni se cambian versiones, IDs, imágenes o rutas de despliegue. La tienda conserva Vite, React 18, TypeScript estricto, Tailwind 3 e imports relativos; Expo conserva JavaScript y StyleSheet.

## Verificación

Desde `web/`:

```powershell
npx tsc --noEmit
npm run build
node scripts/verify-commerce.mjs
```

El verificador monetario usa el compilador ya incluido por Vite: cubre carrito vacío, $19.999/$20.000/$20.001, cantidades, configuración alternativa, umbral cero, paridad Expo/web, teléfono chileno y URL de WhatsApp con tildes/ñ/emojis. No crea pedidos.

La revisión de navegador usa el build y respuestas API simuladas. No demuestra el registro en PostgreSQL ni la apertura real de la app WhatsApp. La prueba con el backend real debe realizarse en un entorno de pruebas.

Resultados de esta entrega:

- TypeScript, build Vite y preparación `predeploy`: correctos.
- Pruebas de cálculo, paridad web/Expo y mensaje: correctas.
- Chromium a 320/375/768/1440 px: sin desbordamiento horizontal. Verificados teclado, restauración del foco, Escape/backdrop, scroll/inert, formulario, persistencia, cantidades hasta 99, reutilización del pedido y bloqueo de doble envío. Registro y errores de API simulados, sin pedidos reales.
- Exportación Expo web y revisión móvil de render/búsqueda: correctas. Android/iOS no se han probado en dispositivo.
- Capturas guardadas fuera del repositorio para revisión. No se publica ni se crea un commit en esta entrega.

## Segunda entrega (fase 5)

Avance: constructor de selección en web y Expo, cantidades por unidad de venta, incorporación conjunta al carrito con IDs reales, límites por producto y resumen. La web incluye búsqueda. La selección incorporada utiliza la persistencia y reconciliación existentes del carrito; el borrador del constructor no persiste. No se generan productos ficticios ni se envían precios nuevos a la API.

Regla confirmada por el usuario: contar productos distintos, 10 % desde 4 y 15 % desde 6. Implementada en cliente y servidor, con redondeo del descuento hacia abajo a CLP enteros y pruebas de límites.

Cupones implementados localmente en `/admin` y checkout: crear/editar nombre (código), porcentaje entero 1–100 y estado activo. API protegida, tabla Flyway nueva y pruebas en el backend externo. Selectores de promociones y del constructor excluyen packs, según confirmación del usuario.

Integrados packs personalizados en carrito y API: composición real agrupada con `packId`, cotización autoritativa, 10 % desde 4 productos distintos y 15 % desde 6; cupón aplicado una vez al pedido después del descuento de packs. Envío $2.500 y gratis desde $20.000 de subtotal neto. El administrador y WhatsApp muestran composición/descuentos. Web y Expo bloquean pedidos descontados sin cotización válida.

Pendientes: integración con PostgreSQL/migraciones, Android/iOS físicos y despliegue coordinado (backend primero). Futuras vigencias/condiciones de cupones quedan fuera de esta fase. Detalles en `FASE_5_CONTRATO.md`.

Tarifas por comuna, reservas de stock, idempotencia y nuevas imágenes requieren datos o soporte adicional; no se simulan como funciones de negocio en esta entrega.
