import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Check, ShoppingCart, MessageCircle } from 'lucide-react'
import { promos, type Promo } from '../../data/promos'
import { fetchPromotions } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useCart } from '../../context/CartContext'
import { getPromoImage } from '../../produce'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/cart'

const EASE = [0.25, 1, 0.5, 1] as const

const promoToProduct = (promo: Promo): Product => ({
  id: promo.id,
  name: promo.title,
  category: 'Packs',
  description: promo.description,
  price: promo.promoPrice,
  unit: 'pack',
  emoji: promo.emoji,
  badge: promo.badge,
  gradientFrom: promo.gradientFrom,
  gradientTo: promo.gradientTo,
  source: 'promotion',
})

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay: i * 0.08 },
  }),
}

function PromoCard({ promo, index }: { promo: Promo; index: number }) {
  const { waLink } = useSiteConfig()

  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  const waUrl = waLink(
    `¡Hola! Quiero consultar por el pack "${promo.title}" a ${formatPrice(promo.promoPrice)} 🥬`,
  )

  const handleAdd = () => {
    addToCart(promoToProduct(promo))
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ y: hovered ? -6 : 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="relative flex flex-col rounded-2xl overflow-hidden bg-surface border border-border shadow-xl"
    >
      {/* Badge */}
      <span className="absolute top-3 left-3 z-20 bg-sand text-charcoal text-[10px] font-heading font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
        {promo.badge}
      </span>

      {/* Tag pill top-right */}
      <span className="absolute top-3 right-3 z-20 bg-charcoal text-sand text-[10px] font-heading font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
        {promo.tag}
      </span>

      {/* Visual */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${promo.gradientFrom}, ${promo.gradientTo})`,
        }}
      >
        {getPromoImage(promo) ? (
          <img
            src={getPromoImage(promo)}
            alt=""
            className="w-32 h-32 object-contain drop-shadow-lg"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <span className="text-7xl drop-shadow-lg" aria-hidden="true">
            {promo.emoji}
          </span>
        )}
        <div className="absolute bottom-3 left-4">
          <span className="text-sand text-xs font-heading font-bold">
            {promo.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-heading font-black text-ink text-xl leading-tight">
          {promo.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed">{promo.description}</p>

        {/* Items list */}
        <ul className="space-y-1.5 mt-1">
          {promo.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-muted text-xs">
              <Check size={12} className="text-ink mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="flex items-end gap-3 mt-auto pt-4 border-t border-border">
          <div>
            <p className="text-muted text-xs line-through tabular-nums">
              {formatPrice(promo.originalPrice)}
            </p>
            <p className="text-mora-dark font-heading font-black text-2xl tabular-nums leading-none">
              {formatPrice(promo.promoPrice)}
            </p>
          </div>
          <span className="mb-0.5 flex items-center gap-1 text-mora-dark text-xs font-heading font-bold">
            <Tag size={11} />
            {formatPrice(promo.savings)} off
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={handleAdd}
            className={[
              'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
              added ? 'bg-mora' : 'bg-mora hover:bg-mora-dark',
              'active:scale-[0.98] text-white font-heading font-black text-sm uppercase tracking-wide',
              'transition-all duration-150 shadow-lg',
            ].join(' ')}
          >
            {added ? (
              <>
                <Check size={16} />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Agregar al carrito
              </>
            )}
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-muted hover:text-mora-dark text-xs font-heading font-bold transition-colors"
          >
            <MessageCircle size={13} />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  )
}

export default function PromoSection() {
  const promoList = useApiResource('promotions', fetchPromotions, promos)

  return (
    <section
      id="promociones"
      aria-label="Promociones y packs más vendidos"
      className="py-10 sm:py-12 bg-canvas"
    >
      <div className="store-container">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={headerVariants}
        >
          <span className="inline-flex items-center gap-1.5 bg-cream-warm text-muted text-xs font-heading font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            <Tag size={12} />
            Packs
          </span>
          <h2 className="font-heading font-black text-ink text-3xl sm:text-4xl leading-tight">
            Packs armados
          </h2>
          <p className="mt-4 text-muted font-body text-base max-w-md mx-auto">
            Combos para ahorrar tiempo y dinero. Agrega el tuyo, completa tus datos
            y te lo llevamos a domicilio.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {promoList.map((promo, i) => (
            <PromoCard key={promo.id} promo={promo} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
