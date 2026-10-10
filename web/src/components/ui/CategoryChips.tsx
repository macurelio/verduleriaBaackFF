import { useMemo } from 'react'
import { products } from '../../data/products'
import { CATEGORIES } from '../../data/categories'
import { fetchProducts, fetchCategories } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'

interface CategoryChipsProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function CategoryChips({ selectedCategory, onSelectCategory }: CategoryChipsProps) {
  const categoryList = useApiResource('categories', fetchCategories, CATEGORIES)
  const productList = useApiResource('products', fetchProducts, products)

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    productList.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [productList])

  const totalCount = productList.length

  return (
    <section aria-label="Filtro por categorías" className="sticky top-16 z-40 bg-surface/95 backdrop-blur border-y border-border">
      <div className="store-container py-2 md:py-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => onSelectCategory(null)}
            aria-pressed={selectedCategory === null}
            className={[
              'whitespace-nowrap px-3 py-2.5 min-h-11 rounded-full text-sm font-heading font-bold border transition-colors',
              selectedCategory === null
                ? 'bg-mora border-mora text-white'
                : 'border-border text-muted hover:text-ink hover:bg-surface',
            ].join(' ')}
          >
            Todos {totalCount ? `(${totalCount})` : ''}
          </button>

          {categoryList.map(({ name }) => (
            <button
              key={name}
              onClick={() => onSelectCategory(name)}
              aria-pressed={selectedCategory === name}
              className={[
                'whitespace-nowrap px-3 py-2.5 min-h-11 rounded-full text-sm font-heading font-bold border transition-colors',
                selectedCategory === name
                  ? 'bg-mora border-mora text-white'
                  : 'border-border text-muted hover:text-ink hover:bg-surface',
              ].join(' ')}
            >
              {name} {counts[name] ? `(${counts[name]})` : ''}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
