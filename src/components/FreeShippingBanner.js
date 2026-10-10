import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';
import { FREE_SHIPPING_OVER, SHIPPING_FEE, DELIVERY_ZONE } from '../config';
import { calculateCart, formatPrice } from '../utils/cart';
import { theme } from '../theme';

export default function FreeShippingBanner({ subtotal } = {}) {
  const { cart } = useContext(CartContext);
  const { isFreeShipping, amountNeeded, progress } = calculateCart(subtotal === undefined ? cart : [{ price: subtotal, quantity: 1 }], SHIPPING_FEE, FREE_SHIPPING_OVER);
  return <View style={styles.banner}>
    <Text accessibilityLiveRegion="polite" style={styles.title}>{isFreeShipping ? 'Tu pedido tiene despacho gratis' : `Te faltan ${formatPrice(amountNeeded)} para despacho gratis`}</Text>
    <Text style={styles.hint}>Desde {formatPrice(FREE_SHIPPING_OVER)} · {DELIVERY_ZONE}</Text>
    <View accessibilityRole="progressbar" accessibilityLabel="Progreso hacia despacho gratis" accessibilityValue={{ min: 0, max: 100, now: Math.floor(progress) }} style={styles.track}><View style={[styles.progress, { width: `${progress}%` }]} /></View>
  </View>;
}

const styles = StyleSheet.create({
  banner: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 16, marginVertical: 12 },
  title: { color: theme.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  hint: { color: theme.muted, fontSize: 12, marginTop: 6 },
  track: { height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden', marginTop: 12 },
  progress: { height: 8, backgroundColor: theme.accent, borderRadius: 4 },
});
