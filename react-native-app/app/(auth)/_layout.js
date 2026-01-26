/**
 * Auth Layout - Stack navigator for auth screens
 * Futuristic 2050 theme
 */

import { Stack } from 'expo-router';
import { FUTURE_COLORS } from '../../src/components/FuturisticUI';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: FUTURE_COLORS.void },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-onboarding" />
      <Stack.Screen name="document-verification" />
    </Stack>
  );
}
