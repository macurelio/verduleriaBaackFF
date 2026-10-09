import { useState, useEffect } from 'react'
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
}

export default function Navbar({ onOpenCart }: NavbarProps) {
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
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const cartCount = getCartCount()

  return (
    <header
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

        <ul className="hidden md:flex items-center gap-1">
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
            onClick={onOpenCart}
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
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden p-2 rounded-lg text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-charcoal border-t border-white/10 px-4 pb-4"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-heading font-bold text-sand/80 hover:text-sand hover:bg-white/10 transition-colors duration-150"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
