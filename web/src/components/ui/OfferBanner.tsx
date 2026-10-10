import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap } from 'lucide-react'
import { promos } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'

interface OfferBannerProps {
  onOpenOffer: () => void
}

export default function OfferBanner({ onOpenOffer }: OfferBannerProps) {
  const [visible, setVisible] = useState(true)
  const offers = useApiResource('promotions', fetchPromotions, promos)
  const offer = offers[0]

  return (
    <AnimatePresence>
      {visible && offer && (
        <motion.div
          className="relative z-50 bg-mora-dark"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div className="store-container flex flex-wrap items-center justify-center gap-x-2 gap-y-1 pl-2 pr-7 py-2 text-xs sm:text-sm">
            <Zap size={13} className="fill-white text-white flex-shrink-0" />
            <p className="text-white/90 font-body text-center leading-snug">
              <span className="font-heading font-black text-white">PACK DESTACADO:</span>{' '}
              {offer.title} ·{' '}
              <span className="font-heading font-black text-white tabular-nums">${offer.promoPrice.toLocaleString('es-CL')}</span>
            </p>
            <button
              onClick={onOpenOffer}
              className="flex-shrink-0 min-h-11 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-heading font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Ver oferta →
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white transition-colors min-w-11 min-h-11 inline-flex items-center justify-center"
            aria-label="Cerrar anuncio"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
