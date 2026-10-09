import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions,
} from 'react-native';
import { INSTAGRAM_URL } from '../config';

const TESTIMONIALS = [
  {
    id: 't1',
    quote: 'La verdura llega increíblemente fresca. Pedí la Canasta Semanal y me duró toda la semana sin ir a la feria. Súper recomendado.',
    author: 'Daniela R.',
    role: 'Clienta frecuente',
    rating: 5,
    initials: 'DR',
    avatarColor: '#2F7A3F',
  },
  {
    id: 't2',
    quote: 'Pedí por WhatsApp a las 10 y me llegó el mismo día en la tarde. Más fácil imposible. Los precios son muy buenos.',
    author: 'Rodrigo M.',
    role: 'Santiago Centro',
    rating: 5,
    initials: 'RM',
    avatarColor: '#4A3C2F',
  },
  {
    id: 't3',
    quote: 'La rúcula y el cilantro estaban como recién cortados. Se nota que es producto del día. Ya soy clienta fija.',
    author: 'Camila P.',
    role: 'Ñuñoa',
    rating: 5,
    initials: 'CP',
    avatarColor: '#65a30d',
  },
  {
    id: 't4',
    quote: 'El Pack Ensalada me salvó la semana. Todo fresco, bien presentado y con instrucciones de conservación.',
    author: 'Felipe A.',
    role: 'Providencia',
    rating: 5,
    initials: 'FA',
    avatarColor: '#a16207',
  },
  {
    id: 't5',
    quote: 'Las paltas en su punto justo y los tomates como los de la casa de mi abuela. Además pagan contra entrega, súper confiable.',
    author: 'Catalina M.',
    role: 'La Florida',
    rating: 5,
    initials: 'CM',
    avatarColor: '#be123c',
  },
];

export default function TestimonialsCarousel() {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width - 48;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const goToSlide = (index) => {
    scrollRef.current?.scrollTo({ x: index * (CARD_WIDTH + 16), animated: true });
    setActiveIndex(index);
  };

  const handleScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
    setActiveIndex(index);
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>TESTIMONIOS</Text>
        <Text style={styles.sectionTitle}>Lo que dicen nuestros clientes</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 16}
      >
        {TESTIMONIALS.map((item) => (
          <View key={item.id} style={[styles.card, { width: CARD_WIDTH }]}>
            <View style={styles.starsRow}>
              {Array.from({ length: item.rating }).map((_, i) => (
                <Text key={i} style={styles.star}>★</Text>
              ))}
            </View>

            <Text style={styles.quote}>"{item.quote}"</Text>

            <View style={styles.authorRow}>
              <View style={[styles.authorAvatar, { backgroundColor: item.avatarColor }]}>
                <Text style={styles.avatarInitial}>{item.initials}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{item.author}</Text>
                <Text style={styles.authorRole}>{item.role}</Text>
              </View>
              <Text style={styles.igHandle}>{INSTAGRAM_URL ? '✔ verificado' : ''}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {TESTIMONIALS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToSlide(i)} style={styles.dotTouchable}>
            <View style={[styles.dot, i === activeIndex && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#80C45B', marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5,
  },
  scrollContent: { paddingHorizontal: 20, gap: 16, paddingBottom: 4 },
  card: {
    backgroundColor: '#163D27',
    borderRadius: 20, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  starsRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
  },
  star: { color: '#E8A838', fontSize: 16, marginRight: 2 },
  quote: {
    color: '#CCCCCC', fontSize: 14, lineHeight: 22,
    fontStyle: 'italic', marginBottom: 18, fontWeight: '400',
  },
  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingTop: 14,
  },
  authorAvatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  authorName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  authorRole: { color: '#666666', fontSize: 11, fontWeight: '500', marginTop: 1 },
  igHandle: { color: '#80C45B', fontSize: 11, fontWeight: '700', marginLeft: 'auto' },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 6,
  },
  dotTouchable: { padding: 4 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: { width: 18, backgroundColor: '#80C45B' },
});
