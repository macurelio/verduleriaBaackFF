import { fetchSiteConfig, type SiteConfigResponse } from '../api/catalog'
import { useApiResource } from '../api/useApiResource'
import * as defaults from '../config'

const fallback: SiteConfigResponse = {
  brandName: defaults.BRAND_NAME,
  whatsappNumber: defaults.WHATSAPP_NUMBER,
  instagramHandle: defaults.INSTAGRAM_HANDLE,
  instagramUrl: defaults.INSTAGRAM_URL,
  deliveryZone: defaults.DELIVERY_ZONE,
  shippingFee: defaults.SHIPPING_FEE,
  freeShippingOver: defaults.FREE_SHIPPING_OVER,
  comunas: [...defaults.COMUNAS],
  paymentMethods: [...defaults.PAYMENT_METHODS],
  deliveryWindows: [...defaults.DELIVERY_WINDOWS],
}

export function useSiteConfig() {
  const config = useApiResource('config', fetchSiteConfig, fallback)
  return {
    ...config,
    waLink: (message: string) =>
      `https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
  }
}
