import { useState } from 'react'
import { X, Sparkles, Tag, Check, MessageCircle, Package } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/cart'
import Dialog from './Dialog'

interface OfferModalProps {
  open: boolean
  onClose: () => void
  onBuildPack?: () => void
}

export default function OfferModal({ open, onClose, onBuildPack }: OfferModalProps) {
  const { cart, setCouponCode, couponCode: appliedCoupon } = useCart()
  const { waLink } = useSiteConfig()
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const couponCode = 'FRESCO10'

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isUnlocked = cartSubtotal >= 20000
  const needed = Math.max(0, 20000 - cartSubtotal)

  const handleApplyCoupon = () => {
    navigator.clipboard?.writeText(couponCode)
    setCouponCode(couponCode)
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  return (
    <Dialog open={open} onClose={onClose} titleId="offer-modal-title">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/60 dark:to-teal-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl shadow-md ${isUnlocked ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}`}>
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="offer-modal-title" className="font-heading font-black text-lg sm:text-xl text-stone-900 dark:text-white">
                  {isUnlocked ? '¡Cupón 10% DCTO Desbloqueado! 🎉' : 'Cupón de descuento'}
                </h2>
                <span className={`text-[10px] font-heading font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isUnlocked ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {isUnlocked ? '> $20.000' : 'Meta $20.000'}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-body mt-0.5">
                {isUnlocked
                  ? `Tu canasta superó los $20.000 (llevas ${formatPrice(cartSubtotal)}). Tienes un 10% de descuento adicional garantizado con cupón.`
                  : `Arma tu pack y supera los $20.000 para desbloquear 10% adicional con cupón.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de ofertas"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl hover:bg-white/80 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Coupon Callout Banner inside Dialog */}
          <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
            isUnlocked
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <Tag size={20} className={isUnlocked ? 'text-amber-600 dark:text-amber-400 flex-shrink-0' : 'text-emerald-600 dark:text-emerald-400 flex-shrink-0'} />
              <div>
                <p className="text-xs font-heading font-bold text-stone-900 dark:text-zinc-100">
                  {isUnlocked
                    ? '¡Tu pedido califica! Aplica tu 10% de descuento extra:'
                    : `Desbloquea 10% extra sumando ${formatPrice(needed)} más:`}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                  Código <strong className="text-emerald-700 dark:text-emerald-300 font-mono font-black">{couponCode}</strong>{' '}
                  {isUnlocked ? 'listo para aplicarse al total de tu canasta.' : `válido en pedidos superiores a $20.000.`}
                </p>
              </div>
            </div>
            {isUnlocked ? (
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-black transition active:scale-95 shadow-md whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCoupon || appliedCoupon === couponCode ? (
                  <>
                    <Check size={14} />
                    <span>¡Aplicado al carrito!</span>
                  </>
                ) : (
                  <span>Aplicar Cupón FRESCO10</span>
                )}
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/60 dark:bg-zinc-800 px-3 py-1.5 rounded-lg whitespace-nowrap">
                Faltan {formatPrice(needed)}
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-zinc-800/50 p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-stone-600 dark:text-zinc-300 font-body">
                Elige 4 o más productos distintos y obtén <strong>10% a 15% de descuento</strong> automático en tu pack.
              </p>
            </div>
            {onBuildPack && (
              <button
                type="button"
                onClick={onBuildPack}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-heading font-black transition active:scale-95 shadow-md whitespace-nowrap"
              >
                Armar mi pack
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={waLink('¡Hola! Tengo consultas sobre los packs en oferta especial 🥬')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-600 dark:text-zinc-400 hover:text-emerald-600 flex items-center gap-1.5 font-medium"
          >
            <MessageCircle size={15} className="text-[#25D366]" />
            <span>Consultar disponibilidad por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-zinc-800 hover:bg-stone-800 text-white font-heading font-bold text-xs uppercase tracking-wider transition active:scale-95"
          >
            Listo / Ver Carrito
          </button>
        </div>
      </div>
    </Dialog>
  )
}
