import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity = 1) => {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return;
    const cartItemId = product.id;
    setCart(currentCart => {
      const existing = currentCart.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return currentCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, ...product, quantity: Math.min(99, item.quantity + quantity) } : item
        );
      }
      return [...currentCart, { ...product, cartItemId, quantity: Math.min(99, quantity) }];
    });
  };

  const incrementQuantity = (cartItemId) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item
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
