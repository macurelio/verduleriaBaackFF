import { useState } from 'react'
import { Search, Truck, MessageCircle } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { products } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import CategoryChips from '../ui/CategoryChips'
import ProductGrid from '../ui/ProductGrid'

interface ProductsShowcaseProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function ProductsShowcaseSection({ selectedCategory, onSelectCategory }: ProductsShowcaseProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const config = useSiteConfig()
  const productList = useApiResource('products', fetchProducts, products)

  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CL')
  const query = normalize(search.trim())
  const filtered = productList.filter((p) =>
    (!selectedCategory || p.category === selectedCategory) &&
    normalize(`${p.name} ${p.description} ${p.category}`).includes(query),
  )
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'es-CL'))
  if (sort === 'featured') filtered.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))

  return (
    <section id="productos" aria-label="Productos" className="bg-charcoal pb-8 md:pb-12">
      <div className="store-container pt-6 pb-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-mora-light font-heading font-bold text-sm mb-2">Tu compra de la semana</p>
            <h2 className="text-sand font-heading font-black text-3xl sm:text-4xl">Arma tu canasta</h2>
            <p className="text-sand/60 text-sm mt-2">Frutas, verduras y packs. Elige tus productos y envía tu pedido desde la tienda.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-sand/70">
            <span className="inline-flex items-center gap-2"><Truck size={16} /> Reparto en {config.deliveryZone}</span>
            <span className="inline-flex items-center gap-2"><MessageCircle size={16} /> WhatsApp opcional</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Buscar productos</span>
            <Search size={18} className="absolute left-4 top-3.5 text-sand/40" aria-hidden="true" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Busca tomate, palta, lechuga…" className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3 text-sm text-sand placeholder:text-sand/40 focus:outline-none focus:border-mora" />
          </label>
          <label>
            <span className="sr-only">Ordenar productos</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto rounded-xl bg-charcoal border border-white/10 p-3 text-sm text-sand focus:outline-none focus:border-mora">
              <option value="default">Orden del catálogo</option>
              <option value="featured">Destacados primero</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre: A a Z</option>
            </select>
          </label>
        </div>
        <div className="mt-3 flex justify-between items-center gap-3 text-xs text-sand/50">
          <p role="status">{filtered.length} producto{filtered.length === 1 ? '' : 's'}</p>
          {(search || selectedCategory) && <button onClick={() => { setSearch(''); onSelectCategory(null) }} className="text-sand hover:underline">Limpiar filtros</button>}
        </div>
      </div>
      <CategoryChips selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
      <ProductGrid products={filtered} emptyMessage="No encontramos productos con estos filtros. Prueba otra búsqueda." />
    </section>
  )
}
