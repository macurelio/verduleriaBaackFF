import { Sparkles, Package } from 'lucide-react'

interface HeroSectionProps {
  onOpenPackBuilder?: () => void
}

export default function HeroSection({ onOpenPackBuilder }: HeroSectionProps) {
  const handleOpenPackBuilder = () => {
    if (onOpenPackBuilder) {
      onOpenPackBuilder()
    } else {
      const el = document.getElementById('packs') || document.getElementById('armar-pack')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="inicio" aria-label="Sección principal" className="relative pt-4 sm:pt-6 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 md:p-12 shadow-2xl border border-emerald-800/40">
          {/* Radial blur glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            {/* Harvest badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="uppercase tracking-wider font-bold">Cosechado hoy en Paine y Curacaví</span>
            </div>

            {/* Main Punchy Heading */}
            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.15]">
              Verdura fresca a tu puerta en{' '}
              <span className="text-emerald-300 underline decoration-amber-400 decoration-wavy underline-offset-8">
                menos de 24 horas
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed font-body">
              Pide por kilos sueltos o aprovecha nuestros packs listos con descuentos de hasta un 20%. También puedes diseñar tu propio pack a medida con despacho directo en Gran Santiago.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleOpenPackBuilder}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-heading font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2"
              >
                <Sparkles size={16} className="text-stone-950" />
                <span>Diseñar mi Propio Pack (-15%)</span>
              </button>

              <a
                href="#packs"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs uppercase tracking-wider transition border border-white/20 backdrop-blur-md flex items-center gap-2 active:scale-95"
              >
                <Package size={16} />
                <span>Ver Packs Armados</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
