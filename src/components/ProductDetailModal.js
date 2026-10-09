import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, useWindowDimensions,
} from 'react-native';
import { X, ShoppingCart, Plus, Minus, Check } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import { UNIT_LABELS } from '../config';

const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');

export default function ProductDetailModal({ product, visible, onClose, onAddToCart }) {
  const { width, height } = useWindowDimensions();
  const styles = makeStyles(width, height);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useContext(CartContext);

  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 14, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    onAddToCart?.(`${quantity > 1 ? `${quantity}x ` : ''}${product.name}`);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  if (!product) return null;

  const totalPrice = product.price * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.handle} />

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X color="#FFFFFF" size={18} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={[styles.imageWrapper, { backgroundColor: product.gradientTo }]}>
            <Text style={styles.productEmoji}>{product.emoji}</Text>
            <View style={styles.imagePricePill}>
              <Text style={styles.imagePriceText}>{fmt(product.price)} c/u</Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <Text style={styles.categoryTag}>{product.category}</Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.unitText}>{UNIT_LABELS[product.unit]}</Text>
          <Text style={styles.descText}>{product.description}</Text>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CANTIDAD</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                activeOpacity={0.8}
              >
                <Minus color={quantity <= 1 ? '#444' : '#FFFFFF'} size={18} />
              </TouchableOpacity>

              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyNumber}>{quantity}</Text>
                <Text style={styles.qtyUnit}>unid.</Text>
              </View>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(prev => prev + 1)}
                activeOpacity={0.8}
              >
                <Plus color="#FFFFFF" size={18} />
              </TouchableOpacity>

              <View style={styles.totalInline}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{fmt(totalPrice)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addBtn, added && styles.addBtnDone]}
            onPress={handleAdd}
            activeOpacity={0.9}
          >
            {added ? (
              <>
                <Check color="#0E2C1C" size={20} />
                <Text style={styles.addBtnText}>¡Agregado!</Text>
              </>
            ) : (
              <>
                <ShoppingCart color="#0E2C1C" size={20} />
                <Text style={styles.addBtnText}>
                  Agregar {quantity > 1 ? `${quantity} ` : ''}al carrito · {fmt(totalPrice)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (width, height) => StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#163D27',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height < 700 ? '92%' : '82%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginTop: 10, marginBottom: 2,
  },
  closeBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: width < 380 ? 16 : 20,
    paddingTop: 6,
    paddingBottom: 12,
  },

  imageWrapper: {
    height: Math.min(180, height * 0.22),
    borderRadius: 16, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, position: 'relative',
  },
  productEmoji: { fontSize: 96 },
  imagePricePill: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: '#80C45B',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  imagePriceText: { color: '#0E2C1C', fontWeight: '900', fontSize: 13 },

  categoryRow: { marginBottom: 6 },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,179,66,0.12)',
    color: '#80C45B', fontSize: 10, fontWeight: '800',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
    textTransform: 'uppercase', letterSpacing: 1,
    borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)',
  },
  productName: {
    color: '#FFFFFF',
    fontSize: width < 380 ? 19 : 21,
    fontWeight: '900',
    letterSpacing: -0.5, marginBottom: 3,
    lineHeight: width < 380 ? 24 : 26,
  },
  unitText: {
    color: '#80C45B', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  descText: { color: '#777777', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 14,
  },

  section: { marginBottom: height < 700 ? 14 : 18 },
  sectionLabel: {
    color: '#555555', fontSize: 10, fontWeight: '900',
    letterSpacing: 2, marginBottom: 10,
  },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#1E1E1E',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyDisplay: { alignItems: 'center', minWidth: 40 },
  qtyNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', lineHeight: 28 },
  qtyUnit: { color: '#555555', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  totalInline: { marginLeft: 'auto', alignItems: 'flex-end' },
  totalLabel: { color: '#555555', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  totalValue: { color: '#80C45B', fontSize: width < 380 ? 18 : 20, fontWeight: '900', letterSpacing: -0.5 },

  footer: {
    paddingHorizontal: width < 380 ? 16 : 20,
    paddingBottom: height < 700 ? 20 : 28,
    paddingTop: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#163D27',
  },
  addBtn: {
    backgroundColor: '#80C45B', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14, gap: 8,
  },
  addBtnDone: { backgroundColor: '#4ADE80' },
  addBtnText: { color: '#0E2C1C', fontSize: 15, fontWeight: '900', letterSpacing: 0.2 },
});
