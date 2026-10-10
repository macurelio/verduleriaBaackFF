import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Truck, Check } from 'lucide-react'

interface OfferBannerProps {
  onOpenOffer?: () => void
  onApplyCoupon?: (code: string) => void
}

export default function OfferBanner({ onOpenOffer, onApplyCoupon }: OfferBannerProps) {
  const [visible, setVisible] = useState(true)
  const [copied, setCopied] = useState(false)
  const couponCode = 'FRESCO10'

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText(couponCode)
    setCopied(true)
    if (onApplyCoupon) {
      onApplyCoupon(couponCode)
    }
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="relative z-50 bg-emerald-950 text-emerald-200 text-xs border-b border-emerald-900/60"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 pr-10">
            {/* Left promo info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-heading font-bold text-[10px] sm:text-[11px] border border-emerald-500/30 uppercase tracking-wider">
                <Sparkles size={11} className="text-emerald-400" /> Oferta Especial
              </span>
              <span className="hidden md:inline text-emerald-600">•</span>
              <p className="text-center sm:text-left text-[11px] sm:text-xs text-emerald-100">
                10% DCTO en tu compra con el cupón{' '}
                <button
                  type="button"
                  onClick={handleCopyCoupon}
                  className="font-bold text-white underline decoration-emerald-400 underline-offset-2 hover:text-emerald-300 transition-colors"
                  title="Copiar cupón"
                >
                  {couponCode}
                </button>
              </p>
              {onOpenOffer && (
                <button
                  type="button"
                  onClick={onOpenOffer}
                  className="hidden lg:inline-flex items-center text-[11px] font-semibold text-emerald-300 hover:text-white underline underline-offset-2 ml-1"
                >
                  Ver packs en oferta →
                </button>
              )}
            </div>

            {/* Right shipping & coupon action */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                <Truck size={13} className="text-emerald-400" />
                <span>Envíos gratis sobre $20.000</span>
              </span>
              <span className="hidden sm:inline text-emerald-700">•</span>
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-white font-semibold underline underline-offset-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">¡Copiado!</span>
                  </>
                ) : (
                  <span>Copiar Cupón</span>
                )}
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-white transition-colors w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-emerald-900/50"
            aria-label="Cerrar anuncio"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
