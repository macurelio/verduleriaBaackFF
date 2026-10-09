import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import { featuredProducts } from '../data/products';
import { UNIT_LABELS } from '../config';

export default function FeaturedProductsCarousel() {
  const { addToCart } = useContext(CartContext);
  const { width } = useWindowDimensions();

  const CARD_WIDTH = Math.min(width * 0.72, 260);
  const CARD_MARGIN = 12;

  const handleAdd = (item) => {
    addToCart(item);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { width: CARD_WIDTH }]}>
      <View style={[styles.imageWrapper, { backgroundColor: item.gradientTo }]}>
        <Text style={styles.productEmoji}>{item.emoji}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>${item.price.toLocaleString('es-CL')}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.categoryTag}>{item.category}</Text>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {UNIT_LABELS[item.unit]}
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAdd(item)}
          activeOpacity={0.85}
        >
          <ShoppingCart color="#0E2C1C" size={14} />
          <Text style={styles.addButtonText}>Añadir al carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionLabel}>DESTACADOS</Text>
          <Text style={styles.sectionTitle}>Nuestros Favoritos</Text>
        </View>
      </View>

      <FlatList
        data={featuredProducts}
        keyExtractor={(item) => `featured-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingHorizontal: 20 }]}
        ItemSeparatorComponent={() => <View style={{ width: CARD_MARGIN }} />}
        renderItem={renderItem}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: '#80C45B',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 4,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  imageWrapper: {
    position: 'relative',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 72,
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(10,10,10,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(124,179,66,0.45)',
  },
  priceBadgeText: {
    color: '#80C45B',
    fontSize: 13,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  categoryTag: {
    backgroundColor: 'rgba(124,179,66,0.12)',
    color: '#80C45B',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,179,66,0.25)',
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  productDesc: {
    color: '#666666',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: '#80C45B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#0E2C1C',
    fontSize: 12,
    fontWeight: '900',
  },
});
