# Fase 5 — integración pendiente

## Estado y regla aprobada

El constructor ya agrega una selección de productos reales a precio de catálogo, en ambas apps. No representa todavía un pack con descuento en el pedido. La API existente recibe `items: [{productId, quantity}]`; esas líneas conservan sus precios normales. No se cambia ese comportamiento hasta tener soporte del servidor.

El usuario aprobó contar IDs distintos: 4–5 productos = 10 %, 6 o más = 15 %. Varias unidades del mismo ID cuentan como un producto. También confirmó excluir packs de las promociones. Los selectores excluyen productos de unidad `pack` o categoría `Packs`; el constructor personalizado excluye asimismo promociones predefinidas.

## Cupones en el administrador (implementado localmente)

Sección **Cupones** en `/admin`: crear/editar nombre (también código del cliente), porcentaje entero 1–100 y estado activo. Nombres normalizados a mayúsculas, 2–40 caracteres sin espacios: letras ASCII, números, guion o guion bajo. Evita duplicados incluyendo cupones inactivos; permite reactivarlos.

Backend `C:\verduleriaBaack`: `GET/POST /api/v1/admin/coupons`, `PUT /api/v1/admin/coupons/{UUID}`; permisos ROLE_ADMIN existentes. DTO `{name, percentage, active}`, respuesta agrega `id`. Migración nueva `V3__coupons.sql` con unicidad y restricciones de nombre/porcentaje. No hay endpoint público que liste códigos ni cupones creados de ejemplo. Los cupones aún no afectan el cálculo de pedidos: el checkout y la política de acumulación se integrarán después.

Verificado: TypeScript/build admin; creación/edición/desactivación, duplicados, errores y móvil en Chromium con API simulada; pruebas unitarias Java correctas. Las pruebas PostgreSQL/Testcontainers se omitieron sin Docker. No desplegado.

## Propuesta de contrato aditivo (no implementado)

```json
{
  "items": [{ "productId": "h1", "quantity": 1 }],
  "customPacks": [{ "items": [{ "productId": "h2", "quantity": 2 }] }],
  "couponCode": null
}
```

Mantener los campos actuales de cliente/entrega. Los pedidos antiguos siguen funcionando. El servidor recarga cada producto, comprueba actividad/elegibilidad, agrupa IDs repetidos, limita cantidades y calcula descuentos por cada composición. No aceptar porcentaje ni precio del cliente. Una promoción predefinida nunca cuenta para un pack personalizado. Validar cantidades totales por producto entre líneas normales y todos los packs.

Respuesta aditiva sugerida: `grossSubtotal`, `packDiscount`, `couponDiscount`, `appliedCoupon`, `customPacks` con composición y snapshots. Conservar `subtotal` como importe después de descuentos y antes de envío. Administrador y WhatsApp deben mostrar composición, descuentos y totales registrados. Agregar una capacidad explícita al GET de configuración para habilitar la UI solo con un backend compatible; no inferir capacidad por versión del frontend.

## Decisiones todavía pendientes

- Acumulación de cupones con descuentos de packs.
- Los códigos y porcentajes se administran en `/admin`; futuras vigencias en America/Santiago, mínimos y elegibilidad siguen pendientes.
- Umbral de envío gratis: importe antes o después de descuentos.
- Redondeo CLP: propuesta `floor(base * porcentaje / 100)` para el descuento.
- Límites de uso de cupones: un pedido PENDING no demuestra compra; definir consumo/cancelación antes de ofrecer usos limitados.

## Cambios necesarios en backend y administrador

Backend externo en `C:\verduleriaBaack`: DTOs aditivos, cálculo autoritativo, entidades y migraciones Flyway para composición y snapshots de descuento, endpoints públicos de cotización. La gestión protegida de cupones y su tabla ya están implementadas localmente. Cotizar antes de enviar, volver a calcular al registrar; cotizar no consume cupón. No modificar migraciones aplicadas ni confiar en precios del navegador.

Administrador: añadir futuras vigencias; inspeccionar la composición de cada pack y descuentos en pedidos; preservar los campos existentes de configuración.

Frontend: conservar packs por composición, distinguir líneas individuales de packs, reconciliar IDs y disponibilidad, pedir cotización al editar y enviar composición al registrar. Al fallar la cotización, impedir cobrar con un descuento local. Expo también necesita integrar ese contrato antes de emitir pedidos descontados.

Verificación: límites 3/4/5/6 productos, IDs repetidos, promociones excluidas, cantidades 1/99 y suma global, productos inactivos, cupones vencidos/no válidos, acumulación, redondeo y envío en el umbral; pruebas de integración contra PostgreSQL y revisión del pedido en administrador y WhatsApp.
