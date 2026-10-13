import React, { useContext, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { suggestedPacks } from '../data/suggestedPacks';
import { products } from '../data/products';
import { CartContext } from '../context/CartContext';
import { getProduceImage } from '../produce';
import { calculatePack } from '../utils/pack';
import { UNIT_LABELS, PACK_MIN_EXCLUSIVE } from '../config';
import { formatPrice } from '../utils/cart';
import { theme } from '../theme';
import { orderLines } from '../api/orders';

export default function PackBuilder() {
  const { cart, addCustomPack, packQuantities: quantities, setPackQuantities: setQuantities } = useContext(CartContext);
  const [message, setMessage] = useState('');
  const eligible = products.filter(product => product.unit !== 'pack' && product.category !== 'Packs' && product.source !== 'promotion');
  const selection = eligible.filter(product => quantities[product.id] > 0).map(product => ({ product, quantity: quantities[product.id] }));
  const { total, eligible: ready } = calculatePack(selection);
  const change = (id, quantity) => { setMessage(''); setQuantities(previous => ({ ...previous, [id]: quantity })); };
  const add = () => {
    if (!addCustomPack(selection)) { setMessage('Elige al menos 4 productos distintos y supera $10.000 después del descuento. El límite por producto es 99.'); return; }
    setQuantities({}); setMessage('Tu pack personalizado se agregó al carrito.');
  };
  return <View style={styles.section}>
    <Text accessibilityRole="header" style={styles.heading}>Arma tu pack personalizado</Text>
    <Text style={styles.copy}>Elige al menos 4 productos distintos. Cada pack debe superar {formatPrice(PACK_MIN_EXCLUSIVE)} después del descuento, sin envío.</Text>
    <Text style={styles.heading}>Packs sugeridos</Text>
    {suggestedPacks.map(pack => {
      const components = pack.lines.map(line => ({ product: eligible.find(product => product.id === line.productId), quantity: line.quantity })).filter(line => line.product);
      const amounts = calculatePack(components);
      if (!amounts.eligible) return null;
      return <TouchableOpacity key={pack.id} accessibilityRole="button" onPress={() => { setMessage(''); setQuantities(Object.fromEntries(components.map(({ product, quantity }) => [product.id, quantity]))); }} style={[styles.row, { flexWrap: 'wrap' }]}>
        <Image source={getProduceImage(components[0].product)} style={{ width: 64, height: 64, borderRadius: 8 }} />
        <View style={styles.name}><Text style={styles.text}>{pack.title} · {formatPrice(amounts.total)}</Text><Text style={styles.copy}>{pack.description}</Text><Text style={styles.copy}>Personalizar pack</Text></View>
      </TouchableOpacity>;
    })}
    <Text style={styles.heading}>Elige tus productos</Text>
    {eligible.map(product => {
      const quantity = quantities[product.id] || 0;
      const remaining = 99 - orderLines(cart).filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
      return <View key={product.id} style={styles.row}>
        <Image source={getProduceImage(product)} accessibilityLabel={product.name} style={{ width: 48, height: 48, borderRadius: 8 }} /><View style={styles.name}><Text style={styles.text}>{product.emoji} {product.name}</Text><Text style={styles.copy}>{formatPrice(product.price)} / {UNIT_LABELS[product.unit]}</Text></View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Quitar ${product.name} de la selección`} disabled={!quantity} onPress={() => change(product.id, quantity - 1)} style={styles.control}><Text style={styles.text}>−</Text></TouchableOpacity>
        <Text style={styles.text}>{quantity}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Agregar ${product.name} a la selección`} disabled={quantity >= remaining} onPress={() => change(product.id, quantity + 1)} style={styles.control}><Text style={styles.text}>+</Text></TouchableOpacity>
      </View>;
    })}
    <Text style={styles.text}>{selection.length} productos distintos · {formatPrice(total)}</Text>
    <Text style={styles.copy}>4 productos distintos: 10 %. Desde 6: 15 %. El envío se calcula en el carrito.</Text>
    <TouchableOpacity accessibilityRole="button" disabled={!ready} onPress={add} style={[styles.button, !ready && { opacity: 0.5 }]}><Text style={styles.buttonText}>Agregar pack al carrito</Text></TouchableOpacity>
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
