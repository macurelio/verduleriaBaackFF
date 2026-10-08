import { api } from './client'

export interface OrderItemInput {
  productId: string
  quantity: number
}

export interface CreateOrderInput {
  customerName: string
  phone: string
  address: string
  comuna: string
  /** Fecha ISO `YYYY-MM-DD` */
  deliveryDate: string
  deliveryWindow: string
  paymentMethod: string
  notes?: string
  items: OrderItemInput[]
}

export interface CreateOrderResponse {
  id: string
  code: string
  status: string
  subtotal: number
  shipping: number
  total: number
  whatsappUrl: string
  createdAt: string
}

/** Crea el pedido en el backend y devuelve el link wa.me generado en servidor. */
export function createOrder(input: CreateOrderInput): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/orders', {
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    comuna: input.comuna,
    deliveryDate: input.deliveryDate,
    deliveryWindow: input.deliveryWindow,
    paymentMethod: input.paymentMethod,
    notes: input.notes || null,
    items: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  })
}