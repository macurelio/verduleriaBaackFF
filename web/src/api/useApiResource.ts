import { useEffect, useRef, useState } from 'react'

/**
 * Comparte peticiones entre componentes y revalida al minuto o al volver a la
 * pestaña. Si falla, conserva el último dato válido y permite reintentar.
 */
const inFlight = new Map<string, Promise<unknown>>()
const resolvedAt = new Map<string, number>()
const REFRESH_MS = 60_000

/**
 * Usa el fallback inicial mientras carga. Los fallos posteriores no reemplazan
 * datos remotos ya cargados por el catálogo estático.
 */
export function useApiResource<T>(key: string, loader: () => Promise<T>, fallback: T): T {
  const [data, setData] = useState<T>(fallback)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  useEffect(() => {
    let alive = true
    const refresh = () => {
      if (document.visibilityState === 'hidden') return
      if (Date.now() - (resolvedAt.get(key) ?? 0) >= REFRESH_MS) {
        inFlight.delete(key)
        resolvedAt.set(key, Date.now())
      }
      let pending = inFlight.get(key) as Promise<T> | undefined
      if (!pending) {
        pending = loaderRef.current().catch((error: unknown) => {
          inFlight.delete(key)
          resolvedAt.delete(key)
          throw error
        })
        inFlight.set(key, pending)
        resolvedAt.set(key, Date.now())
      }
      pending.then((value) => { if (alive) setData(value) }).catch(() => { /* Keep the last successful data or initial fallback. */ })
    }
    refresh()
    const timer = window.setInterval(refresh, REFRESH_MS)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      alive = false
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [key])

  return data
}
