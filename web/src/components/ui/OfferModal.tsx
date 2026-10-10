import { X, ShoppingBag } from 'lucide-react'
import { promos } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { formatPrice } from '../../utils/cart'
import Dialog from './Dialog'

export default function OfferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const offers = useApiResource('promotions', fetchPromotions, promos)
  const { waLink } = useSiteConfig()
  const offer = offers[0]
  return <Dialog open={open && Boolean(offer)} onClose={onClose} titleId="offer-title">
    {offer && <div className="p-5 sm:p-7">
      <div className="flex justify-between items-center"><ShoppingBag size={28} className="text-mora" aria-hidden="true" /><button type="button" onClick={onClose} aria-label="Cerrar oferta" className="quantity-button"><X size={20} /></button></div>
      <p className="text-muted text-sm mt-4">Packs y promociones</p>
      <h2 id="offer-title" className="font-heading font-bold text-3xl mt-2">{offer.title}</h2>
      <p className="text-muted mt-3 text-sm">{offer.description}</p>
      <ul className="mt-5 space-y-2 text-sm list-disc pl-5">{offer.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
      <div className="mt-6 flex items-baseline flex-wrap gap-3 tabular-nums"><span className="font-bold text-mora-dark text-3xl">{formatPrice(offer.promoPrice)}</span>{offer.originalPrice > offer.promoPrice && <del className="text-muted text-sm">{formatPrice(offer.originalPrice)}</del>}</div>
      <a href={waLink(`¡Hola! Quiero consultar por ${offer.title} a ${formatPrice(offer.promoPrice)}.`)} target="_blank" rel="noopener noreferrer" className="block mt-6 bg-mora hover:bg-mora-dark rounded-xl py-3 text-center font-bold text-white">Consultar por WhatsApp</a>
      <a href="#promociones" onClick={onClose} className="block mt-3 py-3 text-center text-mora-dark text-sm underline">Ver todos los packs</a>
    </div>}
  </Dialog>
}
