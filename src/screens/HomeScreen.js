import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, useWindowDimensions,
  Animated, Modal,
} from 'react-native';
import { ShoppingCart, Instagram, Briefcase, Plus } from 'lucide-react-native';

import { products } from '../data/products';
import { PRODUCT_CATEGORY_LIST } from '../data/categories';
import { comboPromotions, comboToCartProduct } from '../data/combos';
import { UNIT_LABELS } from '../config';
import { CartContext } from '../context/CartContext';
import HeroCarousel from '../components/HeroCarousel';
import FeaturedProductsCarousel from '../components/FeaturedProductsCarousel';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import ToastMessage from '../components/ToastMessage';
import WorkWithUsModal from '../components/WorkWithUsModal';
import ProductDetailModal from '../components/ProductDetailModal';
import PromoDetailModal from '../components/PromoDetailModal';

const fmt = (n) => '$' + Number(n).toLocaleString('es-CL');

const CATEGORY_NAMES = PRODUCT_CATEGORY_LIST.map(c => c.name);

export default function HomeScreen({ navigation }) {
  const { addToCart, getCartCount } = useContext(CartContext);
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [workWithUsVisible, setWorkWithUsVisible] = useState(false);
  const [adPopupVisible, setAdPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeModal, setActiveModal] = useState(null);
  const hasShownPopup = useRef(false);

  // Card entrance animation
  const cardAnims = useRef(
    products.reduce((acc, p) => {
      acc[p.id] = { opacity: new Animated.Value(0), translateY: new Animated.Value(28) };
      return acc;
    }, {})
  ).current;

  useEffect(() => {
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
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    showToast(`¡${item.name} al carrito!`);
  }, [addToCart]);

  const handleScroll = useCallback(() => {
    if (!hasShownPopup.current) {
      hasShownPopup.current = true;
      setTimeout(() => setAdPopupVisible(true), 400);
    }
  }, []);

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

  const numCols = width > 600 ? 3 : 2;
  const cardWidth = Math.floor((width - 24 - (numCols - 1) * 10) / numCols);

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
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productDescription} numberOfLines={1}>
              {UNIT_LABELS[item.unit]}
            </Text>

            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <Plus color="#0A0A0A" size={14} />
              <Text style={styles.addToCartText}>Agregar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Text style={styles.brandMora}>Mora<Text style={styles.brandVerduras}>Verduras</Text></Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.workBtn} onPress={() => setWorkWithUsVisible(true)}>
              <Briefcase color="#7CB342" size={14} />
              <Text style={styles.workBtnText}>Mayoristas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.instagram.com/mora.verduras')}
              style={styles.iconButton}
            >
              <Instagram color="#FFFFFF" size={22} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
              <View>
                <ShoppingCart color="#FFFFFF" size={22} />
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
        onScrollBeginDrag={handleScroll}
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
            <View style={styles.carouselSection}><TestimonialsCarousel /></View>
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

        {PRODUCT_CATEGORY_LIST.map(category => {
          const catName = category.name;
          if (activeCategory !== 'Todos' && activeCategory !== catName) return null;
          const catProducts = products.filter(p => p.category === catName);
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
            <Instagram color="#7CB342" size={18} />
            <Text style={styles.footerInstagramText}>@mora.verduras</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerWa} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.footerWaText}>🛒 Ver mi pedido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
      <Modal visible={adPopupVisible} transparent animationType="fade" onRequestClose={() => setAdPopupVisible(false)}>
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <TouchableOpacity style={styles.popupClose} onPress={() => setAdPopupVisible(false)}><Text style={styles.popupCloseText}>✕</Text></TouchableOpacity>
            <Text style={styles.popupEyebrow}>🚚 DESPACHO GRATIS</Text>
            <Text style={styles.popupTitle}>Envío gratis{'\n'}sobre $20.000</Text>
            <Text style={styles.popupBody}>Armamos tu pedido el mismo día y lo llevamos a tu casa.</Text>
            <TouchableOpacity style={styles.popupBtn} onPress={() => { setAdPopupVisible(false); navigation.navigate('Cart'); }}><Text style={styles.popupBtnText}>Ver mi pedido →</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0A0A0A' },
  scrollView: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    paddingTop: 50, backgroundColor: '#111111',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 14,
  },
  logoContainer: {
    backgroundColor: '#1E1E1E', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)',
  },
  brandMora: { color: '#FFFFFF', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  brandVerduras: { color: '#7CB342', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(124,179,66,0.4)',
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20,
  },
  workBtnText: { color: '#7CB342', fontSize: 11, fontWeight: '800' },
  iconButton: { padding: 8 },
  badgeContainer: {
    position: 'absolute', right: -6, top: -6,
    backgroundColor: '#7CB342', borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#0A0A0A', fontSize: 10, fontWeight: '900' },
  categoryNav: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  navButton: {
    backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  navButtonActive: { backgroundColor: '#7CB342', borderColor: '#7CB342' },
  navButtonText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  navButtonTextActive: { color: '#0A0A0A' },
  scrollContent: { paddingBottom: 40 },
  carouselSection: { marginTop: 28 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 20, marginBottom: 10, marginTop: 4 },
  titleContainer: { marginHorizontal: 20, marginTop: 25, marginBottom: 20 },
  mainTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', marginBottom: 5 },
  subtitle: { color: '#666666', fontSize: 14 },
  comboSection: { marginTop: 28 },
  comboSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 16, gap: 10 },
  comboSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, color: '#7CB342', marginBottom: 4 },
  comboSectionTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  comboSectionHint: { color: '#6B7280', fontSize: 11, fontWeight: '700' },
  comboScrollContent: { paddingHorizontal: 20, gap: 14 },
  comboBanner: { width: 288, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', position: 'relative' },
  comboEmoji: { position: 'absolute', right: -6, top: -10, fontSize: 130, opacity: 0.18 },
  comboBannerOverlay: { padding: 18, minHeight: 190, justifyContent: 'flex-end' },
  comboBadge: { color: '#A5D6A7', fontSize: 10, fontWeight: '800', letterSpacing: 2.2, marginBottom: 8 },
  comboTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.7, marginBottom: 6 },
  comboSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20, marginBottom: 14 },
  comboCta: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  categorySection: { marginBottom: 40, backgroundColor: '#141414', paddingVertical: 20, borderRadius: 20, marginHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 20 },
  categoryTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 15 },
  categoryTitle: { color: '#7CB342', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  categoryBadge: { backgroundColor: 'rgba(124,179,66,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)' },
  categoryBadgeText: { fontSize: 12, fontWeight: '800', color: '#7CB342' },
  categoryLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingBottom: 8 },
  card: { backgroundColor: '#1E1E1E', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  imageContainer: { width: '100%', aspectRatio: 1.1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productEmoji: { fontSize: 64 },
  imageBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(10,10,10,0.75)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  imageBadgeText: { color: '#A5D6A7', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  imagePricePill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#7CB342', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  imagePriceText: { color: '#0A0A0A', fontWeight: '900', fontSize: 12 },
  cardContent: { padding: 10 },
  productCategory: { color: '#7CB342', fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  productName: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', marginBottom: 3, letterSpacing: -0.2, lineHeight: 18 },
  productDescription: { color: '#777777', fontSize: 11, lineHeight: 15, marginBottom: 10, textTransform: 'uppercase' },
  addToCartButton: { backgroundColor: '#7CB342', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10, gap: 5 },
  addToCartText: { color: '#0A0A0A', fontSize: 12, fontWeight: '900' },
  footer: { marginTop: 20, marginHorizontal: 20, padding: 28, backgroundColor: '#141414', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20 },
  footerBrand: { color: '#FFFFFF', fontWeight: '900', fontSize: 24, letterSpacing: -0.5, marginBottom: 8 },
  footerBrandAccent: { color: '#7CB342' },
  footerText: { color: '#555555', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  footerInstagram: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  footerInstagramText: { color: '#7CB342', fontSize: 14, fontWeight: '700' },
  footerWa: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14 },
  footerWaText: { color: '#888888', fontSize: 12, fontWeight: '600' },
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  popupCard: { backgroundColor: '#141414', borderRadius: 24, padding: 28, width: '100%', maxWidth: 380, borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)', shadowColor: '#7CB342', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 20 },
  popupClose: { alignSelf: 'flex-end', marginBottom: 12 },
  popupCloseText: { color: '#555555', fontSize: 18, fontWeight: '700' },
  popupEyebrow: { color: '#7CB342', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  popupTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 34, marginBottom: 12 },
  popupBody: { color: '#666666', fontSize: 14, marginBottom: 18, lineHeight: 20 },
  popupBtn: { backgroundColor: '#7CB342', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  popupBtnText: { color: '#0A0A0A', fontSize: 15, fontWeight: '900' },
});
