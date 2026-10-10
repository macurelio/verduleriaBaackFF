import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import Dialog from './Dialog'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useCartCalculations } from '../../hooks/useCartCalculations'
import { formatPrice } from '../../utils/cart'
import { buildWhatsappText, type DeliveryForm } from '../../utils/checkout'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  form: DeliveryForm
  onConfirmOrder: (paymentMethod: string) => void
}

export default function CheckoutModal({ open, onClose, form, onConfirmOrder }: CheckoutModalProps) {
  const config = useSiteConfig()
  const { cart } = useCart()
  const amounts = useCartCalculations()
  const [paymentMethod, setPaymentMethod] = useState(form.payment || 'Transferencia Bancaria')

  const paymentOptions = [
    { id: 'Transferencia Bancaria', label: 'Transferencia' },
    { id: 'Webpay / Tarjeta', label: 'Webpay / Tarjeta' },
    { id: 'Efectivo al recibir', label: 'Efectivo entrega' },
  ]

  const handleSendWhatsApp = () => {
    onConfirmOrder(paymentMethod)
    const effectiveForm: DeliveryForm = {
      ...form,
      payment: paymentMethod,
    }
    const text = buildWhatsappText(config.brandName, effectiveForm, cart, amounts)
    const url = config.waLink(text)
    window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} titleId="checkout-modal-title">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-emerald-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="font-heading font-black text-base text-stone-900">
                Confirmar Pedido Express
              </h2>
              <p className="text-xs text-stone-500 font-body">
                Revisa los datos antes de continuar a WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar confirmación"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs font-body">
          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="font-heading font-bold text-stone-700 block">
              ¿Cómo prefieres pagar?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentOptions.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2 rounded-xl border text-center font-semibold transition active:scale-95 ${
                    paymentMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Delivery Summary Card */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Destinatario:</span>
              <span className="font-bold text-stone-800">{form.name || 'Cliente'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Teléfono:</span>
              <span className="font-bold text-stone-800">{form.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Dirección:</span>
              <span className="font-bold text-stone-800 text-right truncate max-w-[200px]">
                {form.address || '-'}, {form.comuna}
              </span>
            </div>
            {form.window && (
              <div className="flex justify-between">
                <span className="text-stone-500">Horario entrega:</span>
                <span className="font-bold text-emerald-700">{form.window}</span>
              </div>
            )}
          </div>

          {/* Pricing Totals Breakdown */}
          <div className="pt-2 border-t border-stone-200 space-y-1.5 tabular-nums">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal productos:</span>
              <span>{formatPrice(amounts.subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Despacho:</span>
              <span className={amounts.isFreeShipping ? 'text-emerald-700 font-bold' : ''}>
                {amounts.isFreeShipping ? '¡GRATIS!' : formatPrice(amounts.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-heading font-black text-stone-900 pt-2 border-t border-stone-200">
              <span>Total Final:</span>
              <span className="text-emerald-800">{formatPrice(amounts.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <MessageCircle size={18} />
            <span>Abrir WhatsApp y Enviar Pedido</span>
          </button>
        </div>
      </div>
    </Dialog>
  )
}
