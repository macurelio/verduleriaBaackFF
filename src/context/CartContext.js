import React, { createContext, useState } from 'react';
import { calculatePack } from '../utils/pack';
import { orderLines } from '../api/orders';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [packQuantities, setPackQuantities] = useState({});
  const canAdd = (components, current) => components.every(({ product, quantity }) => quantity + orderLines(current).filter(line => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0) <= 99);
  const addCustomPack = (components) => {
    if (!calculatePack(components).eligible) return false;
    const ids = new Set(components.map(component => component.product.id));
    if (ids.size < 4 || ids.size !== components.length || components.some(component => component.product.unit === 'pack' || component.product.category === 'Packs' || !Number.isInteger(component.quantity) || component.quantity < 1 || component.quantity > 99) || !canAdd(components, cart)) return false;
    const gross = components.reduce((sum, component) => sum + component.product.price * component.quantity, 0);
    const percentage = ids.size >= 6 ? 15 : 10;
    const id = `pack-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const item = { id, cartItemId: id, name: 'Pack personalizado', unit: 'pack', emoji: '🧺', category: 'Packs', quantity: 1, price: gross - Math.floor(gross * percentage / 100), source: 'custom-pack', components };
    setCart(previous => canAdd(components, previous) ? [...previous, item] : previous);
    return true;
  };

  const addToCart = (product, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    if (product.unit === 'pack' || product.category === 'Packs' || product.source === 'promotion') return;
    setPackQuantities(previous => ({ ...previous, [product.id]: Math.min(99 - orderLines(cart).filter(line => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0), (previous[product.id] || 0) + quantity) }));
  };

  const incrementQuantity = (cartItemId) => {
    setCart(currentCart =>
      currentCart.map(item =>
          item.cartItemId === cartItemId && canAdd(item.components || [{ product: item, quantity: 1 }], currentCart) ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item
      )
    );
  };

  const decrementQuantity = (cartItemId) => {
    setCart(currentCart =>
      currentCart.flatMap(item => item.cartItemId !== cartItemId ? [item]
        : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [])
    );
  };

  const removeItem = (cartItemId) => {
    setCart(currentCart => currentCart.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      packQuantities,
      setPackQuantities,
      addCustomPack,
      incrementQuantity,
      decrementQuantity,
      removeItem,
      clearCart,
      getCartCount,
      getTotalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};
