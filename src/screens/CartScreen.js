import React, { useState, useContext, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ScrollView,
} from 'react-native';
import { Check, MessageCircle, Trash2, Plus, Minus, AlertCircle } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import {
  COMUNAS,
  DELIVERY_WINDOWS,
  DELIVERY_ZONE,
  FREE_SHIPPING_OVER,
  PAYMENT_METHODS,
  SHIPPING_FEE,
  UNIT_LABELS,
  openWhatsApp,
} from '../config';

const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');

const DELIVERY_DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    label: d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }),
    value: d.toISOString().split('T')[0],
  };
});

const isPhoneValid = (phone) => /^(\+?56)?9\d{8}$/.test(phone.replace(/[\s-]/g, ''));

export default function CartScreen({ navigation }) {
  const { cart, incrementQuantity, decrementQuantity, removeItem, clearCart } = useContext(CartContext);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comuna, setComuna] = useState('');
  const [date, setDate] = useState('');
  const [window_, setWindow] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const errors = useMemo(() => ({
    name: name.trim().length < 2,
    phone: !isPhoneValid(phone),
    address: address.trim().length < 5,
    comuna: !comuna,
    date: !date,
    window: !window_,
    payment: !payment,
  }), [name, phone, address, comuna, date, window_, payment]);

  const hasErrors = Object.values(errors).some(Boolean);

  const sendOrderWhatsapp = () => {
    setTouched(true);
    if (hasErrors) return;

    const lines = ['/// NUEVO PEDIDO MORA VERDURAS ///', ''];
    cart.forEach(item => {
      lines.push(`• ${item.name} (${UNIT_LABELS[item.unit]}) x${item.quantity} — ${fmt(item.price * item.quantity)}`);
    });
    lines.push('');
    lines.push(`Subtotal: ${fmt(subtotal)}`);
    lines.push(shipping === 0 ? 'Envío: ¡gratis!' : `Envío (${DELIVERY_ZONE}): ${fmt(shipping)}`);
    lines.push(`*TOTAL: ${fmt(total)}*`);
    lines.push('');
    lines.push(`👤 Nombre: ${name}`);
    lines.push(`📞 Teléfono: ${phone}`);
    lines.push(`📍 Dirección: ${address}, ${comuna}`);
    lines.push(`📅 Entrega: ${date}`);
    lines.push(`🕒 Horario: ${window_}`);
    lines.push(`💳 Pago: ${payment}`);
    if (notes.trim()) lines.push(`📝 Notas: ${notes.trim()}`);

    openWhatsApp(lines.join('\n')).catch(() => {});
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemTop}>
        <View style={styles.itemEmojiWrap}>
          <Text style={styles.itemEmoji}>{item.emoji || '🥬'}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemUnit}>{fmt(item.price)} · {UNIT_LABELS[item.unit]}</Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.cartItemId)}>
          <Trash2 color="#EF4444" size={18} />
        </TouchableOpacity>
      </View>
      <View style={styles.itemFooter}>
        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantity(item.cartItemId)}>
            <Minus color="#FFFFFF" size={15} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => incrementQuantity(item.cartItemId)}>
            <Plus color="#FFFFFF" size={15} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>{fmt(item.price * item.quantity)}</Text>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🧺</Text>
        <Text style={styles.emptyTitle}>Tu pedido está vacío</Text>
        <Text style={styles.emptySubtitle}>Agrega verduras y frutas desde el mercado</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation?.goBack()}>
          <Text style={styles.emptyBtnText}>Ver mercado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Chip = ({ active, label, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tu pedido</Text>

        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={item => item.cartItemId || item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />

        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Text style={styles.clearBtnText}>Vaciar pedido</Text>
        </TouchableOpacity>

        {/* Delivery form */}
        <Text style={styles.formTitle}>Datos de despacho</Text>

        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput
          style={[styles.input, touched && errors.name && styles.inputError]}
          placeholder="Tu nombre"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.fieldLabel}>Teléfono</Text>
        <TextInput
          style={[styles.input, touched && errors.phone && styles.inputError]}
          placeholder="+56 9 1234 5678"
          placeholderTextColor="#555"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        <Text style={styles.fieldLabel}>Dirección</Text>
        <TextInput
          style={[styles.input, touched && errors.address && styles.inputError]}
          placeholder="Calle, número, depto/casa"
          placeholderTextColor="#555"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.fieldLabel}>Comuna</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {COMUNAS.map(c => (
            <Chip key={c} label={c} active={comuna === c} onPress={() => setComuna(c)} />
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Fecha de entrega</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {DELIVERY_DAYS.map(d => (
            <Chip key={d.value} label={d.label} active={date === d.value} onPress={() => setDate(d.value)} />
          ))}
        </ScrollView>

        <Text style={styles.fieldLabel}>Horario</Text>
        <View style={styles.wrapRow}>
          {DELIVERY_WINDOWS.map(w => (
            <Chip key={w} label={w} active={window_ === w} onPress={() => setWindow(w)} />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Método de pago</Text>
        <View style={styles.wrapRow}>
          {PAYMENT_METHODS.map(m => (
            <Chip key={m} label={m} active={payment === m} onPress={() => setPayment(m)} />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Referencias, horarios, etc."
          placeholderTextColor="#555"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {touched && hasErrors && (
          <View style={styles.errorBanner}>
            <AlertCircle color="#F87171" size={15} />
            <Text style={styles.errorBannerText}>Completa los datos marcados para continuar.</Text>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelText}>Subtotal</Text>
            <Text style={styles.totalValueSm}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelText}>Envío ({DELIVERY_ZONE})</Text>
            <Text style={styles.totalValueSm}>{shipping === 0 ? 'Gratis' : fmt(shipping)}</Text>
          </View>
          <Text style={styles.shippingHint}>
            {subtotal >= FREE_SHIPPING_OVER
              ? '¡Felicidades! Tienes envío gratis.'
              : `Envío gratis sobre ${fmt(FREE_SHIPPING_OVER)}`}
          </Text>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>{fmt(total)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.waBtn} onPress={sendOrderWhatsapp} activeOpacity={0.85}>
          <MessageCircle color="#fff" size={22} />
          <Text style={styles.waBtnText}>Confirmar pedido por WhatsApp</Text>
        </TouchableOpacity>
        <Text style={styles.waNote}>Te contactaremos para coordinar el despacho.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0E2C1C' },
  content: { padding: 20, paddingBottom: 50 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginBottom: 20, marginTop: 8 },

  emptyContainer: {
    flex: 1, backgroundColor: '#0E2C1C',
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptySubtitle: { color: '#666666', fontSize: 14, marginBottom: 28, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: '#80C45B', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  emptyBtnText: { color: '#0E2C1C', fontSize: 15, fontWeight: '900' },

  cartItem: {
    backgroundColor: '#141414', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  itemTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12,
  },
  itemEmojiWrap: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: '#1E1E1E',
    justifyContent: 'center', alignItems: 'center',
  },
  itemEmoji: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  itemUnit: { color: '#80C45B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  removeBtn: {
    padding: 6, backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  qtyBtn: { padding: 8, paddingHorizontal: 12 },
  qtyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', marginHorizontal: 8 },
  itemTotal: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },

  clearBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  clearBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

  formTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 28, marginBottom: 14 },
  fieldLabel: {
    color: '#888888', fontSize: 11, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8, marginTop: 12,
  },
  input: {
    backgroundColor: '#141414', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: '#FFFFFF', fontSize: 14, fontWeight: '600',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputError: { borderColor: '#EF4444' },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  chipsRow: { gap: 8, paddingBottom: 4 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: '#141414',
  },
  chipActive: { backgroundColor: '#80C45B', borderColor: '#80C45B' },
  chipText: { color: '#AAAAAA', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#0E2C1C' },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorBannerText: { color: '#F87171', fontSize: 12, fontWeight: '700', flex: 1 },

  totalsSection: {
    backgroundColor: '#141414', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', marginTop: 20,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRowFinal: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14, marginBottom: 0,
  },
  totalLabelText: { color: '#888888', fontSize: 14 },
  totalValueSm: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  shippingHint: { color: '#80C45B', fontSize: 11, fontWeight: '700', marginBottom: 10 },
  totalFinalLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  totalFinalValue: { color: '#80C45B', fontSize: 24, fontWeight: '900' },

  waBtn: {
    backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, paddingVertical: 17,
    borderRadius: 16, marginTop: 16,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  waBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  waNote: { color: '#555555', fontSize: 12, textAlign: 'center', marginTop: 10 },
});
