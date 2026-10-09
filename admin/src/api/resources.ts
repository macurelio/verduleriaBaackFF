import { api, ApiError } from './client'
import type {
  PageResponse,
  Product,
  ProductInput,
  Promotion,
  PromotionInput,
  Category,
  CategoryInput,
  Order,
  OrderStatus,
  SiteConfig,
  AdminUser,
  LoginResponse,
  MeResponse,
} from './types'

const ADMIN = '/admin'

export { ApiError }

export async function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { username, password }, null)
}

export async function me(): Promise<MeResponse> {
  return api.get<MeResponse>('/auth/me')
}

// ─── Productos ────────────────────────────────────────────────────────────────

export const productApi = {
  list: (search?: string, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (search) params.set('search', search)
    return api.get<PageResponse<Product>>(`${ADMIN}/products?${params}`)
  },
  create: (input: ProductInput) => api.post<Product>(`${ADMIN}/products`, input),
  update: (id: string, input: ProductInput) => api.put<Product>(`${ADMIN}/products/${id}`, input),
  setFeatured: (id: string, value: boolean) =>
    api.patch<Product>(`${ADMIN}/products/${id}/featured`, { value }),
  setActive: (id: string, value: boolean) =>
    api.patch<Product>(`${ADMIN}/products/${id}/active`, { value }),
  remove: (id: string) => api.del<void>(`${ADMIN}/products/${id}`),
}

// ─── Promociones ──────────────────────────────────────────────────────────────

export const promotionApi = {
  list: () => api.get<Promotion[]>(`${ADMIN}/promotions`),
  create: (input: PromotionInput) => api.post<Promotion>(`${ADMIN}/promotions`, input),
  update: (id: string, input: PromotionInput) =>
    api.put<Promotion>(`${ADMIN}/promotions/${id}`, input),
  setActive: (id: string, value: boolean) =>
    api.patch<Promotion>(`${ADMIN}/promotions/${id}/active`, { value }),
  reorder: (items: { id: string; sortOrder: number }[]) =>
    api.patch<void>(`${ADMIN}/promotions/reorder`, items),
  remove: (id: string) => api.del<void>(`${ADMIN}/promotions/${id}`),
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export const categoryApi = {
  list: () => api.get<Category[]>(`${ADMIN}/categories`),
  create: (input: CategoryInput) => api.post<Category>(`${ADMIN}/categories`, input),
  update: (id: number, input: CategoryInput) =>
    api.put<Category>(`${ADMIN}/categories/${id}`, input),
  remove: (id: number) => api.del<void>(`${ADMIN}/categories/${id}`),
}

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export const orderApi = {
  list: (status?: OrderStatus, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (status) params.set('status', status)
    return api.get<PageResponse<Order>>(`${ADMIN}/orders?${params}`)
  },
  get: (id: string) => api.get<Order>(`${ADMIN}/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`${ADMIN}/orders/${id}/status`, { status }),
}

// ─── Configuración ────────────────────────────────────────────────────────────

export const configApi = {
  get: () => api.get<SiteConfig>('/config'),
  update: (input: SiteConfig) => api.put<SiteConfig>(`${ADMIN}/config`, input),
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export const userApi = {
  list: () => api.get<AdminUser[]>(`${ADMIN}/users`),
  create: (username: string, password: string) =>
    api.post<AdminUser>(`${ADMIN}/users`, { username, password }),
  setEnabled: (id: number, enabled: boolean) =>
    api.patch<AdminUser>(`${ADMIN}/users/${id}`, { enabled }),
}
