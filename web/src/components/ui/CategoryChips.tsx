import { useMemo } from 'react'
import { products } from '../../data/products'
import { CATEGORIES } from '../../data/categories'
import { fetchProducts, fetchCategories } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { useTheme } from '../../context/ThemeContext'

interface CategoryChipsProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function CategoryChips({ selectedCategory, onSelectCategory }: CategoryChipsProps) {
  const categoryList = useApiResource('categories', fetchCategories, CATEGORIES)
  const productList = useApiResource('products', fetchProducts, products)
  const { theme } = useTheme()

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    productList.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1
    })
    return map
  }, [productList])

  const totalCount = productList.length

  return (
    <section aria-label="Filtro por categorías" className="py-2">
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          aria-pressed={selectedCategory === null}
          className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition whitespace-nowrap ${
            selectedCategory === null
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
              : `border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:bg-stone-100 dark:hover:bg-zinc-800`
          }`}
        >
          Todos los productos {totalCount ? `(${totalCount})` : ''}
        </button>

        {categoryList.map(({ name }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectCategory(name)}
            aria-pressed={selectedCategory === name}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition whitespace-nowrap ${
              selectedCategory === name
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                : `border ${theme.border} ${theme.cardBg} ${theme.textMuted} hover:bg-stone-100 dark:hover:bg-zinc-800`
            }`}
          >
            {name} {counts[name] ? `(${counts[name]})` : ''}
          </button>
        ))}
      </div>
    </section>
  )
}
