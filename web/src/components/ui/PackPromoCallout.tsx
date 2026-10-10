import { Package, Sparkles } from 'lucide-react'

interface PackPromoCalloutProps {
  onOpenPackBuilder: () => void
}

export default function PackPromoCallout({ onOpenPackBuilder }: PackPromoCalloutProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
          <Package size={26} className="text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-heading font-black">
            ¿Tienes preferencias específicas en tu familia?
          </h3>
          <p className="text-xs sm:text-sm text-amber-100 font-body">
            Arma una canasta con tus 4 a 8 verduras favoritas y obtén automáticamente hasta un{' '}
            <strong className="text-white">15% de ahorro</strong>.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenPackBuilder}
        className="w-full md:w-auto px-5 py-3 rounded-xl bg-white text-stone-900 font-heading font-black text-xs uppercase tracking-wider hover:bg-stone-100 transition shadow active:scale-95 shrink-0 flex items-center justify-center gap-2"
      >
        <Sparkles size={15} className="text-emerald-700" />
        <span>Abrir Creador de Packs</span>
      </button>
    </div>
  )
}
