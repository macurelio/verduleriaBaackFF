import type { CartItem } from '../types'
import { UNIT_LABELS } from '../config'
import { formatPrice } from './cart'

export function getTodayISO() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export const isValidPhone = (phone: string) => /^(\+?56)?9\d{8}$/.test(phone.replace(/[\s.-]/g, ''))

export interface DeliveryForm {
  name: string; phone: string; address: string; comuna: string
  date: string; window: string; payment: string; notes: string
}

export function buildWhatsappText(brandName: string, form: DeliveryForm, cart: CartItem[], amounts: { subtotal: number; shipping: number; total: number }) {
  const lines = [`¡Hola! Quiero hacer un pedido en ${brandName} 🥬`, '',
    `👤 *Nombre:* ${form.name.trim()}`, `📱 *Teléfono:* ${form.phone.trim()}`,
    `📍 *Dirección:* ${form.address.trim()}, ${form.comuna}`]
  if (form.date) lines.push(`📅 *Fecha solicitada:* ${form.date.split('-').reverse().join('/')}`)
  if (form.window) lines.push(`🕐 *Horario solicitado:* ${form.window}`)
  if (form.payment) lines.push(`💳 *Pago:* ${form.payment}`)
  if (form.notes.trim()) lines.push(`📝 *Notas:* ${form.notes.trim()}`)
  lines.push('', '*🛒 Productos:*')
  cart.forEach(item => {
    lines.push(`• ${item.name} (${UNIT_LABELS[item.unit]}) x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    item.components?.forEach(component => lines.push(`  ${component.quantity * item.quantity} × ${component.product.name} (${UNIT_LABELS[component.product.unit]})`))
  })
  lines.push('', `Subtotal: ${formatPrice(amounts.subtotal)}`,
    amounts.shipping === 0 ? 'Despacho: gratis' : `Despacho: ${formatPrice(amounts.shipping)}`,
    `*TOTAL: ${formatPrice(amounts.total)}*`, 'Pedido pendiente de confirmación de la tienda.')
  return lines.join('\n')
}
