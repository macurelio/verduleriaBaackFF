import { PACK_MIN_EXCLUSIVE } from '../config';

export function calculatePack(components) {
  const ids = new Set(components.map(({ product }) => product.id));
  const valid = ids.size === components.length && components.every(({ product, quantity }) => product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion' && Number.isSafeInteger(product.price) && product.price >= 0 && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 99);
  const subtotal = components.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const discountPercent = ids.size >= 6 ? 15 : ids.size >= 4 ? 10 : 0;
  const total = subtotal - Math.floor(subtotal * discountPercent / 100);
  return { total, discountPercent, eligible: valid && ids.size >= 4 && total > PACK_MIN_EXCLUSIVE };
}
