/**
 * Terms of Service Screen - Futuristic 2050 Design
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

export default function TermsOfServiceScreen() {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown} style={styles.logoContainer}>
            <FutureLogo size={40} />
            <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
          </Animated.View>

          <Section
            title="1. Acceptance of Terms"
            content="By accessing or using LiftLink, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
            delay={100}
          />

          <Section
            title="2. Age Requirements"
            content="You must be at least 18 years old to use LiftLink. We verify user ages through government-issued ID verification to comply with fitness industry regulations."
            delay={200}
          />

          <Section
            title="3. User Accounts"
            content="You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please notify us immediately of any unauthorized use."
            delay={300}
          />

          <Section
            title="4. Fitness Disclaimer"
            content="LiftLink provides fitness information and AI recommendations for educational purposes only. Always consult with a qualified healthcare provider before starting any new fitness program."
            delay={400}
          />

          <Section
            title="5. Trainer Services"
            content="LiftLink connects users with independent fitness trainers. We are not responsible for the services provided by trainers. Users should verify trainer qualifications independently."
            delay={500}
          />

          <Section
            title="6. Termination"
            content="We reserve the right to terminate or suspend your account at any time for violation of these terms or any other reason at our sole discretion."
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
