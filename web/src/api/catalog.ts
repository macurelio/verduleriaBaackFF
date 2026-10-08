import { api } from './client'
import type { Product, Testimonial, CategoryMeta } from '../types'
import type { Promo } from '../data/promos'

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

export interface ApiPromotionResponse extends Promo {
  subtitle: string
  targetCategory: string | null
  primaryLabel: string
  validFrom: string | null
  validTo: string | null
  sortOrder: number
  active: boolean
}

export interface ApiTestimonialResponse extends Testimonial {
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
  const page = await api.get<PageResponse<ApiProductResponse>>(
    `/products?page=0&size=${PRODUCTS_SIZE}&active=true`,
  )
  return page.content.map(
    ({ category, featured: _featured, ...product }) => ({
      ...product,
      category: category as Product['category'],
    }),
  )
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  const list = await api.get<ApiCategoryResponse[]>('/categories')
  return list
    .filter((c) => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ name, emoji, blurb }) => ({ name: name as CategoryMeta['name'], emoji, blurb }))
}

export async function fetchPromotions(): Promise<Promo[]> {
  const list = await api.get<ApiPromotionResponse[]>('/promotions')
  return list
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ subtitle: _subtitle, targetCategory: _tc, primaryLabel: _pl, validFrom: _vf, validTo: _vt, sortOrder: _so, active: _a, ...promo }) => promo)
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const list = await api.get<ApiTestimonialResponse[]>('/testimonials')
  return list
    .filter((t) => t.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, active: _active, ...testimonial }) => testimonial)
}

export async function fetchSiteConfig(): Promise<SiteConfigResponse | null> {
  try {
    return await api.get<SiteConfigResponse>('/config')
  } catch {
    return null
  }
}