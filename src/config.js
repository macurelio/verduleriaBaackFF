/**
 * Configuración central de Mora Verduras (app Expo).
 * Espeja web/src/config.ts para mantener ambos catálogos sincronizados.
 */

export const BRAND_NAME = 'Mora Verduras';

export const WHATSAPP_NUMBER = '+56995778113';
export const WHATSAPP_NUMBER_RAW = WHATSAPP_NUMBER.replace(/\D/g, '');

export const INSTAGRAM_HANDLE = '@mora.verduras';
export const INSTAGRAM_URL = 'https://www.instagram.com/mora.verduras';

export const DELIVERY_ZONE = 'Gran Santiago';

export const SHIPPING_FEE = 2500;
export const FREE_SHIPPING_OVER = 20000;

export const COMUNAS = [
  'Santiago',
  'Providencia',
  'Ñuñoa',
  'La Reina',
  'Macul',
  'Peñalolén',
  'La Florida',
  'Maipú',
  'Cerrillos',
  'Estación Central',
  'Quilicura',
  'Huechuraba',
  'Vitacura',
  'Las Condes',
  'Lo Barnechea',
  'Puente Alto',
  'San Miguel',
  'La Cisterna',
  'Independencia',
  'Recoleta',
];

export const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'Contra entrega'];

export const DELIVERY_WINDOWS = ['Mañana (9:00 – 13:00)', 'Tarde (14:00 – 19:00)'];

export const UNIT_LABELS = {
  kilo: 'por kg',
  unidad: 'por unidad',
  atado: 'por atado',
  bolsa: 'por bolsa',
  docena: 'por docena',
  pack: 'pack',
};

/** Link wa.me con mensaje precodificado. */
export function waLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER_RAW}?text=${encodeURIComponent(message)}`;
}

/** Abre WhatsApp intentando primero el esquema nativo. */
export function openWhatsApp(message) {
  const { Linking } = require('react-native');
  const text = encodeURIComponent(message);
  return Linking.openURL(`whatsapp://send?text=${text}&phone=${WHATSAPP_NUMBER_RAW}`).catch(() =>
    Linking.openURL(waLink(message)),
  );
}
export const API_URL = 'https://mora-verduras-api.onrender.com/api/v1';
