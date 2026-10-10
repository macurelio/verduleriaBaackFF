import { useState } from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Eye } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import QuickViewModal from './QuickViewModal'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import type { ProductCardProps } from '../../types'
import { formatPrice } from '../../utils/cart'

const EASE = [0.25, 1, 0.5, 1] as const

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, incrementQuantity, decrementQuantity, cart } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const cartItem = cart.find((i) => i.cartItemId === product.id)
  const qty = cartItem ? cartItem.quantity : 0

  const handleIncrement = () => {
    if (cartItem) {
      incrementQuantity(cartItem.cartItemId)
    } else {
      addToCart(product)
    }
  }

  const handleDecrement = () => {
    if (!cartItem) return
    decrementQuantity(cartItem.cartItemId)
  }

  const produceImage = getProduceImage(product)

  return (
    <motion.article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.97 }}
      animate={{
        y: isHovered ? -4 : 0,
        boxShadow: isHovered
          ? '0 24px 56px -12px rgba(26,26,26,0.2), 0 8px 20px -8px rgba(26,26,26,0.08)'
          : '0 2px 8px rgba(26,26,26,0.04)',
      }}
      transition={{ duration: 0.35, ease: EASE }}
      className="min-w-0 h-full flex flex-col bg-surface border border-border rounded-2xl overflow-hidden"
      role="group"
      aria-label={product.name}
    >
      <div
        className="relative shrink-0 overflow-hidden aspect-square"
        style={{
          background: `linear-gradient(135deg, ${product.gradientFrom} 0%, ${product.gradientTo} 100%)`,
        }}
      >
        {produceImage ? (
          <motion.img
            src={produceImage}
            alt=""
            className="absolute inset-0 w-full h-full object-contain p-3 select-none pointer-events-none"
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

        {product.badge && (
          <div className="absolute top-3 left-3 bg-cocoa text-sand text-[10px] font-heading font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-sm">
            {product.badge}
          </div>
        )}

        <motion.div
          className="absolute inset-x-3 bottom-3 z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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
            onClick={() => setQuickViewOpen(true)}
          >
            <Eye size={14} aria-hidden="true" />
            Vista Rápida
          </button>
        </motion.div>
      </div>

      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-2">
        <div className="flex flex-col items-start gap-1.5">
          <span className="text-[10px] font-heading font-bold text-muted uppercase tracking-wide">
            {product.category}
          </span>
          <span className="font-heading font-black text-mora-dark text-lg leading-none whitespace-nowrap tabular-nums">
            {formatPrice(product.price)}
          </span>
        </div>

        <h3 className="min-h-[2.5em] line-clamp-2 font-heading font-black text-charcoal text-sm sm:text-base leading-tight" title={product.name}>
          {product.name}
        </h3>

        <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
          {UNIT_LABELS[product.unit]}
        </p>

        <div className="flex items-center gap-3 mt-auto pt-1">
          <div className="flex items-center gap-1 border border-cream-border rounded-xl overflow-hidden">
            <button
              onClick={handleDecrement}
              aria-label="Reducir cantidad"
              className="quantity-button border-0 rounded-none"
              disabled={qty === 0}
            >
              <Minus size={13} />
            </button>
            <span
              className="w-7 text-center text-sm font-heading font-bold text-charcoal select-none tabular-nums"
              aria-live="polite"
              aria-label={`Cantidad: ${qty}`}
            >
              {qty}
            </span>
            <button
              onClick={handleIncrement}
              disabled={qty >= 99}
              aria-label="Aumentar cantidad"
              className="quantity-button border-0 rounded-none"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>
      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </motion.article>
  )
}
