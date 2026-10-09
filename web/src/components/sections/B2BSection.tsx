import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'


const EASE = [0.25, 1, 0.5, 1] as const

export default function B2BSection() {
  const { waLink } = useSiteConfig()
  const WHATSAPP_MSG = waLink(
    '¡Hola! Quiero abastecer mi local con verduras de Mora Verduras 🥬',
  )

  return (
    <section id="trabaja" aria-label="Trabaja con nosotros" className="bg-charcoal py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

        {/* ── Hero card: fondo + texto centrado ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
          className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[260px] flex items-center justify-center"
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-mora-dark via-surface to-charcoal"
            aria-hidden="true"
          />
          <span
            className="absolute right-6 bottom-4 text-[8rem] sm:text-[11rem] leading-none opacity-20 select-none pointer-events-none"
            aria-hidden="true"
          >
            🥬
          </span>

          {/* Content */}
          <div className="relative z-10 text-center px-4 py-7 flex flex-col items-center gap-5">
            <span className="text-[10px] font-heading font-bold uppercase tracking-[0.28em] text-white/50 border border-white/15 px-4 py-1.5 rounded-full">
              Para restaurantes, almacenes y cafeterías
            </span>

            <h2 className="font-heading font-black text-white text-3xl sm:text-5xl leading-tight">
              Abastece tu local{' '}
              <span className="text-sand">con nosotros</span>
            </h2>

            <p className="text-white/65 text-base sm:text-lg max-w-md leading-relaxed">
              Verdura fresca a precios por volumen, entregas programadas y sin quedar
              con stock.{' '}
              <span className="text-white/90 font-medium">Conversemos.</span>
            </p>

            <a
              href={WHATSAPP_MSG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-sand text-charcoal font-heading font-bold text-sm uppercase tracking-widest hover:bg-sand/80 transition-colors duration-200 mt-1"
            >
              <MessageCircle size={18} />
              Cotizar por WhatsApp
            </a>
          </div>
        </motion.div>

        {/* ── La Propuesta card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.12 }}
          className="rounded-3xl bg-white/[0.05] border border-white/10 px-5 py-6 sm:px-8 sm:py-8"
        >
          <h3 className="font-heading font-black text-sand text-xl sm:text-2xl uppercase tracking-wide mb-5">
            La Propuesta
          </h3>
          <p className="text-white/65 font-body text-base sm:text-lg leading-relaxed">
            Trabajamos directamente con productores del Valle del Maipo y la Zona
            Central, lo que nos permite ofrecer precios por volumen sin sacrificar
            frescura. Armamos pedidos programados (diarios o semanales) según el
            ritmo de tu local, con boleta o factura y entrega en el horario que
            necesites. Mora Verduras es una alternativa fresca y ágil para
            restaurantes, cafeterías y almacenes que buscan verdura de calidad todos
            los días sin preocuparse por los quiebres de stock.
          </p>
        </motion.div>


      </div>
    </section>
  )
}
