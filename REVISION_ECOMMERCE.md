# Revisión de Mora Verduras

Fecha: 9 de octubre de 2026.

El proyecto vende frutas, verduras y packs con despacho y confirmación por WhatsApp. La revisión cubre la documentación del repositorio, la arquitectura, el catálogo público, carrito, checkout, clientes HTTP, autenticación, pantallas administrativas y despliegue. La API externa y su base de datos no están en este repositorio; no se puede certificar aquí su autorización, integridad transaccional o seguridad.

## Arquitectura y fuentes de datos

| Aplicación | Responsabilidad | Datos |
| --- | --- | --- |
| `web/` | Tienda pública, búsqueda, categorías, promociones, carrito y checkout | API externa, con catálogo estático de respaldo |
| `admin/` | Login y gestión de productos, precios, visibilidad, promociones, categorías, testimonios, pedidos, configuración y usuarios | API externa con JWT |
| Raíz Expo | Aplicación móvil con Home y Cart | Datos estáticos; aún sin conexión a la API |

GitHub Pages publica tienda y panel desde `.github/workflows/deploy.yml`. El admin es una aplicación independiente bajo `/verduleriaBaackFF/admin/`. No hay rutas de servidor ni procesamiento de pagos en Pages. La API `mora-verduras-api` es la responsable de persistir datos y validar operaciones administrativas.

## Problemas corregidos

| Prioridad | Hallazgo | Cambio |
| --- | --- | --- |
| Alta | El checkout y los enlaces de contacto ignoraban los cambios de configuración del admin | Hook común de configuración remota para envío, umbral gratuito, comunas, horarios, pagos, WhatsApp, Instagram y marca visible |
| Alta | Oferta y contador fijos independientes de las promociones del admin | Banner y modal usan la primera promoción vigente, ordenada desde la API; contador ficticio eliminado |
| Alta | Datos remotos cacheados indefinidamente | Revalidación cada minuto con la pestaña visible, al enfocar y al recuperar visibilidad; conserva datos remotos ante fallos posteriores |
| Alta | Se abría WhatsApp después de esperar una petición, expuesto al bloqueo de ventanas | Reserva de ventana durante el clic y enlace explícito para continuar si el navegador bloquea la apertura |
| Alta | Cualquier error del pedido se convertía en pedido directo por WhatsApp, incluso validaciones 4xx | Los errores 4xx se muestran sin abrir el pedido alternativo; conexión/servidor permiten consultar por WhatsApp |
| Alta | Los campos de listas del admin eliminaban líneas nuevas mientras se escribía | Texto editable independiente; limpieza y deduplicación al guardar |
| Media | El carrito se perdía al recargar | Persistencia versionada en almacenamiento local, validación de datos restaurados y actualización de precios/disponibilidad tras respuestas exitosas de la API |
| Media | Catálogo y admin limitados a los primeros 100 productos | Tienda recorre todas las páginas; admin permite navegar páginas de 20 productos |
| Media | Productos destacados descartados al mapear la API | Conserva el indicador y permite ordenar destacados primero |
| Media | Promociones futuras o vencidas podían seguir visibles | Filtro de vigencia y edición de fechas desde el admin |
| Media | Sesión expirada eliminaba token pero mantenía el panel visible | La autenticación responde al cambio de token y al cierre desde otra pestaña |
| Media | Consultas HTTP sin límite de espera | Límite de 25 segundos para tienda y admin |
| Media | Errores de edición detrás del modal | Errores visibles dentro de los editores de productos, promociones, categorías y testimonios |
| Media | Pedidos con fecha anterior; fechas de admin desplazadas por UTC | Validación de fecha y fecha actual en Santiago; fechas sin hora se muestran sin retroceder un día |
| Media | Filtro de pedidos conservaba página anterior | Sincronización de página al cambiar de filtro |
| Media | `predeploy` dependía del comando Unix `cp` | Copia mediante Node compatible con Windows y CI; CI incorpora TypeScript antes de compilar |
| Baja | Restar cantidad uno no retiraba el producto | Decremento a cero retira el producto; límite de 99 unidades, también en Expo |

## Mejoras de compra

