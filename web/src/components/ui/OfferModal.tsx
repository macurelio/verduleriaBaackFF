import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Zap, ShoppingBag } from 'lucide-react'
import { waLink } from '../../config'
import { getProduceImage } from '../../produce'

const OFFER = {
  title: 'Canasta Semanal',
  description:
    'La compra básica del hogar a precio especial: verduras frescas para toda la semana, entregadas a domicilio.',
  originalPrice: 17490,
  promoPrice: 14990,
  savings: 2500,
  products: [
    { name: '2× Papas (2 kg)', originalUnit: 2580, promoUnit: 2090, emoji: '🥔' },
    { name: '1 kg Tomate + 1 kg Zanahoria', originalUnit: 4080, promoUnit: 3490, emoji: '🍅' },
    { name: 'Lechuga + Rúcula', originalUnit: 3080, promoUnit: 2590, emoji: '🥬' },
    { name: '2× Palta + 1 kg Limón', originalUnit: 4770, promoUnit: 4190, emoji: '🥑' },
  ],
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatPrice(n: number) {
  return `$${n.toLocaleString('es-CL')}`
}

interface OfferModalProps {
  open: boolean
  onClose: () => void
}

export default function OfferModal({ open, onClose }: OfferModalProps) {
  const [seconds, setSeconds] = useState(47 * 60)

  // Countdown timer
  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [open])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  // Body scroll lock + Escape key
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  const waUrl = waLink(
    `¡Hola! Quiero aprovechar la oferta de la ${OFFER.title} a ${formatPrice(OFFER.promoPrice)} 🥬🎉`,
  )

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-modal-title"
            className="relative z-10 w-full max-w-lg bg-charcoal rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 28 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            {/* ── Header ─────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#14532d] to-[#052e16] px-6 pt-6 pb-10 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
              <div className="absolute top-6 right-14 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Cerrar oferta"
              >
                <X size={20} />
              </button>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="bg-white/20 text-white text-[10px] font-heading font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Zap size={10} className="fill-white" />
                  Flash Sale
                </span>
                <span className="bg-white/10 text-white/70 text-[10px] font-heading uppercase tracking-wide px-2.5 py-1 rounded-full">
                  Solo por hoy
                </span>
              </div>

              <h2
                id="offer-modal-title"
                className="font-heading font-black text-white text-2xl leading-tight mb-1"
              >
                {OFFER.title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">{OFFER.description}</p>

              {/* Countdown */}
              <div className="mt-4 flex items-center gap-2">
                <Clock size={14} className="text-white/50" />
                <span className="text-white/50 text-xs font-body">Oferta termina en:</span>
                <span className="font-heading font-black text-white text-sm tracking-widest tabular-nums">
                  {pad(mins)}:{pad(secs)}
                </span>
              </div>
            </div>

            {/* ── Product list ────────────────────────────── */}
            <div className="px-5 -mt-5 space-y-2.5">
              {OFFER.products.map((p, i) => (
                <motion.div
                  key={p.name}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.07 }}
                >
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-white/10 flex items-center justify-center text-xl">
                    {getProduceImage({ emoji: p.emoji }) ? (
                      <img
                        src={getProduceImage({ emoji: p.emoji })}
                        alt=""
                        className="w-7 h-7 object-contain"
                        draggable={false}
                      />
                    ) : (
                      <span aria-hidden="true">{p.emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sand text-sm font-heading font-bold leading-tight truncate">
                      {p.name}
                    </p>
                    <span className="text-sand/40 text-xs line-through">
                      {formatPrice(p.originalUnit)}
                    </span>
                  </div>
                  <span className="text-cream-warm font-heading font-black text-sm flex-shrink-0">
                    {formatPrice(p.promoUnit)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ── Footer ──────────────────────────────────── */}
            <div className="px-5 pt-4 pb-6">
              {/* Price summary */}
              <div className="flex items-center justify-between bg-white/5 border border-sand/20 rounded-xl px-4 py-3 mb-4">
                <div>
                  <p className="text-sand/40 text-[10px] font-body uppercase tracking-wide">Precio normal</p>
                  <p className="text-sand/50 text-sm line-through font-heading">
                    {formatPrice(OFFER.originalPrice)}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="bg-cocoa/60 text-cream-warm text-[10px] font-heading font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Ahorrás
                  </span>
                  <span className="text-cream-warm font-heading font-black text-sm">
                    {formatPrice(OFFER.savings)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sand/40 text-[10px] font-body uppercase tracking-wide">Precio oferta</p>
                  <p className="text-white font-heading font-black text-2xl leading-none">
                    {formatPrice(OFFER.promoPrice)}
                  </p>
                </div>
              </div>

              {/* CTA WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-heading font-black text-sm tracking-wide transition-all duration-200"
              >
                <ShoppingBag size={16} />
                ¡Quiero este combo ahora!
              </a>

              <p className="text-center text-sand/30 text-[10px] mt-2.5 font-body">
                * Stock limitado. Aplica solo para pedidos realizados hoy.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
