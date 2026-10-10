import { theme } from './src/theme';
import { useReducedMotion } from './src/hooks/useReducedMotion';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import CartScreen from './src/screens/CartScreen';
import { CartProvider } from './src/context/CartContext';
import SplashBanner from './src/components/SplashBanner';
import { BRAND_NAME } from './src/config';

const Stack = createNativeStackNavigator();

export default function App() {
  const reducedMotion = useReducedMotion();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.surface },
              headerTintColor: theme.text,
              headerTitleStyle: { fontWeight: '900', color: theme.text },
              contentStyle: { backgroundColor: theme.canvas },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false, title: BRAND_NAME }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                title: 'Tu pedido',
                headerStyle: { backgroundColor: theme.canvas },
                headerTintColor: theme.accent,
                headerTitleStyle: { fontWeight: '900', color: theme.text },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>

        {/* Splash banner rendered on top of everything */}
        {showSplash && !reducedMotion && (
          <SplashBanner onFinish={() => setShowSplash(false)} />
        )}
      </CartProvider>
    </SafeAreaProvider>
  );
}
