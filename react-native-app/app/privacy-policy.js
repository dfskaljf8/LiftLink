/**
 * Privacy Policy Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: January 2025
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We collect information you provide directly to us, such as when you create an account,
          update your profile, use interactive features, or contact us for support.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We use the information we collect to provide, maintain, and improve our services,
          including to personalize your experience and provide AI-powered fitness recommendations.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Security</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          We take reasonable measures to help protect your personal information from loss, theft,
          misuse, and unauthorized access, disclosure, alteration, and destruction.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Your Rights</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You may access, update, or delete your account information at any time through the app
          settings. You may also request a copy of your data or ask us to delete it.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Contact Us</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          If you have any questions about this Privacy Policy, please contact us at
          privacy@liftlink.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
});
