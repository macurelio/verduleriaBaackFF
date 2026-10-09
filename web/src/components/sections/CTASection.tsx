import { MessageCircle, Instagram, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import { useSiteConfig } from '../../hooks/useSiteConfig'


export default function CTASection() {
  const { deliveryZone: DELIVERY_ZONE, instagramUrl: INSTAGRAM_URL, waLink } = useSiteConfig()
  const WHATSAPP_MSG = waLink('¡Hola! Quiero hacer un pedido de verduras 🥬')

  return (
    <section
      id="contacto"
      aria-label="Sección de contacto y pedidos"
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #052e16 0%, #14532d 50%, #1a1a1a 100%)',
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span className="font-heading font-black text-[clamp(120px,30vw,360px)] text-white/[0.03] leading-none">
          Mora
        </span>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-block bg-white/10 text-white/60 text-xs font-heading font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
          ¿Listo para cocinar hoy?
        </span>

        <h2 className="font-heading font-black text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">
          Haz tu pedido{' '}
          <span className="text-[#25D366]">ahora</span> 🚀
        </h2>

        <p className="font-body text-white/50 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Entregamos en {DELIVERY_ZONE} el mismo día. Arma tu canasta, elige el
          horario y te la llevamos a la puerta.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            as="a"
            href={WHATSAPP_MSG}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
            size="lg"
          >
            <MessageCircle size={20} />
            Pedir por WhatsApp
          </Button>

          <Button
            as="a"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white hover:text-charcoal"
          >
            <Instagram size={20} />
            Ver Instagram
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/40 text-xs font-heading font-bold uppercase tracking-widest">
          {[
            `✓ Envío en ${DELIVERY_ZONE}`,
            '✓ Pedido en 30 segundos',
            '✓ Pagas al recibir',
            '✓ Frescura garantizada',
          ].map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
