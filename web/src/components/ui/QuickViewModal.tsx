import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Check } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { UNIT_LABELS } from '../../config'
import { getProduceImage } from '../../produce'
import type { Product } from '../../types'

interface QuickViewModalProps {
  product: Product | null
  onClose: () => void
}

const EASE = [0.25, 1, 0.5, 1] as const

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Reset state when product changes
  useEffect(() => {
    if (!product) return
    if (product) {
      setQty(1)
      setAdded(false)
    }
  }, [product])

  // Close on Escape
  useEffect(() => {
    if (!product) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [product, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    if (!product) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [product])

  const handleAdd = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) addToCart(product)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setQty(1)
    }, 1800)
  }

  return createPortal(
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Vista rápida: ${product.name}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg lg:max-w-2xl max-h-[92vh] flex flex-col lg:flex-row">
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar vista rápida"
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-charcoal hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mora"
              >
                <X size={16} />
              </button>

              {/* Visual */}
              <div
                className="lg:w-[44%] flex-shrink-0 relative h-52 lg:h-64 overflow-hidden flex items-center justify-center"
                // eslint-disable-next-line react/forbid-dom-props
                style={{
                  background: `linear-gradient(135deg, ${product.gradientFrom} 0%, ${product.gradientTo} 100%)`,
                }}
              >
                {getProduceImage(product) ? (
                  <motion.img
                    src={getProduceImage(product)}
                    alt=""
                    className="w-full h-full object-contain p-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.38, ease: EASE }}
                    draggable={false}
                  />
                ) : (
                  <motion.span
                    className="text-8xl select-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
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
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6 gap-4 overflow-y-auto">
                {/* Category */}
                <span className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
                  {product.category}
                </span>

                {/* Name + price */}
                <div>
                  <h2 className="font-heading font-black text-charcoal text-2xl leading-tight">
                    {product.name}
                  </h2>
                  <p className="mt-1 font-heading font-black text-cocoa text-2xl">
                    ${product.price.toLocaleString('es-CL')}{' '}
                    <span className="text-sm font-bold text-muted uppercase tracking-widest">
                      {UNIT_LABELS[product.unit]}
                    </span>
                  </p>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm font-body text-charcoal/70 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Qty + Add */}
                <div className="flex items-center gap-3 mt-auto pt-2">
                  <div className="flex items-center gap-1 border border-cream-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="Reducir cantidad"
                      className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mora"
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      className="w-8 text-center text-sm font-heading font-bold text-charcoal select-none"
                      aria-live="polite"
                      aria-label={`Cantidad: ${qty}`}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                      aria-label="Aumentar cantidad"
                      className="w-9 h-9 flex items-center justify-center text-charcoal hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mora"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <motion.button
                    onClick={handleAdd}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.14 }}
                    className={[
                      'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl',
                      'font-heading font-bold text-sm uppercase tracking-widest text-white transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mora focus-visible:ring-offset-2',
                      added ? 'bg-[#25D366]' : 'bg-charcoal hover:bg-cocoa active:bg-cocoa/90',
                    ].join(' ')}
                    aria-label={added ? 'Agregado al carrito' : 'Agregar al carrito'}
                  >
                    {added ? (
                      <>
                        <Check size={14} aria-hidden="true" />
                        Agregado
                      </>
                    ) : (
                      'Agregar al carrito'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
