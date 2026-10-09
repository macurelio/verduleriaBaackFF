import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export default function SplashBanner({ onFinish }) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(containerOpacity, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]} pointerEvents="none">
      <Animated.View
        style={[styles.ring, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}
      >
        <Text style={styles.logoEmoji}>🥬</Text>
      </Animated.View>

      <Animated.Text style={[styles.brand, { opacity: textOpacity }]}>
        Mora<Text style={styles.brandAccent}>Verduras</Text>
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Bienvenido al mercado fresco
      </Animated.Text>

      <Animated.View style={[styles.dotsRow, { opacity: taglineOpacity }]}>
        {[0, 1, 2].map(i => (
          <Text key={i} style={[styles.dot, i === 1 && styles.dotActive]}>•</Text>
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0E2C1C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  ring: {
    width: 120, height: 120,
    borderRadius: 30,
    backgroundColor: '#141414',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(124,179,66,0.35)',
    shadowColor: '#80C45B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 12,
  },
  logoEmoji: { fontSize: 64 },
  brand: {
    color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -1,
  },
  brandAccent: { color: '#80C45B' },
  tagline: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13, letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  dotsRow: {
    flexDirection: 'row', gap: 6, marginTop: 32,
  },
  dot: {
    color: 'rgba(255,255,255,0.2)', fontSize: 22, lineHeight: 22,
  },
  dotActive: {
    color: '#80C45B',
  },
});
