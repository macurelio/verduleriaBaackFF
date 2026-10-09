import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '../../data/categories'
import { fetchCategories } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'
import { ShoppingCart, Instagram, Menu, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../hooks/useSiteConfig'

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Productos', href: '#productos' },
  { label: 'Mayoristas', href: '#trabaja' },
  { label: 'Contacto', href: '#contacto' },
]

interface NavbarProps {
  onOpenCart: () => void
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export default function Navbar({ onOpenCart, selectedCategory, onSelectCategory }: NavbarProps) {
  const categories = useApiResource('categories', fetchCategories, CATEGORIES)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { instagramUrl: INSTAGRAM_URL, brandName } = useSiteConfig()

  const { getCartCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const handleOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('pointerdown', handleOutside)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('pointerdown', handleOutside)
    }
  }, [menuOpen])

  const cartCount = getCartCount()

  return (
    <header
      ref={headerRef}
      className={[
        'sticky top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-charcoal shadow-lg shadow-black/30'
          : 'bg-charcoal/80 backdrop-blur-md',
        menuOpen ? 'bg-charcoal' : '',
      ].join(' ')}
    >
      <nav
        className="store-container flex items-center justify-between h-16"
        aria-label="Navegación principal"
      >
        <a
          href="#inicio"
          className="min-w-0 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded-lg"
          aria-label={`${brandName} — volver al inicio`}
        >
          <span
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-mora to-mora-dark flex items-center justify-center text-xl flex-shrink-0"
            aria-hidden="true"
          >
            🥬
          </span>
          <span className="min-w-0 flex items-baseline gap-1 leading-none">
            <span className="truncate max-w-[9rem] sm:max-w-none font-heading font-black text-sm sm:text-lg text-sand">{brandName}</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-heading font-bold transition-colors duration-150',
                  'text-sand/80 hover:text-sand hover:bg-white/10',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand',
                ].join(' ')}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram de ${brandName}`}
            className="hidden sm:inline-flex p-2 rounded-lg text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            <Instagram size={20} />
          </a>

          <button
            onClick={() => { setMenuOpen(false); onOpenCart() }}
            aria-label={`Carrito${cartCount > 0 ? `, ${cartCount} producto${cartCount !== 1 ? 's' : ''}` : ''}`}
            className="relative p-2 rounded-lg text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-sand text-charcoal text-[9px] font-bold leading-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú de productos y categorías' : 'Abrir menú de productos y categorías'}
            className="p-2 rounded-lg text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Productos y categorías"
          className="absolute top-full inset-x-0 lg:left-auto lg:right-4 lg:w-80 max-h-[calc(100dvh-5rem)] overflow-y-auto bg-surface border border-white/10 rounded-b-xl shadow-xl px-4 pb-4"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => { if (href === '#productos') onSelectCategory(null); setMenuOpen(false) }}
                  className="block px-4 py-3 rounded-xl text-sm font-heading font-bold text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 mt-3 pt-3">
            <h2 className="px-4 mb-2 text-xs font-heading font-bold text-mora-light uppercase tracking-wide">Categorías de productos</h2>
            <ul className="space-y-1">
              <li><a href="#productos" onClick={() => { onSelectCategory(null); setMenuOpen(false) }} aria-current={selectedCategory === null ? 'true' : undefined} className={`block px-4 py-2.5 rounded-lg text-sm ${selectedCategory === null ? 'bg-mora text-white' : 'text-sand hover:bg-white/10'}`}>Todos los productos</a></li>
              {categories.map((category) => <li key={category.name}>
                <a href="#productos" onClick={() => { onSelectCategory(category.name); setMenuOpen(false) }} aria-current={selectedCategory === category.name ? 'true' : undefined} className={`block px-4 py-2.5 rounded-lg text-sm ${selectedCategory === category.name ? 'bg-mora text-white' : 'text-sand hover:bg-white/10'}`}>{category.emoji} {category.name}</a>
              </li>)}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
