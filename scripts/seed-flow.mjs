import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'

// Usa el catálogo del frontend y los endpoints reales: los totales los calcula la API.
const require = createRequire(new URL('../web/package.json', import.meta.url))
const ts = require('typescript')
function readData(path) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  vm.runInNewContext(outputText, { exports })
  return exports
}
const { products } = readData('../web/src/data/products.ts')
const { CATEGORIES } = readData('../web/src/data/categories.ts')
const { promos } = readData('../web/src/data/promos.ts')
const config = readData('../web/src/config.ts')
const base = (process.env.SEED_API_URL || 'https://mora-verduras-api.onrender.com/api/v1').replace(/\/$/, '')
const apply = process.argv.includes('--apply')
const marker = '[PRUEBA FLUJO MV]'
let token
async function request(path, method = 'GET', data) {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(30000),
  })
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`)
  if (response.status === 204) return
  const text = await response.text()
  return text ? JSON.parse(text) : undefined
}
async function allPages(path) {
  const rows = []
  for (let page = 0; ; page++) {
    const result = await request(`${path}?page=${page}&size=100`)
    rows.push(...result.content)
    if (page + 1 >= result.totalPages) return rows
  }
}
const plan = {
  categories: CATEGORIES.length,
  products: products.length,
  promotions: promos.length,
  orders: ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'],
  policy: 'Crear registros faltantes. Conservar existentes. No enviar mensajes WhatsApp.',
}
if (!apply) {
  console.log(JSON.stringify(plan, null, 2))
} else {
  try {
    if (!process.env.SEED_ADMIN_USERNAME || !process.env.SEED_ADMIN_PASSWORD) {
      throw new Error('Define SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD en el entorno.')
    }
    token = (await request('/auth/login', 'POST', {
      username: process.env.SEED_ADMIN_USERNAME,
      password: process.env.SEED_ADMIN_PASSWORD,
    })).accessToken
    const existingCategories = await request('/admin/categories')
    for (const [index, category] of CATEGORIES.entries()) {
      if (!existingCategories.some(c => c.name === category.name)) {
        await request('/admin/categories', 'POST', { ...category, sortOrder: index + 1, active: true })
      }
    }
    const existingProducts = await allPages('/admin/products')
    for (const product of products) {
      if (!existingProducts.some(p => p.id === product.id)) {
        await request('/admin/products', 'POST', { ...product, featured: Boolean(product.featured) })
      }
    }
    const existingPromos = await request('/admin/promotions')
    for (const [index, promo] of promos.entries()) {
      if (!existingPromos.some(p => p.id === promo.id)) {
        const { savings, ...input } = promo
        await request('/admin/promotions', 'POST', {
          ...input, gradientFrom: '#205C2D', gradientTo: '#205C2D', subtitle: null,
          targetCategory: null, primaryLabel: 'Ver promoción', validFrom: null,
          validTo: null, sortOrder: index + 1, active: true,
        })
      }
    }
    const site = await request('/config')
    // Completa únicamente listas vacías; conserva tarifas y contacto configurados.
    if (!site.comunas?.length || !site.paymentMethods?.length || !site.deliveryWindows?.length) {
      await request('/admin/config', 'PUT', {
        ...site,
        comunas: site.comunas?.length ? site.comunas : config.COMUNAS,
        paymentMethods: site.paymentMethods?.length ? site.paymentMethods : config.PAYMENT_METHODS,
        deliveryWindows: site.deliveryWindows?.length ? site.deliveryWindows : config.DELIVERY_WINDOWS,
      })
    }
    const readyConfig = await request('/config')
    const activeProducts = (await allPages('/admin/products')).filter(p => p.active !== false && p.price > 0)
    if (!activeProducts.length) throw new Error('No hay productos activos con precio positivo.')
    const cheapest = activeProducts.reduce((a, b) => a.price <= b.price ? a : b)
    const existingOrders = await allPages('/admin/orders')
    const results = []
    for (const [index, status] of plan.orders.entries()) {
      const customerName = `${marker} ${status}`
      const existing = existingOrders.find(o => o.customerName === customerName)
      let order = existing
      if (!order) {
        const quantity = index % 2 === 0 ? 1 : Math.max(1, Math.ceil(readyConfig.freeShippingOver / cheapest.price))
        order = await request('/orders', 'POST', {
          customerName, phone: '+56900000000', address: 'Dirección ficticia de prueba 123',
          comuna: readyConfig.comunas[0], deliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          deliveryWindow: readyConfig.deliveryWindows[index % readyConfig.deliveryWindows.length],
          paymentMethod: readyConfig.paymentMethods[index % readyConfig.paymentMethods.length],
          notes: `${marker} Datos ficticios. No despachar ni contactar.`,
          items: [{ productId: cheapest.id, quantity }],
        })
      }
      if (order.status !== status) order = await request(`/admin/orders/${order.id}/status`, 'PATCH', { status })
      const detail = await request(`/admin/orders/${order.id}`)
      const calculated = detail.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      const expectedShipping = calculated >= readyConfig.freeShippingOver ? 0 : readyConfig.shippingFee
      if (detail.items.some(item => item.lineTotal !== item.unitPrice * item.quantity)
        || detail.subtotal !== calculated || detail.shipping !== expectedShipping
        || detail.total !== calculated + expectedShipping || detail.status !== status) {
        throw new Error(`Pedido ${detail.code}: validación de importes/estado fallida.`)
      }
      results.push({ id: detail.id, code: detail.code, status: detail.status, subtotal: detail.subtotal, shipping: detail.shipping, total: detail.total })
    }
    console.log(JSON.stringify({ categories: (await request('/admin/categories')).length,
      products: (await allPages('/admin/products')).length,
      promotions: (await request('/admin/promotions')).length, orders: results }, null, 2))
  } catch (error) {
    console.error(`Carga detenida: ${error.message}. Revisa los registros antes de repetir si hubo un timeout al crear un pedido.`)
    process.exitCode = 1
  }
}
