import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { products } from '../data/products';
import { CartContext } from '../context/CartContext';
import { UNIT_LABELS } from '../config';
import { formatPrice } from '../utils/cart';
import { theme } from '../theme';

export default function PackBuilder() {
  const { cart, addSelection } = useContext(CartContext);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState('');
  const eligible = products.filter(product => product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion');
  const selection = eligible.filter(product => quantities[product.id] > 0).map(product => ({ product, quantity: quantities[product.id] }));
  const subtotal = selection.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const change = (id, quantity) => { setMessage(''); setQuantities(previous => ({ ...previous, [id]: quantity })); };
  const add = () => {
    if (!addSelection(selection)) { setMessage('Revisa las cantidades. El límite por producto es 99.'); return; }
    setQuantities({}); setMessage('Tu selección se agregó al carrito.');
  };
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Arma tu selección</Text>
    <Text style={styles.copy}>Elige productos según su unidad de venta.</Text>
    {eligible.map(product => {
      const quantity = quantities[product.id] || 0;
      const remaining = 99 - (cart.find(item => item.id === product.id)?.quantity || 0);
      return <View key={product.id} style={styles.row}>
        <View style={styles.name}><Text style={styles.text}>{product.emoji} {product.name}</Text><Text style={styles.copy}>{formatPrice(product.price)} / {UNIT_LABELS[product.unit]}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Quitar ${product.name} de la selección`} disabled={!quantity} onPress={() => change(product.id, quantity - 1)} style={styles.control}><Text style={styles.text}>−</Text></TouchableOpacity>
        <Text style={styles.text}>{quantity}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Agregar ${product.name} a la selección`} disabled={quantity >= remaining} onPress={() => change(product.id, quantity + 1)} style={styles.control}><Text style={styles.text}>+</Text></TouchableOpacity>
      </View>;
    })}
    <Text style={styles.text}>{selection.length} productos distintos · {formatPrice(subtotal)}</Text>
    <Text style={styles.copy}>Precio de catálogo. El envío se calcula en el carrito.</Text>
    <TouchableOpacity accessibilityRole="button" disabled={!selection.length} onPress={add} style={[styles.button, !selection.length && { opacity: 0.5 }]}><Text style={styles.buttonText}>Agregar selección al carrito</Text></TouchableOpacity>
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
