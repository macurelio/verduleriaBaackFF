import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { PRODUCT_CATEGORIES } from '../data/categories';
import { BRAND_NAME } from '../config';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SLIDES = [
  {
    id: '1',
    title: 'Verduras del día',
    subtitle: 'Hojas verdes para tu mesa.\nDirecto del campo a tu cocina.',
    cta: 'Ver Hojas Verdes',
    ctaCategory: PRODUCT_CATEGORIES.GREENS,
    emoji: '🥬',
    bg: '#14532d',
  },
  {
    id: '2',
    title: 'La base de tu cocina',
    subtitle: 'Papas, cebolla, zanahoria y más.\nElige tus productos favoritos.',
    cta: 'Ver Raíces',
    ctaCategory: PRODUCT_CATEGORIES.ROOTS,
    emoji: '🥕',
    bg: '#422006',
  },
  {
    id: '3',
    title: 'Fruta a tu puerta',
    subtitle: 'Tomate, palta, limón y plátano.\nMaduros y listos para comer.',
    cta: 'Ver Frutas',
    ctaCategory: PRODUCT_CATEGORIES.FRUITS,
    emoji: '🍅',
    bg: '#7f1d1d',
  },
];

const AUTO_SCROLL_INTERVAL = 4000;

export default function HeroCarousel({ onCategoryPress }) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const timerRef = useRef(null);

  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: !reducedMotion });
    setActiveIndex(index);
  };

  const startAutoScroll = useCallback(() => {
    clearInterval(timerRef.current);
    if (reducedMotion || paused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [width, reducedMotion, paused]);

  useEffect(() => {
    startAutoScroll();
    return () => clearInterval(timerRef.current);
  }, [startAutoScroll]);

  const handleScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleScrollBegin = () => {
    clearInterval(timerRef.current);
  };

  const handleScrollEndDrag = () => {
    startAutoScroll();
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={{ width }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width, backgroundColor: slide.bg }]}>
            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
            <View style={styles.overlay}>
              <View style={styles.content}>
                <Text style={styles.badge}>{BRAND_NAME.toUpperCase()}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={() => onCategoryPress && onCategoryPress(slide.ctaCategory)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaText}>{slide.cta} →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={paused ? 'Reanudar carrusel' : 'Pausar carrusel'} onPress={() => setPaused(value => !value)} style={styles.dotTouchable}>
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{paused ? 'Reanudar' : 'Pausar'}</Text>
        </TouchableOpacity>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={`Ir a la diapositiva ${i + 1}`} accessibilityState={{ selected: i === activeIndex }} onPress={() => goToSlide(i)} style={styles.dotTouchable}>
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  slide: {
    height: 340,
    position: 'relative',
    overflow: 'hidden',
  },
  slideEmoji: {
    position: 'absolute',
    right: -20,
    top: 20,
    fontSize: 200,
    opacity: 0.16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 52,
    paddingHorizontal: 28,
  },
  content: {
    maxWidth: 360,
  },
  badge: {
    color: '#A5D6A7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
    fontWeight: '400',
  },
  ctaButton: {
    backgroundColor: '#80C45B',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#0E2C1C',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 18,
    right: 24,
    flexDirection: 'row',
    gap: 6,
  },
  dotTouchable: {
    minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#80C45B',
  },
});
