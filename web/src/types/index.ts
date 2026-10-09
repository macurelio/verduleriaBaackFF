import type { ReactNode } from 'react'

// ─── Product ─────────────────────────────────────────────────────────────────

export type Unit = 'kilo' | 'unidad' | 'atado' | 'bolsa' | 'docena' | 'pack'

export type ProductCategory =
  | 'Hojas Verdes'
  | 'Raíces y Tubérculos'
  | 'Frutas'
  | 'Hierbas y Aromáticas'
  | 'Packs'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  /** Precio en CLP por la unidad de venta (kg, unidad, atado…) */
  price: number
  unit: Unit
  emoji: string
  badge: string | null
  gradientFrom: string
  gradientTo: string
  featured?: boolean
  source?: 'promotion'
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryMeta {
  name: ProductCategory
  emoji: string
  blurb: string
}

// ─── Hero Slide ──────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp'

export interface HeroSlide {
  id: number
  badge: string
  title: string
  subtitle: string
  cta: string
  ctaHref: string
  ctaVariant: ButtonVariant
  bg: string
  accent: string
  subtitleColor: string
  emoji?: string
  image?: string
  imageAlt?: string
}

// ─── Carousel hook ───────────────────────────────────────────────────────────

export interface UseCarouselOptions {
  autoPlay?: boolean
  interval?: number
}

export interface UseCarouselReturn {
  current: number
  go: (index: number) => void
  prev: () => void
  next: () => void
  pause: () => void
  resume: () => void
}

// ─── ProductCard props ───────────────────────────────────────────────────────

export interface ProductCardProps {
  product: Product
}

// ─── ProductCarousel props ───────────────────────────────────────────────────

export interface ProductCarouselProps {
  products: Product[]
}

// ─── Button ──────────────────────────────────────────────────────────────────

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  children?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  cartItemId: string
  quantity: number
}

export interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  incrementQuantity: (cartItemId: string) => void
  decrementQuantity: (cartItemId: string) => void
  removeItem: (cartItemId: string) => void
  getCartCount: () => number
  getCartTotal: () => number
}
