import { api } from './client'

export interface AssistantRequest {
  message: string
}

export interface AssistantProductItem {
  name: string
  price: number
  unit: string
  emoji: string
}

export interface AssistantPromoItem {
  title: string
  badge: string
  emoji: string
  promoPrice: number
  originalPrice: number
  savings: number
}

export interface AssistantData {
  comunas?: string[]
  shippingFee?: number
  freeShippingOver?: number
  paymentMethods?: string[]
  deliveryWindows?: string[]
  products?: AssistantProductItem[]
  promotions?: AssistantPromoItem[]
  whatsappUrl?: string
  code?: string
  status?: string
  total?: number
  [key: string]: unknown
}

export interface AssistantResponse {
  reply: string
  type: string
  quickReplies: string[]
  data?: AssistantData
}

/**
 * Consulta al asistente virtual de Mora Verduras.
 * Se comunica con POST /api/v1/assistant/chat
 */
export function askAssistant(message: string): Promise<AssistantResponse> {
  return api.post<AssistantResponse>('/assistant/chat', { message })
}
