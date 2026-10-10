# Fase 5 — contrato implementado localmente

Packs personalizados integrados en web, Expo, administrador y backend externo C:\verduleriaBaack. No desplegado.

## Reglas

Mínimo 4 productos distintos por pack: 4–5 activan 10 %, 6+ activan 15 %. Varias unidades del mismo ID no elevan el tramo. Excluir promociones, unidad pack y categoría Packs. Límite global 99 unidades por producto, incluyendo todas las composiciones.

Un cupón por pedido: se aplica una vez al subtotal después del descuento del pack; no al despacho. Descuentos redondeados hacia abajo a CLP enteros. Envío configurado $2.500, gratis desde $20.000 de subtotal después de descuentos. Conservar configuración central.

## API

POST /api/v1/orders/quote recibe items [{productId, quantity, packId?}] y couponCode opcional. Cotiza sin guardar pedidos. productId siempre es real; packId solo agrupa los componentes, nunca se usa como producto.

Respuesta: grossSubtotal, packDiscount, couponDiscount, couponCode, subtotal neto, shipping, total.

POST /api/v1/orders recibe esos mismos campos junto con los datos existentes de cliente/entrega. Recarga precios, comprueba actividad/elegibilidad y cantidades, vuelve a calcular y registra. No recibe precios/porcentajes/totales del cliente. Pedidos antiguos sin packId ni couponCode siguen funcionando.

Flyway V3__coupons.sql crea cupones. V4__order_discounts.sql conserva descuentos y código en pedidos, agrupación en líneas y subtotal bruto de pedidos históricos. El administrador y el mensaje WhatsApp muestran composición y descuentos.

## Cupones en /admin

Crear/editar nombre (también código), porcentaje entero 1–100 y activo/inactivo. Nombres únicos de 2–40 caracteres, mayúsculas, letras ASCII/números/guion/guion bajo, sin espacios. Reactivar mediante edición. Sin códigos de ejemplo ni listado público de códigos.

GET/POST /api/v1/admin/coupons, PUT /api/v1/admin/coupons/{UUID}, protegidos por ROLE_ADMIN. DTO {name, percentage, active}; respuesta agrega id. Validaciones cliente/servidor/SQL, incluyendo rechazo de porcentajes fraccionarios.

## Interfaz

Constructor con cantidades, descuento y agregado como pack. Web persiste/reconcilia composición; retira el pack completo si desaparece un componente. Borrador y cupón no persisten después de recargar.

Carrito cotiza al cambiar productos/cantidades/cupón, descarta respuestas obsoletas y bloquea registro sin cotización válida. Permite quitar cupón inválido/reintentar. Web conserva importes registrados y reutiliza el pedido al abrir WhatsApp. Expo registra por API los pedidos con pack/cupón y conserva el resultado en esa pantalla; pedidos ordinarios mantienen WhatsApp directo.

## Verificación y publicación

TypeScript/builds web/admin, export Expo web, pruebas unitarias de servidor para tramos, cantidades repetidas, límite global, redondeo, cupón aplicado una vez y envío sobre subtotal neto. Navegador con API simulada: pack, cotización, cupón inválido/válido, registro con componentes reales sin precios enviados.

Pendiente ejecutar migraciones/pruebas PostgreSQL (Testcontainers se omite sin Docker), probar Android/iOS físicos y desplegar backend antes del frontend. Pruebas simuladas no confirman persistencia real ni entrega WhatsApp. Sin pagos en línea, reservas de stock, vigencias o límites de uso de cupones en esta fase.
