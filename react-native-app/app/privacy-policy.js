/**
 * Privacy Policy Screen - Futuristic 2050 Design
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField, FutureLogo } from '../src/components/FuturisticUI';

// Back Icon
const BackIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const Section = ({ title, content, delay = 0 }) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ParticleField count={4} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown} style={styles.logoContainer}>
            <FutureLogo size={40} />
            <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
          </Animated.View>

          <Section
            title="1. Information We Collect"
            content="We collect information you provide directly to us, such as when you create an account, update your profile, use interactive features, or contact us for support. This includes your email, fitness preferences, and workout data."
            delay={100}
          />

          <Section
            title="2. How We Use Your Information"
            content="We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and provide AI-powered fitness recommendations tailored to your goals."
            delay={200}
          />

          <Section
            title="3. Data Security"
            content="We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All data is encrypted in transit and at rest."
            delay={300}
          />

          <Section
            title="4. Age Verification Data"
            content="ID documents submitted for age verification are processed securely and are NOT stored permanently. We only extract and verify the date of birth to confirm you are 18 or older."
            delay={400}
          />

          <Section
            title="5. Your Rights"
            content="You may access, update, or delete your account information at any time through the app settings. You may also request a copy of your data or ask us to delete it completely."
            delay={500}
          />

          <Section
            title="6. Contact Us"
            content="If you have any questions about this Privacy Policy, please contact us at privacy@liftlink.app"
            delay={600}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FUTURE_COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FUTURE_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  lastUpdated: {
    fontSize: 12,
    color: FUTURE_COLORS.textMuted,
    marginTop: 12,
  },
  section: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: FUTURE_COLORS.textSecondary,
  },
});
