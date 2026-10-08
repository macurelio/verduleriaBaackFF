import { motion } from 'framer-motion'
import ProductCarousel from '../carousels/ProductCarousel'
import { products } from '../../data/products'
import { CATEGORIES } from '../../data/categories'
import { fetchProducts, fetchCategories } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { getCategoryImage } from '../../produce'

const EASE = [0.25, 1, 0.5, 1] as const

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

const categoryTitleVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.05 },
  },
}

export default function FeaturedProductsSection() {
  const categoryList = useApiResource('categories', fetchCategories, CATEGORIES)
  const productList = useApiResource('products', fetchProducts, products)

  return (
    <section id="productos" aria-label="Productos" className="py-20 sm:py-28 bg-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={headerVariants}
        >
          <h2 className="font-heading font-black text-sand text-4xl sm:text-5xl leading-tight">
            Nuestras Verduras
          </h2>
          <p className="mt-4 text-white/50 font-body text-base max-w-md mx-auto">
            Producto fresco del día. Precio por unidad de venta, sin sorpresas.
          </p>
        </motion.div>

        <div className="space-y-20">
          {categoryList.map(({ name, emoji, blurb }) => {
            const items = productList.filter((p) => p.category === name)
            if (!items.length) return null
            return (
              <div key={name}>
                <motion.div
                  className="flex items-center gap-4 mb-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={categoryTitleVariants}
                >
                  {getCategoryImage(name) ? (
                    <img
                      src={getCategoryImage(name)}
                      alt=""
                      className="w-11 h-11 object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <span className="w-14 h-14 flex items-center justify-center text-4xl" aria-hidden="true">
                      {emoji}
                    </span>
                  )}
                  <div>
                    <h3 className="font-heading font-black text-sand text-2xl sm:text-3xl uppercase tracking-wide">
                      {name}
                    </h3>
                    <p className="text-white/40 font-body text-sm">{blurb}</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                </motion.div>

                <ProductCarousel products={items} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
