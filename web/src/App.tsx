import { useEffect, useState } from 'react'
import { useSiteConfig } from './hooks/useSiteConfig'
import { CartProvider } from './context/CartContext'
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
  const [offerOpen, setOfferOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  useSessionRedirects()

  useEffect(() => {
    document.title = `${brandName} — Frutas y verduras a domicilio`
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${brandName}: frutas, verduras y packs a domicilio en ${deliveryZone}. Arma tu canasta y confirma por WhatsApp.`)
  }, [brandName, deliveryZone])

  return (
    <div className="min-h-screen bg-canvas pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <a href="#productos" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-surface focus:p-3 focus:rounded-xl">Ir a productos</a>
      <OfferBanner onOpenOffer={() => setOfferOpen(true)} />
      <Navbar onOpenCart={() => setCartOpen(true)} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      <main>
        <HeroSection />
        <ProductsShowcaseSection selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        <PromoSection />
        <PackBuilder />
        <B2BSection />
        <CTASection />
      </main>
      <Footer />
      <OfferModal open={offerOpen} onClose={() => setOfferOpen(false)} />
      <MiniCartBar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <AppContent />
      </CartProvider>
    </MotionConfig>
  )
}
