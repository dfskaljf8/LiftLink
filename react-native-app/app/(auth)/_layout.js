/**
 * Auth Layout - Stack navigator for auth screens
 */

import { Stack } from 'expo-router';
import { useApp } from '../../src/context/AppContext';

export default function AuthLayout() {
  const { colors } = useApp();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="ai-onboarding" />
      <Stack.Screen name="document-verification" />
    </Stack>
  );
}
