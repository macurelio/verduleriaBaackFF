import { useState } from 'react'
import { products } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import CategoryChips from '../ui/CategoryChips'
import ProductGrid from '../ui/ProductGrid'

export default function ProductsShowcaseSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const productList = useApiResource('products', fetchProducts, products)

  const filtered = selectedCategory
    ? productList.filter((p) => p.category === selectedCategory)
    : productList

  return (
    <section id="productos" aria-label="Productos" className="bg-charcoal pb-8 md:pb-12">
      <CategoryChips selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <ProductGrid products={filtered} emptyMessage="No hay productos para esta categoría." />
    </section>
  )
}
