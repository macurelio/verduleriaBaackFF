import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { products } from '../data/products';
import { CartContext } from '../context/CartContext';
import { UNIT_LABELS } from '../config';
import { formatPrice } from '../utils/cart';
import { theme } from '../theme';
import { orderLines } from '../api/orders';

export default function PackBuilder() {
  const { cart, addCustomPack } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');
  const eligible = products.filter(product => product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion');
  const selection = eligible.filter(product => quantities[product.id] > 0).map(product => ({ product, quantity: quantities[product.id] }));
  const subtotal = selection.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const percentage = selection.length >= 6 ? 15 : selection.length >= 4 ? 10 : 0;
  const total = subtotal - Math.floor(subtotal * percentage / 100);
  const change = (id, quantity) => { setMessage(''); setQuantities(previous => ({ ...previous, [id]: quantity })); };
  const add = () => {
    if (!addCustomPack(selection)) { setMessage('Elige al menos 4 productos distintos. El límite por producto en el pedido es 99.'); return; }
    setQuantities({}); setMessage('Tu pack personalizado se agregó al carrito.');
  };
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Arma tu pack personalizado</Text>
    <Text style={styles.copy}>Elige productos según su unidad de venta.</Text>
    {eligible.map(product => {
      const quantity = quantities[product.id] || 0;
      const remaining = 99 - orderLines(cart).filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
      return <View key={product.id} style={styles.row}>
        <View style={styles.name}><Text style={styles.text}>{product.emoji} {product.name}</Text><Text style={styles.copy}>{formatPrice(product.price)} / {UNIT_LABELS[product.unit]}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Quitar ${product.name} de la selección`} disabled={!quantity} onPress={() => change(product.id, quantity - 1)} style={styles.control}><Text style={styles.text}>−</Text></TouchableOpacity>
        <Text style={styles.text}>{quantity}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Agregar ${product.name} a la selección`} disabled={quantity >= remaining} onPress={() => change(product.id, quantity + 1)} style={styles.control}><Text style={styles.text}>+</Text></TouchableOpacity>
      </View>;
    })}
    <Text style={styles.text}>{selection.length} productos distintos · {formatPrice(total)}</Text>
    <Text style={styles.copy}>4 productos distintos: 10 %. Desde 6: 15 %. El envío se calcula en el carrito.</Text>
    <TouchableOpacity accessibilityRole="button" disabled={selection.length < 4} onPress={add} style={[styles.button, selection.length < 4 && { opacity: 0.5 }]}><Text style={styles.buttonText}>Agregar pack al carrito</Text></TouchableOpacity>
    <Text accessibilityLiveRegion="polite" style={styles.copy}>{message}</Text>
  </View>;
}

const styles = StyleSheet.create({
  section: { padding: 20, gap: 12, backgroundColor: theme.surface },
  heading: { fontSize: 24, fontWeight: '700', color: theme.text },
  text: { color: theme.text, fontSize: 16 },
  copy: { color: theme.muted, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.border },
  name: { flex: 1 },
  control: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.soft, borderRadius: 10 },
  button: { backgroundColor: theme.accent, minHeight: 48, borderRadius: 12, padding: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: theme.onAccent, fontSize: 16, fontWeight: '700' },
});
