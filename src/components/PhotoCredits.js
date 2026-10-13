import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { theme } from '../theme';
const credits = require('../../assets/photos/CREDITS.json');
export default function PhotoCredits() {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 8 }}>
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.accent }}>Créditos de fotografías</Text></TouchableOpacity>
    {open && credits.map(credit => <View key={credit.product}>
      <Text style={{ color: theme.muted }}>{credit.product}: {credit.author} · {credit.license}</Text>
      <TouchableOpacity accessibilityRole="link" onPress={() => Linking.openURL(credit.source)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.accent }}>Ver fotografía y licencia</Text></TouchableOpacity>
    </View>)}
  </View>;
}
