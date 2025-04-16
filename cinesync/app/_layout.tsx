// app/_layout.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,           // hide header on all screens
          contentStyle: { backgroundColor: '#2B2C5A' },
        }}
      />
    </SafeAreaProvider>
  );
}
