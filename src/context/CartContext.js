import React, { createContext, useState } from 'react';
import { orderLines } from '../api/orders';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const canAdd = (components, current) => components.every(({ product, quantity }) => quantity + orderLines(current).filter(line => line.productId === product.id).reduce((sum, line) => sum + line.quantity, 0) <= 99);
  const addCustomPack = (components) => {
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
    const cartItemId = product.id;
    setCart(currentCart => {
      const already = orderLines(currentCart).filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
      const addedQuantity = Math.min(quantity, 99 - already);
      if (addedQuantity <= 0) return currentCart;
      const existing = currentCart.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return currentCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, ...product, quantity: item.quantity + addedQuantity } : item
        );
      }
      return [...currentCart, { ...product, cartItemId, quantity: addedQuantity }];
    });
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

  const addSelection = (items) => {
    if (!items.length || new Set(items.map(({ product }) => product.id)).size !== items.length ||
      items.some(({ product, quantity }) => !Number.isSafeInteger(quantity) || quantity < 1 ||
        quantity + (cart.find(item => item.id === product.id)?.quantity || 0) > 99)) return false;
    setCart(previous => {
      if (items.some(({ product, quantity }) => quantity + (previous.find(item => item.id === product.id)?.quantity || 0) > 99)) return previous;
      const next = [...previous];
      items.forEach(({ product, quantity }) => {
        const index = next.findIndex(item => item.id === product.id);
        if (index >= 0) next[index] = { ...next[index], ...product, quantity: next[index].quantity + quantity };
        else next.push({ ...product, cartItemId: product.id, quantity });
      });
      return next;
    });
    return true;
  };

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      addSelection,
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
