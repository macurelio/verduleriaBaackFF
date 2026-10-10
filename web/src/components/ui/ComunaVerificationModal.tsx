import { useState, useMemo } from 'react'
import { MapPin, Truck, CheckCircle2, AlertCircle, Search, X, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'
import Dialog from './Dialog'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import { useLocation } from '../../context/LocationContext'

const POPULAR_COMUNAS = [
  'Providencia',
  'Las Condes',
  'Ñuñoa',
  'Santiago',
  'La Florida',
  'Maipú',
  'Vitacura',
  'La Reina',
  'San Miguel',
  'Lo Barnechea',
]

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

export default function ComunaVerificationModal() {
  const { isModalOpen, closeModal, dismissModal, saveComuna, selectedComuna } = useLocation()
  const { comunas, waLink } = useSiteConfig()
  const [query, setQuery] = useState(selectedComuna || '')
  const [selectedMatch, setSelectedMatch] = useState<string | null>(selectedComuna || null)

  const normalizedCoverage = useMemo(() => {
    const map = new Map<string, string>()
    comunas.forEach((c) => map.set(normalize(c), c))
    return map
  }, [comunas])

  // Filtrado de comunas según la búsqueda
  const filteredComunas = useMemo(() => {
    if (!query.trim()) return []
    const q = normalize(query)
    return comunas.filter((c) => normalize(c).includes(q))
  }, [comunas, query])

  // Verificación de cobertura
  const validationResult = useMemo(() => {
    const target = selectedMatch || query.trim()
    if (!target) return null
    const norm = normalize(target)
    if (normalizedCoverage.has(norm)) {
      return {
        isCovered: true,
        matchedName: normalizedCoverage.get(norm)!,
      }
    }
    // Si escribió al menos 3 letras pero no coincide con la lista oficial
    if (target.length >= 3) {
      return {
        isCovered: false,
        matchedName: target,
      }
    }
    return null
  }, [selectedMatch, query, normalizedCoverage])

  const handleSelect = (comunaName: string) => {
    setQuery(comunaName)
    setSelectedMatch(comunaName)
  }

  const handleConfirm = () => {
    if (validationResult?.isCovered) {
      saveComuna(validationResult.matchedName)
    }
  }

  return (
    <Dialog open={isModalOpen} onClose={closeModal} titleId="comuna-modal-title">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col">
        {/* Modal Card Header */}
        <div className="p-6 border-b border-stone-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/60 dark:to-teal-950/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/20 shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-heading font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles size={11} /> Despacho a Domicilio
                </span>
              </div>
              <h2
                id="comuna-modal-title"
                className="font-heading font-black text-xl text-stone-900 dark:text-white mt-1"
              >
                ¿Dónde quieres tu pedido?
              </h2>
              <p className="text-xs text-stone-600 dark:text-zinc-400 font-body mt-0.5">
                Valida si llegamos a tu comuna antes de armar tu canasta.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissModal}
            aria-label="Cerrar ventana de validación"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-xl hover:bg-white/80 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Card Body */}
        <div className="p-6 space-y-5">
          {/* Search Input */}
          <div>
            <label htmlFor="comuna-search-input" className="block text-xs font-heading font-bold text-stone-700 dark:text-zinc-300 mb-1.5">
              Ingresa o busca tu comuna en Santiago:
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
              />
              <input
                id="comuna-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedMatch(null)
                }}
                placeholder="Ej: Providencia, Ñuñoa, Las Condes..."
                className="w-full text-sm pl-10 pr-9 py-3 rounded-2xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-body transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSelectedMatch(null)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown List */}
            {filteredComunas.length > 0 && !selectedMatch && (
              <div className="mt-2 bg-white dark:bg-zinc-800 rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                {filteredComunas.map((comuna) => (
                  <button
                    key={comuna}
                    type="button"
                    onClick={() => handleSelect(comuna)}
                    className="w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-800 dark:text-zinc-200 flex items-center justify-between border-b border-stone-100 dark:border-zinc-700/60 last:border-0 transition"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={13} className="text-emerald-600 shrink-0" />
                      <span>{comuna}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                      Cobertura activa
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Select Chips */}
          <div>
            <p className="text-[11px] font-heading font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Comunas con reparto frecuente:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_COMUNAS.map((comuna) => {
                const isSelected = selectedMatch === comuna || normalize(query) === normalize(comuna)
                return (
                  <button
                    key={comuna}
                    type="button"
                    onClick={() => handleSelect(comuna)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-stone-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-stone-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700'
                    }`}
                  >
                    <MapPin size={11} className={isSelected ? 'text-white' : 'text-emerald-600'} />
                    <span>{comuna}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Validation Feedback Card */}
          {validationResult && (
            <div className="transition-all animate-fadeIn">
              {validationResult.isCovered ? (
                /* Éxito: Comuna con Cobertura */
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading font-black text-sm text-emerald-950 dark:text-emerald-100">
                        ¡Excelente noticia! Sí despachamos a {validationResult.matchedName} 🎉
                      </h3>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-body mt-0.5">
                        Tus frutas y verduras llegarán frescas el mismo día de la cosecha.
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] space-y-1 text-emerald-900 dark:text-emerald-200 bg-white/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Envíos gratis:</strong> en pedidos sobre $20.000 (o $2.500 tarifa plana).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span><strong>Horarios:</strong> mañana (9:00 a 13:00) y tarde (14:00 a 19:00).</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
                  >
                    <span>Confirmar y Comenzar a Comprar</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                /* Alerta: Comuna fuera de cobertura */
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-heading font-black text-sm text-amber-950 dark:text-amber-100">
                        Por ahora no tenemos reparto regular en {validationResult.matchedName} 📦
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-body mt-0.5">
                        Actualmente cubrimos 20 comunas del Gran Santiago. Si necesitas un pedido grande o para oficina, podemos coordinar un despacho especial.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={waLink(`¡Hola! Vivo en ${validationResult.matchedName} y me gustaría consultar si pueden coordinar un despacho especial 🥬`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-heading font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <MessageCircle size={15} />
                      <span>Consultar por WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        setSelectedMatch(null)
                      }}
                      className="py-2.5 px-3 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-heading font-bold text-xs hover:bg-amber-100/50 transition"
                    >
                      Probar otra comuna
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Card Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-stone-500 dark:text-zinc-400">
            🌱 20 comunas con cobertura en Gran Santiago
          </span>
          <button
            type="button"
            onClick={dismissModal}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-heading font-bold text-xs underline underline-offset-2 transition cursor-pointer"
          >
            Explorar tienda primero →
          </button>
        </div>
      </div>
    </Dialog>
  )
}
