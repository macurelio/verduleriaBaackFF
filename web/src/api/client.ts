/**
 * Cliente HTTP hacia mora-verduras-api.
 * La URL base se configura con VITE_API_URL (`.env` / `.env.development`).
 * Fallback a la API desplegada para que el build de Pages funcione incluso
 * sin la variable de entorno.
 */
export const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'https://mora-verduras-api.onrender.com/api/v1'
).replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options
  const init: RequestInit = {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }
  if (body !== undefined) init.body = JSON.stringify(body)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (!res.ok) {
    let detail = `Error ${res.status}`
    try {
      const problem = (await res.json()) as { detail?: string; title?: string }
      detail = problem.detail ?? problem.title ?? detail
    } catch {
      /* sin cuerpo JSON */
    }
    throw new ApiError(res.status, detail)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { token, method: 'GET' }),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'PUT', body, token }),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body, token }),
  del: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE', token }),
}