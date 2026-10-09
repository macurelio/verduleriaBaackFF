# Datos para probar el flujo

`seed-flow.mjs` completa el catálogo mediante la API administrativa y crea cuatro pedidos ficticios mediante el mismo endpoint que usa el checkout. No necesita acceso directo a PostgreSQL ni modifica su esquema.

Requiere Node.js y las dependencias instaladas en `web/`. Ejecutar desde la raíz:

```powershell
node scripts/seed-flow.mjs
# Vista previa; no conecta ni escribe.

# Definir SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD en el entorno local.
# SEED_API_URL es opcional; por defecto usa la API de Render de Mora Verduras.
node scripts/seed-flow.mjs --apply
```

Conserva categorías, productos y promociones existentes. Completa las listas de configuración solo si están vacías. No modifica tarifas, contraseñas ni contacto. Los cuatro pedidos se identifican por `[PRUEBA FLUJO MV]` y deben excluirse de ventas y despacho reales. Al repetir, reutiliza esos pedidos y restablece sus estados de prueba. No envía mensajes ni realiza pagos.

Carga verificada el 9 de octubre de 2026: 4 categorías, 14 productos y 4 promociones; pedidos `MV-2026-0002` (pendiente), `MV-2026-0003` (confirmado), `MV-2026-0004` (entregado), `MV-2026-0005` (cancelado). Verifica las líneas, subtotal, despacho y total devolviendo cada pedido desde la API. Incluye despacho de $2.500 y despacho gratuito sobre $20.000.

Para comprobar la interfaz, abrir el admin y filtrar los pedidos por estado; abrir la tienda, elegir productos, completar la entrega y revisar el resumen de WhatsApp. El backend también permite registrar packs/promociones. Este script crea pedidos de productos; el flujo de packs está documentado en `FLUJO_PEDIDOS.md`. No hay reservas de inventario ni pagos online.

Si una creación vence por timeout, comprobar los pedidos en el admin antes de repetir: el servidor puede haber completado la escritura. Las credenciales se leen únicamente del entorno y no se guardan en este repositorio.
