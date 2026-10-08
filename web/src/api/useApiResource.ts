import { useEffect, useState } from 'react'

/**
 * Caché en módulo: mientras una key esté en vuelo (o ya resuelta) no se vuelve a
 * pedir al servidor. Si falla, se limpia para reintentar en el próximo montaje.
 */
const inFlight = new Map<string, Promise<unknown>>()

/**
 * Carga un recurso remoto una sola vez (cacheado durante la sesión) y usa
 * `fallback` mientras carga o si la API no responde.
 */
export function useApiResource<T>(key: string, loader: () => Promise<T>, fallback: T): T {
  const [data, setData] = useState<T>(fallback)

  useEffect(() => {
    let alive = true
    let pending = inFlight.get(key) as Promise<T> | undefined
    if (!pending) {
      pending = loader()
        .catch(() => {
          inFlight.delete(key)
          return fallback
        })
        .then((value) => value as T)
      inFlight.set(key, pending as Promise<unknown>)
    }
    pending.then((value) => {
      if (alive) setData(value)
    })
    return () => {
      alive = false
    }
  }, [key])

  return data
}