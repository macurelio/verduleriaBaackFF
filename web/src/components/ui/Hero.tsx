import { useRef } from 'react'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const productsRef = useRef<HTMLElement | null>(null)

  const scrollToProducts = () => {
    const el = document.getElementById('productos')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="inicio" aria-label="Hero Mora Verduras" className="relative pt-10 md:pt-16 pb-12 md:pb-16 bg-charcoal">
      <div className="store-container">
        <div className="text-center">
          <h1 className="font-heading font-black text-sand text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
            Mora Verduras
          </h1>
          <p className="mt-4 md:mt-6 text-white/70 font-body text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
            Verduras y frutas frescas para tu casa. Pedido directo por WhatsApp.
          </p>

          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={scrollToProducts}
              className="px-6 py-3 rounded-xl bg-mora text-white font-heading font-bold text-sm md:text-base uppercase tracking-wide shadow-md hover:opacity-95 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              Ver productos
            </button>
          </div>

          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60 font-body">
            <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Productos frescos</span>
            <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Pedido directo por WhatsApp</span>
            <span className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5">Sin pago online</span>
          </div>
        </div>

        <div className="mt-10 md:mt-14 flex justify-center">
          <button
            onClick={scrollToProducts}
            aria-label="Ver productos"
            className="p-2 rounded-full border border-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowDown size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
