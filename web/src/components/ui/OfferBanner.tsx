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
          className="relative z-50 bg-gradient-to-r from-[#14532d] via-[#166534] to-[#14532d]"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <div className="flex items-center justify-center gap-2.5 px-10 py-2.5 text-sm">
            <Zap size={13} className="fill-white text-white flex-shrink-0" />
            <p className="text-white/90 font-body text-center leading-snug">
              <span className="font-heading font-black text-white">PACK DESTACADO:</span>{' '}
              {offer.title} ·{' '}
              <span className="font-heading font-black text-white">${offer.promoPrice.toLocaleString('es-CL')}</span>
            </p>
            <button
              onClick={onOpenOffer}
              className="flex-shrink-0 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-heading font-black text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap"
            >
              Ver oferta →
            </button>
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
            aria-label="Cerrar anuncio"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
