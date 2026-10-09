import { Instagram, MessageCircle, Heart } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'

const FOOTER_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Productos', href: '#productos' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
]


export default function Footer() {
  const { brandName: BRAND_NAME, deliveryZone, instagramHandle: INSTAGRAM_HANDLE, instagramUrl: INSTAGRAM_URL, waLink } = useSiteConfig()
  const WHATSAPP_URL = waLink('¡Hola! Quiero hacer un pedido de verduras 🥬')

  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-white/60" aria-label="Pie de página">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="sm:col-span-1">
            <a href="#inicio" className="inline-flex items-center gap-2 mb-3">
              <span
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[#14532d] to-[#052e16] flex items-center justify-center text-xl flex-shrink-0"
                aria-hidden="true"
              >
                🥬
              </span>
              <span className="font-heading font-black text-2xl text-white leading-none">
                {BRAND_NAME}
              </span>
            </a>
            <p className="text-sm leading-relaxed max-w-xs">
              Verdura fresca del día a domicilio en {deliveryZone}. Arma tu canasta y confirma por WhatsApp.
            </p>
          </div>

          <nav aria-label="Enlaces rápidos">
            <p className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-4">
              Navegación
            </p>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-4">
              Contacto
            </p>
            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-150"
                aria-label="Pedir por WhatsApp"
              >
                <MessageCircle size={16} className="text-[#25D366] flex-shrink-0" />
                Pedir por WhatsApp
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors duration-150"
                aria-label={`Instagram ${BRAND_NAME}`}
              >
                <Instagram size={16} className="text-sand/60 flex-shrink-0" />
                {INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p className="flex items-center gap-2">
            &copy; {year} {BRAND_NAME}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1">
            Hecho con <Heart size={12} className="fill-sand text-sand mx-0.5" /> en Chile
          </p>
        </div>
      </div>
    </footer>
  )
}
