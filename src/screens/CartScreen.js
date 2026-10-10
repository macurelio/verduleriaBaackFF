import { theme } from '../theme';
import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ScrollView, KeyboardAvoidingView, Platform, Linking,
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

import { calculateCart, formatPrice as fmt } from '../utils/cart';
import FreeShippingBanner from '../components/FreeShippingBanner';
import { orderLines, postOrderApi } from '../api/orders';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
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
  const [couponDraft, setCouponDraft] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [quoted, setQuoted] = useState(null);
  const [apiError, setApiError] = useState('');
  const [sending, setSending] = useState(false);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const locked = useRef(false);
  const saved = useRef(null);
  const quoteKey = JSON.stringify({ cart, couponCode });
  const needsQuote = cart.some(item => item.components) || !!couponCode;
  const quote = quoted?.key === quoteKey ? quoted.data : null;
  useEffect(() => {
    if (!needsQuote || !cart.length) return;
    let cancelled = false;
    setApiError('');
    const timer = setTimeout(() => postOrderApi('/orders/quote', { items: orderLines(cart), couponCode: couponCode || null })
      .then(data => {
        if (![data.subtotal, data.shipping, data.total].every(value => Number.isSafeInteger(value) && value >= 0) || data.total !== data.subtotal + data.shipping) throw new Error('Total invalido.');
        if (!cancelled) setQuoted({ key: quoteKey, data });
      }).catch(error => { if (!cancelled) setApiError(error.message); }), 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cart, couponCode, needsQuote, quoteKey, quoteAttempt]);

  const { subtotal, shipping, total } = quote || calculateCart(cart, SHIPPING_FEE, FREE_SHIPPING_OVER);

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

  const sendOrderWhatsapp = async () => {
    setTouched(true);
    if (hasErrors) return;
    if (locked.current || (needsQuote && !quote)) return;
    if (needsQuote) {
      const payload = { customerName: name.trim(), phone: phone.replace(/[\s.-]/g, ''), address: address.trim(), comuna, deliveryDate: date, deliveryWindow: window_, paymentMethod: payment, notes: notes.trim(), items: orderLines(cart), couponCode: couponCode || null };
      const fingerprint = JSON.stringify(payload);
      locked.current = true; setSending(true); setApiError('');
      try {
        const order = saved.current?.fingerprint === fingerprint ? saved.current.order : await postOrderApi('/orders', payload);
        saved.current = { fingerprint, order };
        if (!/^https:\/\/wa\.me\//.test(order.whatsappUrl)) throw new Error('Pedido registrado. Consulta el enlace con la tienda.');
        await Linking.openURL(order.whatsappUrl);
      } catch (error) { setApiError(`${error.message} Consulta con la tienda antes de volver a registrar para evitar duplicados.`); }
      finally { locked.current = false; setSending(false); }
      return;
    }

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
          {item.components?.map(component => <Text key={component.product.id} style={styles.itemUnit}>{component.quantity} × {component.product.name}</Text>)}
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.cartItemId)}>
          <Trash2 color="#EF4444" size={18} />
        </TouchableOpacity>
      </View>
      <View style={styles.itemFooter}>
        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => decrementQuantity(item.cartItemId)}>
            <Minus color={theme.text} size={15} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity accessibilityLabel={`Aumentar cantidad de ${item.name}`} disabled={item.quantity >= 99} style={styles.qtyBtn} onPress={() => incrementQuantity(item.cartItemId)}>
            <Plus color={theme.text} size={15} />
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
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(24, insets.bottom) }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
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

        <FreeShippingBanner subtotal={subtotal} />
        {/* Delivery form */}
        <Text style={styles.formTitle}>Datos de despacho</Text>

        <Text style={styles.fieldLabel}>Nombre</Text>
        <TextInput
          style={[styles.input, touched && errors.name && styles.inputError]}
          placeholder="Tu nombre"
          placeholderTextColor={theme.muted}
          value={name}
          onChangeText={setName}
        />

        {touched && errors.name && <Text style={styles.errorBannerText}>Escribe tu nombre completo.</Text>}
        <Text style={styles.fieldLabel}>Teléfono</Text>
        <TextInput
          style={[styles.input, touched && errors.phone && styles.inputError]}
          placeholder="+56 9 1234 5678"
          placeholderTextColor={theme.muted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        {touched && errors.phone && <Text style={styles.errorBannerText}>Ingresa un celular chileno: +56 9 y 8 dígitos.</Text>}
        <Text style={styles.fieldLabel}>Dirección</Text>
        <TextInput
          style={[styles.input, touched && errors.address && styles.inputError]}
          placeholder="Calle, número, depto/casa"
          placeholderTextColor={theme.muted}
          value={address}
          onChangeText={setAddress}
        />

        {touched && errors.address && <Text style={styles.errorBannerText}>Indica calle y número.</Text>}
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
          placeholderTextColor={theme.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {touched && hasErrors && (
          <View style={styles.errorBanner}>
            <AlertCircle color={theme.error} size={15} />
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
              : `Envío gratis desde ${fmt(FREE_SHIPPING_OVER)}`}
          </Text>
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>{fmt(total)}</Text>
          </View>
        </View>

        <Text style={styles.totalLabelText}>Cupón del pedido</Text>
        <TextInput accessibilityLabel="Cupón del pedido" value={couponDraft} onChangeText={setCouponDraft} maxLength={40} autoCapitalize="characters" style={styles.input} editable={!sending} />
        <TouchableOpacity accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }} disabled={sending} onPress={() => setCouponCode(couponDraft.trim().toUpperCase())}><Text style={styles.itemUnit}>Aplicar cupón</Text></TouchableOpacity>
        {!!couponCode && <TouchableOpacity accessibilityRole="button" disabled={sending} onPress={() => { setCouponCode(''); setCouponDraft(''); }}><Text style={styles.itemUnit}>Quitar cupón {couponCode}</Text></TouchableOpacity>}
        {needsQuote && !quote && !apiError && <Text accessibilityLiveRegion="polite">Validando descuentos…</Text>}
        {!!quote?.packDiscount && <Text>Descuento packs: −{fmt(quote.packDiscount)}</Text>}
        {!!quote?.couponDiscount && <Text>Descuento cupón: −{fmt(quote.couponDiscount)}</Text>}
        {!!apiError && <Text accessibilityLiveRegion="polite" style={{ color: theme.error }}>{apiError}</Text>}
        {!!apiError && !quote && <TouchableOpacity accessibilityRole="button" onPress={() => setQuoteAttempt(previous => previous + 1)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={styles.itemUnit}>Reintentar cotización</Text></TouchableOpacity>}
        <TouchableOpacity style={styles.waBtn} disabled={sending || (needsQuote && !quote)} onPress={sendOrderWhatsapp} activeOpacity={0.85}>
          <MessageCircle color={theme.onAccent} size={22} />
          <Text style={styles.waBtnText}>Solicitar pedido por WhatsApp</Text>
        </TouchableOpacity>
        <Text style={styles.waNote}>Envía el mensaje en WhatsApp. La tienda confirmará disponibilidad y entrega.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.canvas },
  content: { padding: 20, paddingBottom: 50 },
  title: { color: theme.text, fontSize: 24, fontWeight: '900', marginBottom: 20, marginTop: 8 },

  emptyContainer: {
    flex: 1, backgroundColor: theme.canvas,
    justifyContent: 'center', alignItems: 'center', padding: 40,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { color: theme.text, fontSize: 22, fontWeight: '900', marginBottom: 8 },
  emptySubtitle: { color: theme.muted, fontSize: 14, marginBottom: 28, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: theme.accentSoft, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  emptyBtnText: { color: theme.text, fontSize: 15, fontWeight: '900' },

  cartItem: {
    backgroundColor: theme.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  itemTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12,
  },
  itemEmojiWrap: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: theme.soft,
    justifyContent: 'center', alignItems: 'center',
  },
  itemEmoji: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { color: theme.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  itemUnit: { color: theme.accent, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  removeBtn: {
    padding: 6, backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.soft, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
  },
  qtyBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontVariant: ['tabular-nums'], color: theme.text, fontSize: 16, fontWeight: '900', marginHorizontal: 8 },
  itemTotal: { fontVariant: ['tabular-nums'], color: theme.text, fontSize: 17, fontWeight: '900' },

  clearBtn: { alignSelf: 'flex-end', marginTop: 12, paddingVertical: 6, paddingHorizontal: 10 },
  clearBtnText: { color: '#EF4444', fontSize: 12, fontWeight: '700' },

  formTitle: { color: theme.text, fontSize: 18, fontWeight: '900', marginTop: 28, marginBottom: 14 },
  fieldLabel: {
    color: theme.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8, marginTop: 12,
  },
  input: {
    backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: theme.text, fontSize: 14, fontWeight: '600',
    borderWidth: 1, borderColor: theme.border,
  },
  inputError: { borderColor: '#EF4444' },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  chipsRow: { gap: 8, paddingBottom: 4 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface,
  },
  chipActive: { backgroundColor: theme.accentSoft, borderColor: theme.accent },
  chipText: { color: theme.muted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: theme.text },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, marginTop: 16,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
  },
  errorBannerText: { color: theme.error, fontSize: 12, fontWeight: '700', flex: 1 },

  totalsSection: {
    backgroundColor: theme.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: theme.border, marginTop: 20,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalRowFinal: {
    borderTopWidth: 1, borderTopColor: theme.border,
    paddingTop: 14, marginBottom: 0,
  },
  totalLabelText: { color: theme.muted, fontSize: 14 },
  totalValueSm: { fontVariant: ['tabular-nums'], color: theme.text, fontSize: 14, fontWeight: '700' },
  shippingHint: { color: theme.accent, fontSize: 11, fontWeight: '700', marginBottom: 10 },
  totalFinalLabel: { color: theme.text, fontSize: 18, fontWeight: '900' },
  totalFinalValue: { fontVariant: ['tabular-nums'], color: theme.accent, fontSize: 24, fontWeight: '900' },

  waBtn: {
    backgroundColor: theme.accent, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, paddingVertical: 17,
    borderRadius: 16, marginTop: 16,
    shadowColor: '#25D366', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  waBtnText: { color: theme.onAccent, fontWeight: '900', fontSize: 16 },
  waNote: { color: theme.muted, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
