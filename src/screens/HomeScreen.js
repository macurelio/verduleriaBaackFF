import { theme } from '../theme';
import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, useWindowDimensions,
  Animated, TextInput,
} from 'react-native';
import { ShoppingCart, Instagram, Briefcase, Plus } from 'lucide-react-native';

import { products } from '../data/products';
import { PRODUCT_CATEGORY_LIST } from '../data/categories';
import { comboPromotions, comboToCartProduct } from '../data/combos';
import { UNIT_LABELS, SHIPPING_FEE, FREE_SHIPPING_OVER } from '../config';
import FreeShippingBanner from '../components/FreeShippingBanner';
import { calculateCart, formatPrice } from '../utils/cart';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CartContext } from '../context/CartContext';
import HeroCarousel from '../components/HeroCarousel';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';
import ToastMessage from '../components/ToastMessage';
import WorkWithUsModal from '../components/WorkWithUsModal';
import ProductDetailModal from '../components/ProductDetailModal';
import PromoDetailModal from '../components/PromoDetailModal';

const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');

const CATEGORY_NAMES = PRODUCT_CATEGORY_LIST.map(c => c.name);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { cart, addToCart, getCartCount } = useContext(CartContext);
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [workWithUsVisible, setWorkWithUsVisible] = useState(false);
  const [search, setSearch] = useState('');
  const amounts = calculateCart(cart, SHIPPING_FEE, FREE_SHIPPING_OVER);
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CL');
  const query = normalize(search.trim());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeModal, setActiveModal] = useState(null);

  // Card entrance animation
  const cardAnims = useRef(
    products.reduce((acc, p) => {
      acc[p.id] = { opacity: new Animated.Value(0), translateY: new Animated.Value(28) };
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    if (reducedMotion) {
      products.forEach(product => { cardAnims[product.id].opacity.setValue(1); cardAnims[product.id].translateY.setValue(0); });
      return;
    }
    const animations = products.map(p =>
      Animated.parallel([
        Animated.timing(cardAnims[p.id].opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(cardAnims[p.id].translateY, { toValue: 0, duration: 380, useNativeDriver: true }),
      ])
    );
    const timer = setTimeout(() => {
      Animated.stagger(55, animations).start();
    }, 600);
    return () => clearTimeout(timer);
  }, [reducedMotion, cardAnims]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    showToast(`¡${item.name} al carrito!`);
  }, [addToCart]);

  const selectCategory = (cat) => {
    setActiveCategory(cat);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleComboAction = () => {
    if (!activeModal) return;
    if (activeModal.targetCategory) {
      selectCategory(activeModal.targetCategory);
    }
    setActiveModal(null);
  };

  const handleComboAdd = (combo) => {
    handleAddToCart(comboToCartProduct(combo));
    setActiveModal(null);
  };

  const numCols = width >= 1200 ? 5 : width >= 900 ? 4 : width >= 640 ? 3 : 2;
  const cardWidth = Math.floor((width - 48 - (numCols - 1) * 10) / numCols);

  const renderComboBanner = (combo) => (
    <TouchableOpacity
      key={combo.id}
      style={[styles.comboBanner, { backgroundColor: combo.gradientTo }]}
      activeOpacity={0.88}
      onPress={() => setActiveModal({ ...combo, type: 'combo' })}
    >
      <Text style={styles.comboEmoji}>{combo.emoji}</Text>
      <View style={styles.comboBannerOverlay}>
        <Text style={styles.comboBadge}>{combo.badge}</Text>
        <Text style={styles.comboTitle}>{combo.title}</Text>
        <Text style={styles.comboSubtitle}>{combo.subtitle}</Text>
        <Text style={styles.comboCta}>Toca para ver el detalle</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = (item) => {
    const entranceAnim = cardAnims[item.id];
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          { width: cardWidth },
          entranceAnim && {
            opacity: entranceAnim.opacity,
            transform: [{ translateY: entranceAnim.translateY }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            setSelectedProduct(item);
            setDetailModalVisible(true);
          }}
        >
          <View style={[styles.imageContainer, { backgroundColor: item.gradientTo }]}>
            <Text style={styles.productEmoji}>{item.emoji}</Text>
            {item.badge ? (
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <View style={styles.imagePricePill}>
              <Text style={styles.imagePriceText}>{fmt(item.price)}</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.productCategory} numberOfLines={1}>{item.category}</Text>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productDescription} numberOfLines={1}>
              {UNIT_LABELS[item.unit]}
            </Text>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Plus color="#0E2C1C" size={14} />
              <Text style={styles.addToCartText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={[styles.header, { paddingTop: Math.max(16, insets.top) }]}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
              <Text style={[styles.brandMora, { fontSize: width < 420 ? 18 : 22 }]}>Mora<Text style={[styles.brandVerduras, { fontSize: width < 420 ? 18 : 22 }]}>Verduras</Text></Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity accessibilityLabel="Consultar compras mayoristas" style={styles.workBtn} onPress={() => setWorkWithUsVisible(true)}>
              <Briefcase color={theme.accent} size={14} />
              {width >= 420 && <Text style={styles.workBtnText}>Mayoristas</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.instagram.com/mora.verduras')}
              style={styles.iconButton}
              accessibilityLabel="Instagram de Mora Verduras"
            >
              <Instagram color={theme.text} size={22} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Ver carrito" onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
              <View>
                <ShoppingCart color={theme.text} size={22} />
                {getCartCount() > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{getCartCount()}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryNav}>
          {['Todos', ...CATEGORY_NAMES].map(cat => (
            <TouchableOpacity
              key={`nav-${cat}`}
              style={[styles.navButton, activeCategory === cat && styles.navButtonActive]}
              onPress={() => selectCategory(cat)}
            >
              <Text style={[styles.navButtonText, activeCategory === cat && styles.navButtonTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        scrollEventThrottle={16}
      >
        {activeCategory === 'Todos' && (
          <>
            <HeroCarousel onCategoryPress={(cat) => selectCategory(cat)} />

            <View style={styles.comboSection}>
              <View style={styles.comboSectionHeader}>
                <View>
                  <Text style={styles.comboSectionLabel}>PACKS</Text>
                  <Text style={styles.comboSectionTitle}>Combos y ahorros</Text>
                </View>
                <Text style={styles.comboSectionHint}>Desliza para ver más</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.comboScrollContent}>
                {comboPromotions.map(renderComboBanner)}
              </ScrollView>
            </View>

            <View style={styles.carouselSection}><FeaturedProductsCarousel /></View>
          </>
        )}

        {activeCategory === 'Todos' && (
          <>
            <View style={styles.divider} />
            <View style={styles.titleContainer}>
              <Text style={styles.mainTitle}>Nuestro mercado</Text>
              <Text style={styles.subtitle}>Verduras y frutas frescas del día.</Text>
            </View>
          </>
        )}

        <View style={{ marginHorizontal: 20 }}>
          <FreeShippingBanner />
          <Text style={{ color: theme.text, fontWeight: '700', marginBottom: 8 }}>Buscar productos</Text>
          <TextInput accessibilityLabel="Buscar productos" value={search} onChangeText={setSearch} placeholder="Busca tomate, palta, lechuga…" placeholderTextColor={theme.muted} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12, color: theme.text, padding: 12, minHeight: 44, marginBottom: 16 }} />
          {query && !products.some(p => (activeCategory === 'Todos' || p.category === activeCategory) && normalize(`${p.name} ${p.description}`).includes(query)) && <Text style={{ color: theme.muted }}>No encontramos productos. Prueba otra búsqueda.</Text>}
        </View>
        {PRODUCT_CATEGORY_LIST.map(category => {
          const catName = category.name;
          if (activeCategory !== 'Todos' && activeCategory !== catName) return null;
          const catProducts = products.filter(p => p.category === catName && normalize(`${p.name} ${p.description}`).includes(query));
          if (catProducts.length === 0) return null;
          return (
            <View key={catName} style={[styles.categorySection, activeCategory !== 'Todos' && { marginTop: 20 }]}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleContainer}>
                  <Text style={styles.categoryTitle}>{category.emoji} {catName}</Text>
                  <View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>{catProducts.length}</Text></View>
                </View>
                <View style={styles.categoryLine} />
              </View>
              <View style={styles.productsGrid}>
                {catProducts.map(product => renderProduct(product))}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Mora<Text style={styles.footerBrandAccent}>Verduras</Text></Text>
          <Text style={styles.footerText}>Verduras y frutas frescas a domicilio en el Gran Santiago. Pedidos por WhatsApp.</Text>
          <TouchableOpacity
            style={styles.footerInstagram}
            onPress={() => Linking.openURL('https://www.instagram.com/mora.verduras')}
          >
            <Instagram color={theme.accent} size={18} />
            <Text style={styles.footerInstagramText}>@mora.verduras</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerWa} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.footerWaText}>🛒 Ver mi pedido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {amounts.itemCount > 0 && <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver pedido con ${amounts.itemCount} productos`} onPress={() => navigation.navigate('Cart')} style={{ backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border, padding: 16, paddingBottom: Math.max(16, insets.bottom), minHeight: 64, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: theme.text, fontWeight: '700' }}>{amounts.itemCount} productos</Text>
        <Text style={{ color: theme.accent, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{formatPrice(amounts.total)} · Ver pedido</Text>
      </TouchableOpacity>}
      <ToastMessage visible={toastVisible} message={toastMessage} />
      <ProductDetailModal
        product={selectedProduct}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        onAddToCart={(name) => { setDetailModalVisible(false); showToast(`¡${name} al carrito!`); }}
      />
      <WorkWithUsModal visible={workWithUsVisible} onClose={() => setWorkWithUsVisible(false)} />
      <PromoDetailModal
        visible={!!activeModal}
        item={activeModal}
        onClose={() => setActiveModal(null)}
        onPrimaryAction={handleComboAction}
        onAddToCart={handleComboAdd}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.canvas },
  scrollView: { flex: 1, backgroundColor: theme.canvas },
  header: {
    paddingTop: 50, backgroundColor: theme.surface,
    borderBottomWidth: 1, borderBottomColor: theme.border, zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, marginBottom: 14,
  },
  logoContainer: {
    backgroundColor: theme.soft, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)',
  },
  brandMora: { color: theme.text, fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  brandVerduras: { color: theme.accent, fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workBtn: {
    minWidth: 44, minHeight: 44, justifyContent: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(124,179,66,0.4)',
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
  },
  workBtnText: { color: theme.accent, fontSize: 11, fontWeight: '800' },
  iconButton: { padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  badgeContainer: {
    position: 'absolute', right: -6, top: -6,
    backgroundColor: theme.accentSoft, borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: theme.text, fontSize: 10, fontWeight: '900' },
  categoryNav: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  navButton: {
    backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
  },
  navButtonActive: { backgroundColor: theme.accentSoft, borderColor: theme.accent },
  navButtonText: { fontSize: 11, fontWeight: '700', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  navButtonTextActive: { color: theme.text },
  scrollContent: { paddingBottom: 40 },
  carouselSection: { marginTop: 28 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, marginBottom: 10, marginTop: 4 },
  titleContainer: { marginHorizontal: 20, marginTop: 25, marginBottom: 20 },
  mainTitle: { color: theme.text, fontSize: 28, fontWeight: '900', marginBottom: 5 },
  subtitle: { color: theme.muted, fontSize: 14 },
  comboSection: { marginTop: 28 },
  comboSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  comboSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, color: theme.accent, marginBottom: 4 },
  comboSectionTitle: { color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  comboSectionHint: { color: '#6B7280', fontSize: 11, fontWeight: '700' },
  comboScrollContent: { paddingHorizontal: 20, gap: 14 },
  comboBanner: { width: 288, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: theme.border, position: 'relative' },
  comboEmoji: { position: 'absolute', right: -6, top: -10, fontSize: 130, opacity: 0.18 },
  comboBannerOverlay: { padding: 18, minHeight: 190, justifyContent: 'flex-end' },
  comboBadge: { color: '#A5D6A7', fontSize: 10, fontWeight: '800', letterSpacing: 2.2, marginBottom: 8 },
  comboTitle: { color: theme.onAccent, fontSize: 24, fontWeight: '900', letterSpacing: -0.7, marginBottom: 6 },
  comboSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  comboCta: { color: theme.onAccent, fontSize: 12, fontWeight: '800' },
  categorySection: { marginBottom: 40, backgroundColor: theme.surface, paddingVertical: 20, borderRadius: 20, marginHorizontal: 12, borderWidth: 1, borderColor: theme.border },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 20 },
  categoryTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 15 },
  categoryTitle: { color: theme.accent, fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  categoryBadge: { backgroundColor: 'rgba(124,179,66,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)' },
  categoryBadgeText: { fontSize: 12, fontWeight: '800', color: theme.accent },
  categoryLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingBottom: 8 },
  card: { backgroundColor: theme.surface, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  imageContainer: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productEmoji: { fontSize: 64 },
  imageBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(10,10,10,0.75)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  imageBadgeText: { color: '#A5D6A7', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  imagePricePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: theme.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  imagePriceText: { fontVariant: ['tabular-nums'], color: theme.text, fontWeight: '900', fontSize: 12 },
  cardContent: { padding: 10 },
  productCategory: { color: theme.accent, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  productName: { color: theme.text, fontSize: 13, fontWeight: '900', height: 36, marginBottom: 3, letterSpacing: -0.2, lineHeight: 18 },
  productDescription: { color: theme.muted, fontSize: 11, lineHeight: 15, marginBottom: 10, textTransform: 'uppercase' },
  addToCartButton: { minHeight: 44, backgroundColor: theme.accentSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10, gap: 5 },
  addToCartText: { color: theme.text, fontSize: 12, fontWeight: '900' },
  footer: { marginTop: 20, marginHorizontal: 20, padding: 28, backgroundColor: theme.surface, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: theme.border, marginBottom: 20 },
  footerBrand: { color: theme.text, fontWeight: '900', fontSize: 24, letterSpacing: -0.5, marginBottom: 8 },
  footerBrandAccent: { color: theme.accent },
  footerText: { color: theme.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  footerInstagram: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  footerInstagramText: { color: theme.accent, fontSize: 14, fontWeight: '700' },
  footerWa: { borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  footerWaText: { color: theme.muted, fontSize: 12, fontWeight: '600' },

});
