import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ShoppingBag } from 'lucide-react'
import { promos } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useSiteConfig } from '../../hooks/useSiteConfig'

interface OfferModalProps {
  open: boolean
  onClose: () => void
}

export default function OfferModal({ open, onClose }: OfferModalProps) {
  const offers = useApiResource('promotions', fetchPromotions, promos)
  const { waLink } = useSiteConfig()
  const offer = offers[0]

  useEffect(() => {
    if (!open || !offer) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, offer, onClose])

  if (!open || !offer) return null
  const price = (value: number) => `$${value.toLocaleString('es-CL')}`
  const savings = Math.max(0, offer.originalPrice - offer.promoPrice)

  return createPortal(
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="offer-title" className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-charcoal border border-white/10 p-6 shadow-2xl">
        <button onClick={onClose} aria-label="Cerrar oferta" className="absolute right-4 top-4 text-sand/70 p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
        <ShoppingBag size={32} className="text-mora mb-4" aria-hidden="true" />
        <p className="text-sand/60 text-xs uppercase tracking-wide mb-2">Packs y promociones</p>
        <h2 id="offer-title" className="font-heading font-black text-sand text-3xl pr-8">{offer.title}</h2>
        <p className="text-sand/70 mt-3 text-sm">{offer.description}</p>
        <ul className="mt-5 space-y-2 text-sm text-sand/80">{offer.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        <div className="mt-6 flex items-baseline gap-3">
          <span className="font-heading font-black text-sand text-3xl">{price(offer.promoPrice)}</span>
          {savings > 0 && <del className="text-sand/40 text-sm">{price(offer.originalPrice)}</del>}
        </div>
        {savings > 0 && <p className="text-mora font-bold text-sm mt-2">Ahorras {price(savings)}</p>}
        <a href={waLink(`¡Hola! Quiero consultar por ${offer.title} a ${price(offer.promoPrice)}.`)} target="_blank" rel="noopener noreferrer" className="block mt-6 bg-mora hover:bg-mora/80 rounded-xl py-3 text-center font-heading font-bold text-white">Consultar por WhatsApp</a>
        <a href="#promociones" onClick={onClose} className="block mt-3 text-center text-sand/70 text-sm underline">Ver todos los packs</a>
      </section>
    </div>, document.body,
  )
}
