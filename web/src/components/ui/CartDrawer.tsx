import { useRef, useState } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { createOrder, orderLines, type OrderQuote } from '../../api/orders'
import { ApiError } from '../../api/client'
import { formatPrice } from '../../utils/cart'
import { buildWhatsappText, getTodayISO, isValidPhone, type DeliveryForm } from '../../utils/checkout'
import Dialog from './Dialog'
import CartItems from './CartItems'
import DeliveryFields from './DeliveryFields'
import FreeShippingBanner from './FreeShippingBanner'

const emptyForm: DeliveryForm = { name: '', phone: '', address: '', comuna: '', date: '', window: '', payment: '', notes: '' }

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const config = useSiteConfig()
  const { cart, couponCode, setCouponCode, quote, quotePending, quoteError, retryQuote } = useCart()
  const [couponDraft, setCouponDraft] = useState('')
  const needsQuote = cart.some(item => item.source === 'custom-pack') || !!couponCode
  const priceReady = !needsQuote || !!quote
  const amounts = useCartCalculations()
  const [form, setForm] = useState<DeliveryForm>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [orderError, setOrderError] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [savedFingerprint, setSavedFingerprint] = useState('')
  const [savedTotal, setSavedTotal] = useState<number | null>(null)
  const [savedPricing, setSavedPricing] = useState<OrderQuote | null>(null)
  const submitLock = useRef(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const today = getTodayISO()
  const effectiveForm = { ...form, date: form.date || today, window: form.window || config.deliveryWindows[0] || '', payment: form.payment || config.paymentMethods[0] || '' }
  const errors: Partial<Record<keyof DeliveryForm, string>> = {
    name: form.name.trim().length > 1 ? undefined : 'Escribe tu nombre completo.',
    phone: isValidPhone(form.phone) ? undefined : 'Ingresa un celular chileno: +56 9 y 8 dígitos.',
    address: form.address.trim().length > 3 ? undefined : 'Indica calle y número de tu dirección.',
    comuna: config.comunas.includes(form.comuna) ? undefined : 'Selecciona una comuna de cobertura.',
    date: !form.date || (/^\d{4}-\d{2}-\d{2}$/.test(form.date) && form.date >= today) ? undefined : 'Selecciona una fecha desde hoy.',
    window: !form.window || config.deliveryWindows.includes(form.window) ? undefined : 'Selecciona un horario disponible.',
    payment: !form.payment || config.paymentMethods.includes(form.payment) ? undefined : 'Selecciona una forma de pago disponible.',
  }
  const isValid = cart.length > 0 && Object.values(errors).every(error => !error)
  const fingerprint = JSON.stringify({ form: effectiveForm, items: orderLines(cart), couponCode, quote, shipping: amounts.shipping, whatsappNumber: config.whatsappNumber })
  const alreadySaved = savedFingerprint === fingerprint
  const displayedQuote = alreadySaved && savedPricing ? savedPricing : quote

  const handleSubmit = async (withWhatsapp: boolean) => {
    setSubmitted(true)
    if (!priceReady) return
    if (!isValid) {
      const firstInvalid = Object.keys(errors).find(field => errors[field as keyof DeliveryForm])
      if (firstInvalid) {
        const input = contentRef.current?.querySelector<HTMLElement>(`#delivery-${firstInvalid}`)
        input?.focus()
        input?.scrollIntoView({ block: 'center', behavior: 'auto' })
      }
      return
    }
    if (submitLock.current) return
    if (alreadySaved) {
      if (withWhatsapp && whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener noreferrer')
      return
    }
    const fallbackUrl = config.waLink(buildWhatsappText(config.brandName, effectiveForm, cart, amounts))
    submitLock.current = true
    setSubmitting(true)
    setOrderNote(''); setOrderError(''); setWhatsappUrl(''); setSavedTotal(null)
    // Reserva la pestaña durante el clic para evitar el bloqueo de ventanas tras el await.
    const whatsappTab = withWhatsapp ? window.open('about:blank', '_blank') : null
    if (whatsappTab) whatsappTab.opener = null
    try {
      const order = await createOrder({
        customerName: form.name.trim(), phone: form.phone.replace(/[\s.-]/g, ''), address: form.address.trim(), comuna: form.comuna,
        deliveryDate: effectiveForm.date, deliveryWindow: effectiveForm.window, paymentMethod: effectiveForm.payment,
        notes: form.notes.trim(), items: orderLines(cart), couponCode,
      })
      // El mensaje alternativo también debe reflejar el cálculo autorizado por la API.
      let safeUrl = [order.subtotal, order.shipping, order.total].every(value => Number.isSafeInteger(value) && value >= 0)
        ? config.waLink(buildWhatsappText(config.brandName, effectiveForm, cart, order))
        : fallbackUrl
      try {
        const url = new URL(order.whatsappUrl)
        if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].includes(url.hostname)) safeUrl = url.href
      } catch { /* El registro ya existe: el enlace local permite contactar a la tienda. */ }
      setSavedFingerprint(fingerprint)
      setSavedTotal(order.total)
      setSavedPricing(Number.isSafeInteger(order.grossSubtotal) ? order : null)
      setOrderNote(`Pedido ${order.code} registrado por ${formatPrice(order.total)}. Pendiente de confirmación de la tienda.`)
      setWhatsappUrl(safeUrl)
      if (whatsappTab && !whatsappTab.closed) whatsappTab.location.replace(safeUrl)
    } catch (error) {
      whatsappTab?.close()
      setOrderError(error instanceof ApiError && error.status >= 400 && error.status < 500
        ? error.message
        : 'No pudimos confirmar el registro. Consulta con la tienda antes de volver a enviar para evitar un pedido duplicado.')
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return <Dialog open={open} onClose={onClose} titleId="cart-title" drawer>
    <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
      <h2 id="cart-title" className="flex gap-2 items-center font-heading font-bold text-xl"><ShoppingCart size={20} aria-hidden="true" /> Tu pedido</h2>
      <button type="button" onClick={onClose} aria-label="Cerrar carrito" className="quantity-button"><X size={20} /></button>
    </div>
    <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 space-y-5">
      {cart.length === 0 ? <div className="text-center py-16 space-y-4"><span className="text-6xl" aria-hidden="true">🧺</span><p className="font-bold text-lg">Tu canasta está vacía</p><p className="text-muted text-sm">Elige frutas, verduras o packs para empezar.</p><button type="button" onClick={onClose} className="rounded-xl bg-mora text-white px-5 py-3 font-bold">Seguir comprando</button></div> : <>
        <CartItems />
        <form onSubmit={event => { event.preventDefault(); setCouponCode(couponDraft.trim().toUpperCase()) }} className="space-y-2">
          <label htmlFor="order-coupon" className="field-label">Cupón del pedido</label>
          <div className="flex gap-2"><input id="order-coupon" maxLength={40} value={couponDraft} onChange={event => setCouponDraft(event.target.value)} disabled={submitting} className="min-w-0 flex-1 rounded-xl border border-border p-3" /><button type="submit" disabled={submitting || !couponDraft.trim()} className="min-h-11 rounded-xl bg-mora text-white px-3">Aplicar</button></div>
          {couponCode && <button type="button" disabled={submitting} onClick={() => { setCouponCode(''); setCouponDraft('') }} className="min-h-11 text-mora underline">Quitar cupón {couponCode}</button>}
          <p className="text-xs text-muted">Un cupón por pedido, aplicado al subtotal después del descuento del pack.</p>
        </form>
        {quotePending && <p role="status" className="text-muted text-sm">Validando descuentos y total…</p>}
        {quoteError && <p role="alert" className="text-error text-sm">{quoteError} Revisa el cupón o vuelve a intentar la cotización antes de registrar.</p>}
        {quoteError && <button type="button" onClick={retryQuote} className="min-h-11 text-mora underline">Reintentar cotización</button>}
        <FreeShippingBanner />
        <fieldset disabled={submitting} className="min-w-0 disabled:opacity-70">
          <DeliveryFields form={form} onChange={(field, value) => setForm(previous => ({ ...previous, [field]: value }))} errors={errors} submitted={submitted} comunas={config.comunas} windows={config.deliveryWindows} payments={config.paymentMethods} today={today} />
        </fieldset>
        {submitted && !isValid && <p role="alert" className="text-error text-sm">Revisa los campos marcados para continuar.</p>}
        {orderNote && alreadySaved && <p role="status" className="rounded-xl p-3 bg-cream-warm text-mora-dark text-sm font-bold">{orderNote}</p>}
        {orderError && <p role="alert" className="rounded-xl p-3 border border-error text-error text-sm">{orderError}</p>}
        {whatsappUrl && alreadySaved && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block text-mora-dark underline font-bold text-sm">Abrir WhatsApp para conversar con la tienda</a>}
      </>}
    </div>
    {cart.length > 0 && <div className="shrink-0 border-t border-border bg-surface px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 shadow-sm">
      <dl className="text-sm space-y-1 tabular-nums">
        <div className="flex justify-between"><dt className="text-muted">{displayedQuote ? 'Productos antes de descuentos' : 'Subtotal'}</dt><dd>{formatPrice(displayedQuote?.grossSubtotal ?? amounts.subtotal)}</dd></div>
        {displayedQuote && displayedQuote.packDiscount > 0 && <div className="flex justify-between"><dt>Descuento packs</dt><dd>−{formatPrice(displayedQuote.packDiscount)}</dd></div>}
        {displayedQuote && displayedQuote.couponDiscount > 0 && <div className="flex justify-between"><dt>Cupón {displayedQuote.couponCode}</dt><dd>−{formatPrice(displayedQuote.couponDiscount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-muted">Despacho</dt><dd>{(displayedQuote?.shipping ?? amounts.shipping) === 0 ? 'Gratis' : formatPrice(displayedQuote?.shipping ?? amounts.shipping)}</dd></div>
        <div className="flex justify-between font-bold text-lg"><dt>{alreadySaved ? 'Total registrado' : 'Total estimado'}</dt><dd>{formatPrice(alreadySaved && savedTotal !== null ? savedTotal : amounts.total)}</dd></div>
      </dl>
      <button type="button" onClick={() => handleSubmit(true)} disabled={submitting || !priceReady} className="w-full min-h-11 rounded-xl bg-mora hover:bg-mora-dark text-white px-3 py-3 text-sm font-bold disabled:opacity-60">{submitting ? 'Registrando pedido…' : alreadySaved ? 'Abrir WhatsApp' : 'Registrar y abrir WhatsApp'}</button>
      <button type="button" onClick={() => handleSubmit(false)} disabled={submitting || alreadySaved || !priceReady} className="w-full min-h-11 rounded-xl border border-border text-ink text-sm font-bold hover:bg-canvas disabled:opacity-60">{alreadySaved ? 'Pedido registrado' : 'Registrar sin WhatsApp'}</button>
      <p className="text-xs text-muted text-center">No se cobra en línea. En WhatsApp debes enviar el mensaje.</p>
    </div>}
  </Dialog>
}
