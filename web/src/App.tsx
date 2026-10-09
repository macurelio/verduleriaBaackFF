import { useEffect, useState } from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HeroSection from './components/sections/HeroSection'
import ProductsShowcaseSection from './components/sections/ProductsShowcaseSection'
import FeaturedProductsSection from './components/sections/FeaturedProductsSection'
import PromoSection from './components/sections/PromoSection'
import TestimonialsSection from './components/sections/TestimonialsSection'
import B2BSection from './components/sections/B2BSection'
import CTASection from './components/sections/CTASection'
import WelcomeModal from './components/ui/WelcomeModal'
import OfferBanner from './components/ui/OfferBanner'
import OfferModal from './components/ui/OfferModal'
import MiniCartBar from './components/ui/MiniCartBar'
import CartDrawer from './components/ui/CartDrawer'

function useSessionRedirects() {
  useEffect(() => {
    if (window.location.pathname.endsWith('/checkout/success')) {
      window.history.replaceState({}, '', '/verduleriaBaackFF/')
    }
  }, [])
}

function AppContent() {
  const [offerOpen, setOfferOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  useSessionRedirects()

  return (
    <div className="min-h-screen bg-charcoal pb-14 md:pb-0">
      <OfferBanner onOpenOffer={() => setOfferOpen(true)} />
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <main>
        <HeroSection />
        <ProductsShowcaseSection />
        <FeaturedProductsSection />
        <PromoSection />
        <TestimonialsSection />
        <B2BSection />
        <CTASection />
      </main>
      <Footer />
      <WelcomeModal />
      <OfferModal open={offerOpen} onClose={() => setOfferOpen(false)} />
      <MiniCartBar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
