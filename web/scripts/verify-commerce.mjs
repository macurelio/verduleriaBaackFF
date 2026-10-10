import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

// Usa el compilador incluido con Vite; no instala un framework de pruebas.
const bundle = await build({
  stdin: { contents: "export * from './src/utils/cart'; export * from './src/utils/checkout'; export { waLink } from './src/config'", resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'esm',
})
const { calculateCart, formatPrice, buildWhatsappText, isValidPhone, waLink } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
const nativeSource = await readFile(new URL('../../src/utils/cart.js', import.meta.url), 'utf8')
const native = await import(`data:text/javascript;base64,${Buffer.from(nativeSource).toString('base64')}`)
const line = (price, quantity = 1) => ({ price, quantity })
for (const [cart, fee, threshold, expectedShipping, expectedTotal] of [
  [[], 2500, 20000, 0, 0],
  [[line(19999)], 2500, 20000, 2500, 22499],
  [[line(20000)], 2500, 20000, 0, 20000],
  [[line(20001)], 2500, 20000, 0, 20001],
  [[line(1500, 3), line(2100, 2)], 2500, 20000, 2500, 11200],
  [[line(1500)], 3000, 1000, 0, 1500],
  [[line(1500)], 3000, 0, 0, 1500],
  [[line(200, 99)], 0, 25000, 0, 19800],
]) {
  const amounts = calculateCart(cart, fee, threshold)
  assert.equal(amounts.shipping, expectedShipping)
  assert.equal(amounts.total, expectedTotal)
  assert.ok(amounts.progress >= 0 && amounts.progress <= 100)
  assert.deepEqual(amounts, native.calculateCart(cart, fee, threshold))
}
assert.equal(calculateCart([], 2500, 20000).isFreeShipping, false)
assert.equal(calculateCart([line(19999)], 2500, 20000).amountNeeded, 1)
assert.equal(calculateCart([line(20000)], 2500, 20000).amountNeeded, 0)
assert.equal(formatPrice(20000), '$20.000')
for (const phone of ['+56 9 1234 5678', '912345678', '56912345678', '9.1234.5678']) assert.equal(isValidPhone(phone), true)
for (const phone of ['', '812345678', '91234567', '+1 912345678']) assert.equal(isValidPhone(phone), false)
const form = { name: 'José Muñoz', phone: '+56 9 1234 5678', address: 'Los Álamos 123', comuna: 'Ñuñoa', date: '2026-10-12', window: 'Tarde', payment: 'Transferencia', notes: 'Timbre: 🥬 & ñ' }
const cart = [{ id: 'p1', name: 'Limón', price: 1500, quantity: 2, unit: 'kilo' }]
const message = buildWhatsappText('Mora Verduras', form, cart, calculateCart(cart, 2500, 20000))
assert.ok(message.includes('• Limón (por kg) x2 — $3.000'))
assert.ok(message.includes('*TOTAL: $5.500*'))
assert.ok(message.includes('12/10/2026'))
const url = new URL(waLink(message))
assert.equal(url.hostname, 'wa.me')
assert.equal(url.pathname, '/56995778113')
assert.equal(url.searchParams.get('text'), message)
console.log('OK: cálculos web/Expo, límites de despacho, configuración, teléfono y mensaje WhatsApp con ñ/emojis.')
