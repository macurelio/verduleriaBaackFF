import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useSiteConfig } from '../../hooks/useSiteConfig'

const STORAGE_KEY = 'mora_verduras_welcome_seen'

export default function WelcomeModal() {
  const { brandName, deliveryZone } = useSiteConfig()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Show only once per session
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="relative z-10 bg-charcoal rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 32 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            {/* Header visual band */}
            <div className="relative h-44 bg-gradient-to-br from-[#14532d] to-[#052e16] flex items-center justify-center overflow-hidden">
              <span className="absolute -right-6 -bottom-6 text-[8rem] opacity-20" aria-hidden="true">
                🥬
              </span>
              <div className="relative flex flex-col items-center gap-2">
                <span className="text-6xl drop-shadow-lg" aria-hidden="true">
                  🥬
                </span>
                <span className="font-heading font-black text-sand text-xl tracking-wide drop-shadow">
                  {brandName}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={close}
              aria-label="Cerrar bienvenida"
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-sand/70 hover:text-sand hover:bg-black/50 transition-colors"
            >
              <X size={16} />
            </button>

            {/* Body */}
            <div className="px-7 py-6 flex flex-col items-center gap-4 text-center">
              <h2
                id="welcome-title"
                className="font-heading font-black text-sand text-2xl uppercase tracking-wide leading-tight"
              >
                ¡Bienvenido/a!
              </h2>
              <p className="text-sand/70 font-body text-sm leading-relaxed">
                Frutas y verduras a domicilio en {deliveryZone}. Arma tu canasta y confirma la entrega y el pago por WhatsApp.
              </p>

              <div className="flex flex-col gap-2 w-full mt-1">
                <button
                  onClick={() => {
                    close()
                    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className={[
                    'w-full py-3 rounded-xl',
                    'bg-sand text-charcoal font-heading font-black text-sm uppercase tracking-wide',
                    'hover:bg-sand/90 active:scale-[0.98] transition-all duration-150 shadow-md',
                  ].join(' ')}
                >
                  Ver verduras
                </button>
                <button
                  onClick={close}
                  className="w-full py-2.5 rounded-xl text-sand/50 font-body text-xs hover:text-sand/80 transition-colors"
                >
                  Explorar más tarde
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
