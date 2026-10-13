import { api } from './client'
import type { Product, CategoryMeta } from '../types'

// ─── DTOs del backend (mora-verduras-api) ────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiProductResponse {
  id: string
  name: string
  category: string
  description: string
  price: number
  unit: Product['unit']
  emoji: string
  badge: string | null
  gradientFrom: string
  gradientTo: string
  featured: boolean
}

export interface ApiCategoryResponse {
  id: number
  name: string
  emoji: string
  blurb: string
  sortOrder: number
  active: boolean
}

export interface SiteConfigResponse {
  brandName: string
  whatsappNumber: string
  instagramHandle: string
  instagramUrl: string
  deliveryZone: string
  shippingFee: number
  freeShippingOver: number
  comunas: string[]
  paymentMethods: string[]
  deliveryWindows: string[]
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

const PRODUCTS_SIZE = 100

export async function fetchProducts(): Promise<Product[]> {
  const products: ApiProductResponse[] = []
  let pageNumber = 0
  let totalPages = 1
  do {
    const page = await api.get<PageResponse<ApiProductResponse>>(
      `/products?page=${pageNumber}&size=${PRODUCTS_SIZE}&active=true`,
    )
    products.push(...page.content)
    totalPages = page.totalPages
    pageNumber += 1
  } while (pageNumber < totalPages)
  return products.map((product) => ({
    ...product,
    category: product.category as Product['category'],
  }))
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  const list = await api.get<ApiCategoryResponse[]>('/categories')
  return list
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ name, emoji, blurb }) => ({ name: name as CategoryMeta['name'], emoji, blurb }))
}

export function fetchSiteConfig(): Promise<SiteConfigResponse> {
  return api.get<SiteConfigResponse>('/config')
}
