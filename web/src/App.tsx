import { useEffect, useState, useRef } from 'react'
import { useSiteConfig } from './hooks/useSiteConfig'
import { CartProvider, useCart } from './context/CartContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HeroSection from './components/sections/HeroSection'
import ProductsShowcaseSection from './components/sections/ProductsShowcaseSection'
import PromoSection from './components/sections/PromoSection'
import PackBuilder from './components/sections/PackBuilder'
import B2BSection from './components/sections/B2BSection'
import CTASection from './components/sections/CTASection'
import OfferBanner from './components/ui/OfferBanner'
import OfferModal from './components/ui/OfferModal'
import MiniCartBar from './components/ui/MiniCartBar'
import CartDrawer from './components/ui/CartDrawer'
import ChatAssistant from './components/ui/ChatAssistant'
import PackPromoCallout from './components/ui/PackPromoCallout'
import PackBuilderModal from './components/ui/PackBuilderModal'
import ComunaVerificationModal from './components/ui/ComunaVerificationModal'
import { LocationProvider } from './context/LocationContext'
import { MotionConfig } from 'framer-motion'

function useSessionRedirects() {
  useEffect(() => {
    if (window.location.pathname.endsWith('/checkout/success')) {
      window.history.replaceState({}, '', import.meta.env.BASE_URL)
    }
  }, [])
}

function AppContent() {
  const { brandName, deliveryZone } = useSiteConfig()
  const { getCartTotal, setCouponCode } = useCart()
  const { theme } = useTheme()

  const [offerOpen, setOfferOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [packBuilderOpen, setPackBuilderOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cartTotal = getCartTotal()
  const previousTotalRef = useRef(cartTotal)
  const hasTriggeredOfferModalRef = useRef(false)

  // Desplegar automáticamente el modal de cupones cuando el carrito supera los $20.000
  useEffect(() => {
    if (cartTotal >= 20000 && previousTotalRef.current < 20000 && !hasTriggeredOfferModalRef.current) {
      hasTriggeredOfferModalRef.current = true
      setOfferOpen(true)
      showToast('🎉 ¡Superaste los $20.000! Desbloqueaste 10% DCTO con cupón FRESCO10')
    } else if (cartTotal < 20000) {
      hasTriggeredOfferModalRef.current = false
    }
    previousTotalRef.current = cartTotal
  }, [cartTotal])

  useSessionRedirects()

  const showToast = (message: string) => {
    setToastMessage(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  useEffect(() => {
    document.title = `${brandName} — Frutas y verduras a domicilio`
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        `${brandName}: frutas, verduras y packs a domicilio en ${deliveryZone}. Arma tu canasta y confirma por WhatsApp.`,
      )
  }, [brandName, deliveryZone])

  const handleApplyCoupon = (code: string) => {
    setCouponCode(code)
    showToast(`¡Cupón ${code} aplicado al pedido!`)
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.textMain} pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 font-body selection:bg-emerald-500 selection:text-white transition-colors duration-300`}
    >
      <a
        href="#productos"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-stone-900 focus:p-3 focus:rounded-xl focus:shadow-lg focus:border focus:border-stone-300"
      >
        Ir a productos
      </a>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-24 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 bg-stone-950 text-white rounded-2xl shadow-2xl border border-stone-800 text-xs sm:text-sm font-medium animate-bounce"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <OfferBanner
        onOpenOffer={() => setOfferOpen(true)}
        onApplyCoupon={handleApplyCoupon}
      />

      {/* Main Header / Navbar */}
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPackBuilder={() => setPackBuilderOpen(true)}
      />

      <main>
        {/* Hero Section */}
        <HeroSection onOpenPackBuilder={() => setPackBuilderOpen(true)} />

        {/* Callout Banner: Custom Pack Promotion */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <PackPromoCallout onOpenPackBuilder={() => setPackBuilderOpen(true)} />
        </div>

        {/* Pre-made Packs Showcase */}
        <PromoSection onOpenPackBuilder={() => setPackBuilderOpen(true)} />

        {/* Loose Produce Showcase with Filters & Search */}
        <ProductsShowcaseSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Inline Pack Builder Section */}
        <PackBuilder />

        {/* B2B / Wholesale Section */}
        <B2BSection />

        {/* CTA / Final WhatsApp Conversion */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ComunaVerificationModal />
      <OfferModal open={offerOpen} onClose={() => setOfferOpen(false)} />
      <PackBuilderModal
        open={packBuilderOpen}
        onClose={() => setPackBuilderOpen(false)}
        onSuccess={showToast}
      />
      <MiniCartBar
        onOpenCart={() => setCartOpen(true)}
        onOpenPackBuilder={() => setPackBuilderOpen(true)}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatAssistant />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LocationProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </LocationProvider>
      </ThemeProvider>
    </MotionConfig>
  )
}

