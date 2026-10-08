import { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Check, Eye } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import QuickViewModal from './QuickViewModal'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import type { ProductCardProps } from '../../types'

const EASE = [0.25, 1, 0.5, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.44, ease: EASE } },
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setQty(1)
    }, 1800)
  }

  const produceImage = getProduceImage(product)

  return (
    <motion.article
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.97 }}
      animate={{
        y: isHovered ? -8 : 0,
        boxShadow: isHovered
          ? '0 24px 56px -12px rgba(26,26,26,0.2), 0 8px 20px -8px rgba(26,26,26,0.08)'
          : '0 2px 8px rgba(26,26,26,0.04)',
      }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex flex-col bg-white border border-cream-border rounded-2xl overflow-hidden will-change-transform"
      role="group"
      aria-label={product.name}
    >
      {/* ── Visual ── */}
      <div
        className="relative overflow-hidden"
        style={{
          height: '220px',
          background: `linear-gradient(135deg, ${product.gradientFrom} 0%, ${product.gradientTo} 100%)`,
        }}
      >
        {produceImage ? (
          <motion.img
            src={produceImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain p-5 select-none pointer-events-none"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.38, ease: EASE }}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-7xl select-none"
            animate={{ scale: isHovered ? 1.12 : 1 }}
            transition={{ duration: 0.38, ease: EASE }}
            aria-hidden="true"
          >
            {product.emoji}
          </motion.span>
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-cocoa text-sand text-[10px] font-heading font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-sm">
            {product.badge}
          </div>
        )}

        {/* ── Quick-view overlay button (fade+slide up) ── */}
        <motion.div
          className="absolute inset-x-3 bottom-3 z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 16 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <button
            type="button"
            aria-label={`Vista rápida de ${product.name}`}
            className={[
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
              'font-heading font-bold text-xs uppercase tracking-widest text-white',
              'bg-charcoal/80 backdrop-blur-sm hover:bg-charcoal/95',
              'transition-colors duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            ].join(' ')}
            tabIndex={isHovered ? 0 : -1}
            onClick={() => setQuickViewOpen(true)}
          >
            <Eye size={14} aria-hidden="true" />
            Vista Rápida
          </button>
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Price + category */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
            {product.category}
          </span>
          <span className="font-heading font-black text-charcoal text-xl leading-none">
            ${product.price.toLocaleString('es-CL')}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-heading font-black text-charcoal text-lg leading-tight">
          {product.name}
        </h3>

        {/* Unit */}
        <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
          {UNIT_LABELS[product.unit]}
        </p>

        {/* Quantity + Add button */}
        <div className="flex items-center gap-3 mt-auto pt-1">
          {/* Quantity */}
          <div className="flex items-center gap-1 border border-cream-border rounded-xl overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Reducir cantidad"
              className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream-warm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mora"
            >
              <Minus size={13} />
            </button>
            <span
              className="w-7 text-center text-sm font-heading font-bold text-charcoal select-none"
              aria-live="polite"
              aria-label={`Cantidad: ${qty}`}
            >
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Aumentar cantidad"
              className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-cream-warm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mora"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add CTA */}
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.14 }}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
              'font-heading font-bold text-xs uppercase tracking-widest text-white transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mora focus-visible:ring-offset-2',
              added ? 'bg-[#25D366]' : 'bg-charcoal hover:bg-cocoa active:bg-cocoa/90',
            ].join(' ')}
            aria-label={added ? 'Agregado al carrito' : 'Agregar al carrito'}
          >
            {added ? (
              <>
                <Check size={13} aria-hidden="true" />
                Agregado
              </>
            ) : (
              'Agregar'
            )}
          </motion.button>
        </div>
      </div>
      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </motion.article>
  )
}
