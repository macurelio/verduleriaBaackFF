import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import type { Product } from '../../types'

const EASE = [0.25, 1, 0.5, 1] as const

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: EASE,
      staggerChildren: 0.08,
    },
  },
}

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  return (
    <section aria-label="Listado de productos" className="py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 text-center py-16"
          >
            <div className="text-5xl">🧺</div>
            <p className="text-white/50 font-body text-sm">{emptyMessage || 'No hay productos para esta categoría.'}</p>
            <p className="text-white/30 font-body text-xs">Prueba cambiando de categoría o selecciona "Todos".</p>
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
