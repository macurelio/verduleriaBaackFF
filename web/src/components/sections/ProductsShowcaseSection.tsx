import { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { products } from '../../data/products'
import { fetchProducts } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import CategoryChips from '../ui/CategoryChips'
import ProductGrid from '../ui/ProductGrid'
import FreeShippingProgressBar from '../ui/FreeShippingProgressBar'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'

interface ProductsShowcaseProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  searchQuery?: string
  onSearchChange?: (q: string) => void
}

export default function ProductsShowcaseSection({
  selectedCategory,
  onSelectCategory,
  searchQuery: externalSearch = '',
  onSearchChange: externalSetSearch,
}: ProductsShowcaseProps) {
  const [internalSearch, setInternalSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const { getCartTotal } = useCart()
  const { theme } = useTheme()
  const cartSubtotal = getCartTotal()

  const search = externalSetSearch ? externalSearch : internalSearch
  const setSearch = externalSetSearch || setInternalSearch

  const productList = useApiResource('products', fetchProducts, products)

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-CL')

  const query = normalize(search.trim())

  const filtered = productList.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    const matchesSearch =
      !query ||
      normalize(`${p.name} ${p.description} ${p.category} ${p.harvest || ''} ${p.nutrition || ''}`).includes(
        query,
      )
    return matchesCategory && matchesSearch
  })

  // Sort logic
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
  else if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'es-CL'))
  else if (sort === 'popular') {
    filtered.sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)))
  }

  return (
    <section id="productos" aria-label="Productos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Free Shipping Progress Indicator */}
      <FreeShippingProgressBar currentSubtotal={cartSubtotal} threshold={20000} />

      {/* Header & Sort Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${theme.border} pb-4`}>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 font-heading">
            Catálogo Individual
          </span>
          <h2 className={`text-2xl sm:text-3xl font-black font-heading tracking-tight ${theme.textMain}`}>
            Verduras y Frutas Sueltas
          </h2>
          <p className={`text-xs sm:text-sm ${theme.textMuted} font-body`}>
            Selecciona kilo por kilo con maduración y frescura garantizada.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick search input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar verdura o fruta..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border ${theme.border} ${theme.cardBg} ${theme.textMain} placeholder:${theme.textMuted} focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-body`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                aria-label="Limpiar filtro"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <SlidersHorizontal size={14} className="text-stone-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`border ${theme.border} ${theme.cardBg} ${theme.textMain} rounded-xl px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-sm`}
              aria-label="Ordenar productos"
            >
              <option value="popular">Más Populares</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
              <option value="rating">Mejor Calificación</option>
              <option value="name">Nombre: A a Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Chips Filter */}
      <CategoryChips selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />

      {/* Product Results Status */}
      <div className={`flex items-center justify-between text-xs ${theme.textMuted} px-1`}>
        <span>
          Mostrando <strong className={theme.textMain}>{filtered.length}</strong> producto{filtered.length === 1 ? '' : 's'}
        </span>
        {(search || selectedCategory) && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              onSelectCategory(null)
            }}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Products Grid */}
      <ProductGrid
        products={filtered}
        emptyMessage="No encontramos productos con estos filtros. Prueba buscar con otro término."
      />
    </section>
  )
}
