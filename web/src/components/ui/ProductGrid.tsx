import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import type { Product } from '../../types'

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  return (
    <section aria-label="Listado de productos" className="py-4 md:py-5">
      <div className="store-container">
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
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
