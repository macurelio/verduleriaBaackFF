import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { createOrder } from '../../api/orders'
import { getProduceImage } from '../../produce'
import {
  COMUNAS,
  DELIVERY_WINDOWS,
  DELIVERY_ZONE,
  FREE_SHIPPING_OVER,
  PAYMENT_METHODS,
  SHIPPING_FEE,
  UNIT_LABELS,
  waLink,
} from '../../config'

const EASE = [0.25, 1, 0.5, 1] as const

const formatPrice = (n: number) => `$${n.toLocaleString('es-CL')}`

const todayISO = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
})()

const isValidPhone = (raw: string) => {
  const digits = raw.replace(/[\s.-]/g, '')
  return /^(\+?56)?9\d{8}$/.test(digits)
}

const inputClass = (invalid: boolean) =>
  [
    'w-full px-3 py-2.5 rounded-xl bg-white/10 text-sand placeholder:text-sand/40 text-sm',
    'border focus:outline-none transition-colors',
    invalid ? 'border-red-400/70' : 'border-white/10 focus:border-mora',
  ].join(' ')

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, incrementQuantity, decrementQuantity, removeItem, getCartTotal } = useCart()
  const total = getCartTotal()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [comuna, setComuna] = useState('')
  const [date, setDate] = useState('')
  const [window_, setWindow] = useState('')
  const [payment, setPayment] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [orderError, setOrderError] = useState('')

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const shipping = total >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE
  const grandTotal = total + shipping

  const fields = {
    name: name.trim().length > 1,
    phone: isValidPhone(phone),
    address: address.trim().length > 3,
    comuna: comuna.length > 0,
    date: date.length > 0 && date >= todayISO,
    window: window_.length > 0,
    payment: payment.length > 0,
    cart: cart.length > 0,
  }
  const isValid = Object.values(fields).every(Boolean)

  const buildWhatsappText = () => {
    const lines: string[] = ['¡Hola! Quiero hacer un pedido de verduras 🥬', '']
    lines.push(`👤 *Nombre:* ${name.trim()}`)
    lines.push(`📱 *Teléfono:* ${phone.trim()}`)
    lines.push(`📍 *Dirección:* ${address.trim()}, ${comuna}`)
    lines.push(`📅 *Entrega:* ${date.split('-').reverse().join('/')}`)
    lines.push(`🕐 *Horario:* ${window_}`)
    lines.push(`💳 *Pago:* ${payment}`)
    if (notes.trim()) lines.push(`📝 *Notas:* ${notes.trim()}`)
    lines.push('')
    lines.push('*🛒 Productos:*')
    cart.forEach((item) => {
      lines.push(
        `• ${item.name} (${UNIT_LABELS[item.unit]}) x${item.quantity} — ${formatPrice(
          item.price * item.quantity,
        )}`,
      )
    })
    lines.push('')
    lines.push(`Subtotal: ${formatPrice(total)}`)
    lines.push(
      shipping === 0
        ? 'Envío: gratis 🎉'
        : `Envío (${DELIVERY_ZONE}): ${formatPrice(shipping)}`,
    )
    lines.push(`*TOTAL: ${formatPrice(grandTotal)}*`)
    return lines.join('\n')
  }

  const handleSubmit = async () => {
    setSubmitted(true)
    if (!isValid || submitting) return

    const fallbackUrl = waLink(buildWhatsappText())

    // Los packs/combos no son productos del backend → van directo por WhatsApp.
    const hasPack = cart.some((i) => i.id.startsWith('promo-') || i.id.startsWith('combo-'))
    if (hasPack) {
      window.open(fallbackUrl, '_blank', 'noopener noreferrer')
      return
    }

    setSubmitting(true)
    setOrderNote('')
    setOrderError('')
    try {
      const order = await createOrder({
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        comuna,
        deliveryDate: date,
        deliveryWindow: window_,
        paymentMethod: payment,
        notes: notes.trim(),
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      })
      setOrderNote(`Pedido ${order.code} registrado. Confírmalo en el WhatsApp que se abrió 😉`)
      window.open(order.whatsappUrl, '_blank', 'noopener noreferrer')
    } catch {
      setOrderError(
        'No pudimos registrar el pedido. Se abre WhatsApp con tu pedido igualmente.',
      )
      window.open(fallbackUrl, '_blank', 'noopener noreferrer')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
          />

          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            className="fixed top-0 right-0 z-[160] h-full w-full max-w-sm bg-charcoal shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32, mass: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-sand" />
                <h2 className="font-heading font-black text-sand text-lg uppercase tracking-wide">
                  Tu pedido
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="p-1.5 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 text-center py-20"
                >
                  <div className="text-6xl">🧺</div>
                  <p className="text-sand/50 font-body text-sm">
                    Tu canasta está vacía.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item) => (
                    <motion.div
                      key={item.cartItemId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="flex gap-3 bg-white/5 rounded-xl p-3 items-start"
                    >
                      <div
                        className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-3xl"
                        style={{
                          background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})`,
                        }}
                      >
                        {getProduceImage(item) ? (
                          <img
                            src={getProduceImage(item)}
                            alt=""
                            className="w-11 h-11 object-contain"
                            draggable={false}
                          />
                        ) : (
                          <span aria-hidden="true">{item.emoji}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sand font-heading font-bold text-sm leading-tight truncate">
                          {item.name}
                        </p>
                        <p className="text-sand/50 text-xs mt-0.5">
                          {UNIT_LABELS[item.unit]}
                        </p>
                        <p className="text-sand font-bold text-sm mt-1">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => decrementQuantity(item.cartItemId)}
                            aria-label="Reducir cantidad"
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-sand transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sand font-bold text-sm w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => incrementQuantity(item.cartItemId)}
                            aria-label="Aumentar cantidad"
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-sand transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <p className="text-sand font-black text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          aria-label={`Eliminar ${item.name}`}
                          className="p-1 rounded-md text-sand/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Checkout */}
            {cart.length > 0 && (
              <motion.div
                className="border-t border-white/10 px-5 py-4 space-y-3 overflow-y-auto max-h-[60%]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sand/70 font-body text-sm uppercase tracking-wide">
                    Total
                  </span>
                  <span className="text-sand font-heading font-black text-2xl">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                <p className="text-sand/40 text-xs -mt-1">
                  {shipping === 0
                    ? `Envío gratis por compra sobre ${formatPrice(FREE_SHIPPING_OVER)}`
                    : `Envío ${formatPrice(SHIPPING_FEE)} · gratis sobre ${formatPrice(FREE_SHIPPING_OVER)}`}
                </p>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass(submitted && !fields.name)}
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono (+56 9XXXXXXXX) *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass(submitted && !fields.phone)}
                  />
                  <input
                    type="text"
                    placeholder="Dirección y número *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClass(submitted && !fields.address)}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={comuna}
                      onChange={(e) => setComuna(e.target.value)}
                      aria-label="Comuna"
                      className={inputClass(submitted && !fields.comuna)}
                    >
                      <option value="">Comuna *</option>
                      {COMUNAS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={date}
                      min={todayISO}
                      onChange={(e) => setDate(e.target.value)}
                      aria-label="Fecha de entrega"
                      className={inputClass(submitted && !fields.date)}
                    />
                  </div>

                  <select
                    value={window_}
                    onChange={(e) => setWindow(e.target.value)}
                    aria-label="Horario de entrega"
                    className={inputClass(submitted && !fields.window)}
                  >
                    <option value="">Horario de entrega *</option>
                    {DELIVERY_WINDOWS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>

                  <div
                    role="radiogroup"
                    aria-label="Forma de pago"
                    className="flex gap-2"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={payment === m}
                        onClick={() => setPayment(m)}
                        className={[
                          'flex-1 py-2 rounded-xl text-xs font-heading font-bold border transition-colors',
                          payment === m
                            ? 'bg-mora border-mora text-white'
                            : 'border-white/10 text-sand/70 hover:text-sand hover:bg-white/5',
                        ].join(' ')}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nota para el repartidor (opcional)"
                    rows={2}
                    className={inputClass(false) + ' resize-none'}
                  />
                </div>

                {submitted && !isValid && (
                  <p className="text-red-400 text-xs font-body">
                    Completa los campos marcados para enviar tu pedido.
                  </p>
                )}

                {orderNote && (
                  <p className="text-[#25D366] text-xs text-center font-body font-bold">
                    {orderNote}
                  </p>
                )}
                {orderError && (
                  <p className="text-amber-400 text-xs text-center font-body">
                    {orderError}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={[
                    'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
                    'bg-[#25D366] hover:bg-[#20BD5C] active:scale-[0.98]',
                    'text-white font-heading font-black text-sm uppercase tracking-wide',
                    'transition-all duration-150 shadow-lg shadow-[#25D366]/20',
                    submitting ? 'opacity-70 cursor-wait' : '',
                  ].join(' ')}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {submitting ? 'Registrando pedido…' : 'Enviar pedido por WhatsApp'}
                </button>
                <p className="text-sand/40 text-xs text-center font-body">
                  Pagas al recibir: efectivo, transferencia o contra entrega.
                </p>
              </motion.div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
