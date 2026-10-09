import TestimonialCarousel from '../carousels/TestimonialCarousel'
import { Instagram } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'

export default function TestimonialsSection() {
  const { instagramHandle: INSTAGRAM_HANDLE, instagramUrl: INSTAGRAM_URL } = useSiteConfig()

  return (
    <section
      id="testimonios"
      aria-label="Testimonios de clientes"
      className="py-16 sm:py-20 bg-charcoal overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block bg-white/10 text-white/70 text-xs font-heading font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            Lo que dicen nuestros clientes
          </span>
          <h2 className="font-heading font-black text-white text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Los vecinos hablan 💬
          </h2>
          <p className="mt-3 text-white/50 font-body text-base max-w-lg mx-auto">
            Cada semana más hogares de Santiago piden su verdura con nosotros.
          </p>
        </div>

        <TestimonialCarousel />

        <div className="text-center mt-12">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-heading font-bold transition-colors duration-200 group"
          >
            <Instagram size={18} className="group-hover:scale-110 transition-transform duration-200" />
            Síguenos en Instagram {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}
