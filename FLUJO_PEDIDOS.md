# Registro de pedidos

1. El carrito conserva la selección en el navegador (`mv_cart_v1`). Esto todavía no es un pedido en PostgreSQL.
2. El cliente completa sus datos y pulsa **Enviar pedido sin WhatsApp** o **Enviar pedido por WhatsApp**. Ambos botones envían `POST /api/v1/orders` con nombre, teléfono, dirección, comuna, fecha, horario, forma de pago, notas y líneas `{productId, quantity}`. La fecha vacía usa el día actual en Chile; horario y pago vacíos usan la primera opción configurada.
3. La API consulta cada ID en `product` o `promotion`, verifica que esté disponible y, para promociones, que la vigencia incluya el día actual en Chile. Lee los precios en PostgreSQL; el navegador no decide los importes que se guardan.
4. `OrderService.create` calcula subtotal, despacho y total, genera UUID y código `MV-año-correlativo`, y guarda todo en una transacción. `orders` contiene los datos del cliente, entrega, pago, importes y estado `PENDING`; `order_item` contiene las cantidades y una copia del nombre, unidad y precio de cada producto o pack. Los packs usan unidad `PACK`. Un error antes de terminar revierte el pedido completo.
5. La respuesta devuelve el código y total. La tienda muestra la confirmación; el pedido aparece en **Admin → Pedidos**. El botón sin WhatsApp no abre ventanas ni envía mensajes. El otro botón abre un enlace con el resumen; la persona debe enviar el mensaje manualmente en WhatsApp.
6. El administrador cambia el estado a confirmado, entregado o cancelado mediante `PATCH /api/v1/admin/orders/{id}/status`. Abrir/enviar WhatsApp no cambia automáticamente el estado, y registrar el pedido no cobra dinero.

El checkout bloquea clics simultáneos y reutiliza el pedido guardado mientras no cambien los datos del formulario o del carrito. Si una petición vence, puede haber sido guardada por el servidor: consultar con la tienda antes de repetir. La API aún no implementa claves de idempotencia para reintentos ni reservas de stock. El contenido de las promociones sigue almacenado como texto; el pedido copia título y precio del pack, sin desglosar ni reservar sus ingredientes.

La implementación del backend está en `C:/verduleriaBaack`. La publicación de tienda/admin usa GitHub Pages; el backend se despliega en Render. No se requiere migración para los packs porque `order_item.product_id` ya admite IDs de catálogo sin una clave externa a `product`.
