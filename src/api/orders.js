import { API_URL } from '../config';
export const orderLines = cart => cart.flatMap(item => item.components
  ? item.components.map(({ product, quantity }) => ({ productId: product.id, quantity: quantity * item.quantity, packId: item.cartItemId }))
  : [{ productId: item.id, quantity: item.quantity }]);

export async function postOrderApi(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`${API_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'No se pudo validar el pedido.');
    return data;
  } finally { clearTimeout(timer); }
}
