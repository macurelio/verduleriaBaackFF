export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ProductUnit = 'kilo' | 'unidad' | 'atado' | 'bolsa' | 'docena' | 'pack'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  unit: ProductUnit
  emoji: string
  badge: string | null
  gradientFrom: string
  gradientTo: string
  category: string
  featured: boolean
  active?: boolean
}

export interface ProductInput {
  id: string
  name: string
  description: string
  price: number
  unit: ProductUnit
  emoji: string
  badge: string | null
  gradientFrom: string
  gradientTo: string
  category: string
  featured: boolean
}

export interface Promotion {
  id: string
  label: string
  title: string
  subtitle: string | null
  description: string
  originalPrice: number
  promoPrice: number
  savings: number
  badge: string
  emoji: string
  gradientFrom: string
  gradientTo: string
  tag: string
  items: string[]
  targetCategory: string | null
  primaryLabel: string
  validFrom: string | null
  validTo: string | null
  sortOrder: number
  active: boolean
}

export interface PromotionInput {
  id: string
  label: string
  title: string
  subtitle: string | null
  description: string
  originalPrice: number
  promoPrice: number
  badge: string
  emoji: string
  gradientFrom: string
  gradientTo: string
  tag: string
  items: string[]
  targetCategory: string | null
  primaryLabel: string
  validFrom: string | null
  validTo: string | null
  sortOrder: number
  active: boolean
}

export interface Category {
  id: number
  name: string
  emoji: string
  blurb: string
  sortOrder: number
  active: boolean
}

export interface CategoryInput {
  name: string
  emoji: string
  blurb: string
  sortOrder: number
  active: boolean
}

export interface OrderItem {
  packId?: string | null
  productId: string
  productName: string
  unit: ProductUnit
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'

export interface Order {
  grossSubtotal?: number
  packDiscount?: number
  couponDiscount?: number
  couponCode?: string | null
  id: string
  code: string
  customerName: string
  phone: string
  address: string
  comuna: string
  deliveryDate: string
  deliveryWindow: string
  paymentMethod: string
  notes: string | null
  subtotal: number
  shipping: number
  total: number
  status: OrderStatus
  whatsappUrl: string
  createdAt: string
  items: OrderItem[]
}

export interface SiteConfig {
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

export interface AdminUser {
  id: number
  username: string
  role: string
  enabled: boolean
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface MeResponse {
  id: number
  username: string
  role: string
  enabled: boolean
}
export interface CouponInput {
  name: string
  percentage: number
  active: boolean
}

export interface Coupon extends CouponInput {
  id: string
}
