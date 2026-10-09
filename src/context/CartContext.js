import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const cartItemId = product.id;
    setCart(currentCart => {
      const existing = currentCart.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return currentCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, ...product, quantity: Math.min(99, item.quantity + 1) } : item
        );
      }
      return [...currentCart, { ...product, cartItemId, quantity: 1 }];
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

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
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
