// app/_layout.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';

// 👇 Suppress that specific annoying warning
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
]);


export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#2B2C5A' },
        }}
      />
    </SafeAreaProvider>
  );
}
