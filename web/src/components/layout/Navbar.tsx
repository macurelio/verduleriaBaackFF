import { useState, useEffect, useRef } from 'react'
import { Leaf, Search, ShoppingBag, Sparkles, X, Menu, MapPin } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { formatPrice } from '../../utils/cart'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from '../../context/LocationContext'
import ThemeSwitcher from '../ui/ThemeSwitcher'

interface NavbarProps {
  onOpenCart: () => void
  selectedCategory?: string | null
  onSelectCategory?: (category: string | null) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onOpenPackBuilder?: () => void
}

export default function Navbar({
  onOpenCart,
  selectedCategory,
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  onOpenPackBuilder,
}: NavbarProps) {
  const { brandName } = useSiteConfig()
  const { getCartCount, getCartTotal } = useCart()
  const { theme } = useTheme()
  const { selectedComuna, openModal } = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Keep header state synchronized
  }, [])

  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  const handlePackClick = () => {
    if (onOpenPackBuilder) {
      onOpenPackBuilder()
    } else {
      const el = document.getElementById('packs') || document.getElementById('armar-pack')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${theme.headerBg} ${theme.border} shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <a
          href="#inicio"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          aria-label={`${brandName} - Inicio`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`font-heading font-black text-lg sm:text-xl ${theme.textMain} tracking-tight`}>
                {brandName}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  openModal()
                }}
                title="Cambiar comuna de despacho"
                className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
              >
                <MapPin size={10} className="text-emerald-600 dark:text-emerald-400" />
                <span>{selectedComuna ? selectedComuna : 'Gran Santiago'}</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-normal">✎</span>
              </button>
            </div>
            <p className={`text-[11px] sm:text-xs ${theme.textMuted} flex items-center gap-1.5 font-medium`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cosecha de hoy • Directo a tu puerta
            </p>
          </div>
        </a>

        {/* Live Search Bar (Desktop) */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Buscar palta, espinaca, lechuga, tomates..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border ${theme.border} ${theme.cardBg} ${theme.textMain} placeholder:${theme.textMuted} focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-body`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Actions: Theme Switcher, Pack Builder Button & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSwitcher className="hidden lg:inline-flex" />

          <button
            type="button"
            onClick={handlePackClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-600/40 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60 font-heading font-bold text-xs transition active:scale-95 shadow-sm"
          >
            <Sparkles size={15} className="text-emerald-600" />
            <span>Crear mi Pack (-15%)</span>
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition shadow-lg shadow-emerald-700/25 active:scale-95"
            aria-label={`Ver carrito, ${cartCount} productos`}
          >
            <div className="relative">
              <ShoppingBag size={20} className="text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 font-extrabold text-[10px] sm:text-[11px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-emerald-600 animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-heading font-black text-xs sm:text-sm">
              {formatPrice(cartTotal)}
            </span>
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl ${theme.textMain} hover:bg-stone-100 dark:hover:bg-zinc-800 transition`}
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${theme.border} ${theme.cardBg} px-4 py-4 space-y-3 shadow-lg`}>
          {onSearchChange && (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar frutas o verduras..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border ${theme.border} ${theme.cardBg} ${theme.textMain} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handlePackClick}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-heading font-bold"
            >
              <Sparkles size={14} className="text-emerald-600" />
              <span>Armar Pack (-15%)</span>
            </button>
            <a
              href="#packs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-100 text-xs font-heading font-bold text-center"
            >
              Ver Packs Listos
            </a>
          </div>

          <div className="flex flex-col gap-1 text-sm font-semibold pt-2 border-t border-stone-200/50">
            <a
              href="#productos"
              onClick={() => {
                onSelectCategory?.(null)
                setMobileMenuOpen(false)
              }}
              className={`py-2 px-3 rounded-lg ${
                selectedCategory === null ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-stone-50 dark:hover:bg-zinc-800'
              }`}
            >
              Todos los Productos
            </a>
            <a
              href="#trabaja"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800"
            >
              Ventas Mayoristas & Empresas
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800"
            >
              Preguntas & Despacho
            </a>
          </div>

          <div className="pt-3 border-t border-stone-200/50 flex items-center justify-between">
            <span className={`text-xs font-bold ${theme.textMuted}`}>Tema visual:</span>
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}