- Buscador por nombre, descripción y categoría, sin distinguir tildes.
- Orden por precio, nombre o destacados, junto con categorías y cantidad de resultados.
- Acción para limpiar filtros y mensaje de búsqueda sin resultados.
- Zona de reparto y confirmación por WhatsApp visibles junto al catálogo.
- Etiquetas accesibles de formulario y filtros; estados del pedido en español.
- Precio total del servidor mostrado tras registrar el pedido.
- Título y descripción del documento actualizados con la marca y zona configuradas.

## Lo que realmente permite el admin

Productos y precios, categorías, activación/desactivación, destacados, promociones y vigencia, testimonios, consulta y cambio de estado de pedidos, configuración de marca/contacto/despacho/pago, y gestión de usuarios según el contrato actual de la API.

Los cambios se aplican al catálogo web al recargar o durante la revalidación de datos. Expo sigue usando datos locales. No existe aún un CMS para editar libremente cada sección de la portada, imágenes, textos del hero o políticas comerciales. Esos contenidos requieren una extensión de los contratos de la API y un editor correspondiente; no se inventaron endpoints.

## Pendientes para una operación ecommerce completa

1. **Packs registrados en pedidos:** la API de pedidos recibe `productId` y cantidad. Las promociones no son productos comprables en ese contrato. Pedidos con packs continúan por WhatsApp, con aviso explícito de que no aparecen en el panel. Se requiere soporte del backend para persistirlos y calcular sus precios.
2. **Stock y disponibilidad:** la API expone productos activos, pero los tipos actuales no tienen inventario, reservas ni control de concurrencia. Incorporar esos mecanismos requiere backend.
3. **Pagos online:** el flujo actual confirma por WhatsApp. Para añadir pagos se necesita proveedor, backend, webhooks y conciliación; las credenciales nunca deben ir en variables `VITE_*`.
4. **Gestión integral de contenido:** ampliar configuración para hero, secciones, imágenes y políticas, con permisos y validación del servidor.
5. **Seguridad de producción:** comprobar en el repositorio de la API la autorización de `/admin/*`, roles, caducidad/revocación JWT, validación de precios y protección de datos de clientes. El frontend guarda JWT en localStorage; cualquier migración a cookies HttpOnly exige cambios en API/CORS. La documentación describe credenciales iniciales por defecto: verificar su configuración real en el servidor.
6. **Pedidos duplicados y respuesta incierta:** una petición que vence puede haberse registrado. Falta idempotencia en el contrato backend. El fallback pide consultar con la tienda y no reintenta automáticamente el POST.
7. **Fallback de catálogo:** al entrar sin respuesta de API puede mostrarse el catálogo estático, cuyos precios/disponibilidad necesitan confirmación. Con API disponible, el pedido utiliza precios calculados en servidor. Hace falta definir una política comercial de venta durante caídas.
8. **Rendimiento de imágenes:** las fotos PNG actuales pesan aproximadamente entre 0,48 y 1,09 MB cada una. Conviene preparar formatos y tamaños adecuados antes de optimizar la carga móvil.
9. **Accesibilidad y pruebas visuales:** falta verificar teclado/foco de todos los modales, móvil, contraste, movimiento reducido y apertura real de WhatsApp.

## Validación y límites

- TypeScript y compilación de producción de tienda y admin.
- Preparación de despliegue en Windows, incluidos los `404.html`.
- Comprobaciones aisladas con respuestas simuladas: paginación de tres páginas, conservación de destacados, filtrado de promociones futuras/inactivas/vencidas, propagación de fallo de configuración, error HTTP 422, señal de timeout y cierre de sesión por 401. No se añadió un framework ni un comando de pruebas al proyecto.
- No se crearon pedidos reales, se modificaron datos remotos ni se publicaron cambios.
- El navegador integrado respondió `net::ERR_CONNECTION_TIMED_OUT` al abrir el servidor local. No hay auditoría visual completada ni prueba end-to-end de compra/login. Los cambios necesitan esa comprobación antes de publicarse.

El documento registra revisión de código y validaciones técnicas; no certifica la API externa, pagos, seguridad del servidor ni una compra real completada.
