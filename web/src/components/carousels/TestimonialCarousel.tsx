import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useCarousel } from '../../hooks/useCarousel'
import { testimonials } from '../../data/testimonials'
import { fetchTestimonials } from '../../api/catalog'
import { useApiResource } from '../../api/useApiResource'

const EASE_PREMIUM = [0.25, 1, 0.5, 1] as const

/** Fade + subtle vertical shift between testimonials */
const cardVariants = {
  enter: { opacity: 0, y: 18, scale: 0.98 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.52, ease: EASE_PREMIUM },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.98,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
  },
}

/**
 * Carousel C — Social Proof / Testimonials
 *
 * Single-card fade + slide transition with AnimatePresence.
 * Auto-plays every 6 s; pauses on hover.
 */
export default function TestimonialCarousel() {
  const items = useApiResource('testimonials', fetchTestimonials, testimonials)
  const { current, go, prev, next, pause, resume } = useCarousel(
    items.length,
    { autoPlay: true, interval: 6000 },
  )

  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  const t = items[current]

  return (
    <div
      className="relative max-w-2xl mx-auto px-4"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Testimonios de clientes"
      aria-live="polite"
    >
      {/* ── Animated testimonial card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-cream-border relative overflow-hidden"
        >
          {/* Decorative quote icon */}
          <Quote
            size={40}
            className="absolute top-6 right-6 text-cream-border fill-cream-border"
            aria-hidden
          />

          {/* Stars */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EASE_PREMIUM }}
              >
                <Star size={16} className="fill-[#F59E0B] text-[#F59E0B]" />
              </motion.div>
            ))}
          </div>

          {/* Text */}
          <blockquote className="font-body text-base sm:text-lg text-charcoal leading-relaxed mb-6">
            "{t.text}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading font-black text-sm flex-shrink-0"
              style={{ backgroundColor: t.color }}
              aria-hidden
            >
              {t.initials}
            </div>
            <div>
              <p className="font-heading font-bold text-charcoal text-sm">{t.name}</p>
              <p className="font-body text-xs text-muted">{t.handle}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Arrows ── */}
      <motion.button
        onClick={prev}
        whileHover={{ scale: 1.08, backgroundColor: '#1A1A1A', color: '#ffffff' }}
        whileTap={{ scale: 0.93 }}
        transition={{ duration: 0.18, ease: EASE_PREMIUM }}
        aria-label="Testimonio anterior"
        className="absolute -left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-cream-border shadow-sm text-charcoal"
      >
        <ChevronLeft size={16} />
      </motion.button>

      <motion.button
        onClick={next}
        whileHover={{ scale: 1.08, backgroundColor: '#1A1A1A', color: '#ffffff' }}
        whileTap={{ scale: 0.93 }}
        transition={{ duration: 0.18, ease: EASE_PREMIUM }}
        aria-label="Siguiente testimonio"
        className="absolute -right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-cream-border shadow-sm text-charcoal"
      >
        <ChevronRight size={16} />
      </motion.button>

      {/* ── Dot indicators ── */}
      <div
        className="flex justify-center items-center gap-2 mt-6"
        role="tablist"
        aria-label="Testimonios"
      >
        {items.map((_, i) => (
          <motion.button
            key={i}
            role="tab"
            onClick={() => go(i)}
            aria-label={`Ir al testimonio ${i + 1}`}
            aria-selected={i === current}
            animate={{
              width: i === current ? 20 : 8,
              backgroundColor: i === current ? '#93326e' : '#E8E2D9',
            }}
            transition={{ duration: 0.28, ease: EASE_PREMIUM }}
            className="h-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mora"
          />
        ))}
      </div>
    </div>
  )
}
