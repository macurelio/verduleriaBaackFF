import { theme } from '../theme';
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { X, ShoppingCart } from 'lucide-react-native';

export default function PromoDetailModal({
  visible,
  item,
  onClose,
  onPrimaryAction,
  onAddToCart,
}) {
  const { width, height } = useWindowDimensions();

  if (!item) {
    return null;
  }

  const modalWidth = Math.min(width - 24, 560);
  const modalMaxHeight = Math.min(height * 0.9, 760);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { width: modalWidth, maxHeight: modalMaxHeight }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
            <X color={theme.text} size={18} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, { backgroundColor: item.gradientTo || '#1E1E1E' }]}>
              <Text style={styles.heroEmoji}>{item.emoji || '🥬'}</Text>
            </View>

            <View style={styles.content}>
              {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
              {item.priceLabel ? <Text style={styles.priceLabel}>{item.priceLabel}</Text> : null}
              <Text style={styles.description}>{item.description}</Text>

              {item.items?.length ? (
                <View style={styles.listBlock}>
                  {item.items.map((line, index) => (
                    <View key={`${item.id}-bullet-${index}`} style={styles.listItem}>
                      <View style={styles.dot} />
                      <Text style={styles.listText}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {onAddToCart ? (
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => onAddToCart(item)}
                activeOpacity={0.85}
              >
                <ShoppingCart color="#0E2C1C" size={18} />
                <Text style={styles.cartButtonText}>Agregar</Text>
              </TouchableOpacity>
            ) : null}

            {item.primaryLabel ? (
              <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryAction} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>{item.primaryLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: theme.border,
  },
  hero: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 96 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  badge: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceLabel: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  description: {
    color: theme.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  listBlock: {
    marginTop: 18,
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.accentSoft,
    marginTop: 7,
  },
  listText: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  cartButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
