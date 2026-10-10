export const formatPrice = value => `$${value.toLocaleString('es-CL')}`;

/** Misma política de despacho que la previsualización de la tienda web. */
export function calculateCart(cart, shippingFee, threshold) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isFreeShipping = itemCount > 0 && subtotal >= threshold;
  const shipping = itemCount === 0 || isFreeShipping ? 0 : shippingFee;
  return {
    subtotal, itemCount, shipping, total: subtotal + shipping, isFreeShipping,
    amountNeeded: Math.max(0, threshold - subtotal),
    progress: threshold > 0 ? Math.min(100, Math.max(0, subtotal / threshold * 100)) : 100,
  };
}
