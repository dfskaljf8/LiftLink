/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { colors } = useApp();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: January 2025
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          By accessing or using LiftLink, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our services.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          LiftLink is an AI-powered fitness coaching platform that connects trainees with
          certified personal trainers. Our services include workout planning, progress tracking,
          and personalized fitness recommendations.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You are responsible for maintaining the confidentiality of your account credentials
          and for all activities that occur under your account. You must notify us immediately
          of any unauthorized use.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Conduct</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          You agree not to use the service for any unlawful purpose or in any way that could
          damage, disable, or impair our services. You will not attempt to gain unauthorized
          access to any part of the service.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
          LiftLink is not liable for any indirect, incidental, special, or consequential damages
          arising out of your use of the service. Always consult with a healthcare professional
          before beginning any fitness program.
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
