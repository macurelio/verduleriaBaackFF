import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, MessageCircle, Package, TrendingUp, Users } from 'lucide-react-native';
import { openWhatsApp } from '../config';

const BENEFITS = [
  {
    Icon: Package,
    title: 'Producto fresco del día',
    desc: 'Verduras y frutas seleccionadas cada mañana, listas para tu negocio.',
  },
  {
    Icon: TrendingUp,
    title: 'Precios por volumen',
    desc: 'Condiciones preferenciales para restaurantes, casinos, juguerías y ferias.',
  },
  {
    Icon: Users,
    title: 'Despacho programado',
    desc: 'Coordina entregas semanales fijas dentro del Gran Santiago.',
  },
];

export default function WorkWithUsModal({ visible, onClose }) {
  const openContact = () =>
    openWhatsApp('¡Hola Mora Verduras! Quiero información para comprar al por mayor.');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.handle} />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🧺</Text>
          </View>

          <Text style={styles.eyebrow}>MAYORISTAS & NEGOCIOS</Text>
          <Text style={styles.headline}>
            Lleva verdura fresca a tus clientes.
          </Text>
          <Text style={styles.body}>
            Trabajamos con restaurantes, casinos, juguerías, ferias y almacenes que necesitan
            abastecimiento fresco, constante y a buen precio en el Gran Santiago.
          </Text>

          <View style={styles.divider} />

          {BENEFITS.map(({ Icon, title, desc }) => (
            <View key={title} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Icon color="#80C45B" size={20} />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{title}</Text>
                <Text style={styles.benefitDesc}>{desc}</Text>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          <TouchableOpacity style={styles.cta} onPress={openContact} activeOpacity={0.85}>
            <MessageCircle color="#0E2C1C" size={20} />
            <Text style={styles.ctaText}>Contactar por WhatsApp</Text>
          </TouchableOpacity>

          <Text style={styles.emailNote}>Pedidos y consultas por WhatsApp</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E2C1C' },
  topBar: {
    paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  content: { paddingHorizontal: 28, paddingBottom: 48, paddingTop: 12 },
  logoBadge: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: '#163D27',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, marginTop: 8,
    borderWidth: 1, borderColor: 'rgba(124,179,66,0.3)',
  },
  logoEmoji: { fontSize: 40 },
  eyebrow: {
    color: '#80C45B', fontSize: 10, fontWeight: '800',
    letterSpacing: 2.5, marginBottom: 10,
  },
  headline: {
    color: '#FFFFFF', fontSize: 28, fontWeight: '900',
    letterSpacing: -0.5, lineHeight: 34, marginBottom: 14,
  },
  body: {
    color: '#777777', fontSize: 15, lineHeight: 24, marginBottom: 28,
  },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row', gap: 16, marginBottom: 22, alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(124,179,66,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(124,179,66,0.2)',
  },
  benefitText: { flex: 1 },
  benefitTitle: {
    color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginBottom: 4,
  },
  benefitDesc: { color: '#666666', fontSize: 13, lineHeight: 20 },
  cta: {
    backgroundColor: '#80C45B',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10, marginBottom: 16,
  },
  ctaText: { color: '#0E2C1C', fontSize: 16, fontWeight: '900' },
  emailNote: {
    color: '#444444', fontSize: 12, textAlign: 'center',
  },
});
