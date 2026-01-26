/**
 * Fitness/Map Screen - Futuristic 2050 Design
 * Health data tracking with holographic stats
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Line } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField } from '../../src/components/FuturisticUI';
import { useApp } from '../../src/context/AppContext';

// Animated Icons
const StepsIcon = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="stepsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.accent} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.primary} />
      </LinearGradient>
    </Defs>
    <Path d="M4 18L8 14M8 14L12 18M8 14V6" stroke="url(#stepsGrad)" strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 18L16 14M16 14L20 18M16 14V6" stroke="url(#stepsGrad)" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FlameIcon = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="flameGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.energy} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.gold} />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 22C8 22 5 18.5 5 15C5 11.5 7 9 9 7C9 9 10 10 12 10C12 7 11 4 14 2C14 5 17 7 17 11C19 11 19 14 19 15C19 18.5 16 22 12 22Z"
      fill="url(#flameGrad2)"
    />
  </Svg>
);

const HeartIcon = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF6B6B" />
        <Stop offset="100%" stopColor="#EE5A5A" />
      </LinearGradient>
    </Defs>
    <Path
      d="M20.84 4.61C20.33 4.1 19.72 3.69 19.05 3.42C18.38 3.15 17.67 3 16.95 3C16.23 3 15.52 3.15 14.85 3.42C14.18 3.69 13.57 4.1 13.06 4.61L12 5.67L10.94 4.61C9.91 3.58 8.52 3 7.05 3C5.58 3 4.19 3.58 3.16 4.61C2.13 5.64 1.55 7.03 1.55 8.5C1.55 9.97 2.13 11.36 3.16 12.39L12 21.23L20.84 12.39C21.35 11.88 21.76 11.27 22.03 10.6C22.3 9.93 22.45 9.22 22.45 8.5C22.45 7.78 22.3 7.07 22.03 6.4C21.76 5.73 21.35 5.12 20.84 4.61Z"
      fill="url(#heartGrad)"
    />
  </Svg>
);

const TimerIcon = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.secondary} />
        <Stop offset="100%" stopColor="#9333EA" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="13" r="8" stroke="url(#timerGrad)" strokeWidth="2" fill="none" />
    <Path d="M12 9V13L15 15" stroke="url(#timerGrad)" strokeWidth="2" strokeLinecap="round" />
    <Path d="M12 3V5" stroke="url(#timerGrad)" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SettingsIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="3" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" fill="none" />
    <Path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PlusCircleIcon = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke={FUTURE_COLORS.primary} strokeWidth="2" fill="none" />
    <Path d="M12 8V16M8 12H16" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Stat Card Component
const FitnessCard = ({ icon, title, value, unit, color, delay = 0 }) => (
  <Animated.View entering={FadeInUp.delay(delay)} style={[styles.card, { shadowColor: color }]}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
      {icon}
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.valueRow}>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardUnit}>{unit}</Text>
    </View>
  </Animated.View>
);

export default function FitnessScreen() {
  const { user } = useApp();

  return (
    <View style={styles.container}>
      <ParticleField count={8} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown}>
            <Text style={styles.title}>Fitness Tracking</Text>
          </Animated.View>

          {/* Today's Stats */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.sectionTitle}>Today's Activity</Text>
          </Animated.View>
          
          <View style={styles.cardGrid}>
            <FitnessCard
              icon={<StepsIcon />}
              title="Steps"
              value="8,432"
              unit="steps"
              color={FUTURE_COLORS.accent}
              delay={200}
            />
            <FitnessCard
              icon={<FlameIcon />}
              title="Calories"
              value="420"
              unit="kcal"
              color={FUTURE_COLORS.energy}
              delay={300}
            />
            <FitnessCard
              icon={<HeartIcon />}
              title="Heart Rate"
              value="72"
              unit="bpm"
              color="#FF6B6B"
              delay={400}
            />
            <FitnessCard
              icon={<TimerIcon />}
              title="Active"
              value="45"
              unit="min"
              color={FUTURE_COLORS.secondary}
              delay={500}
            />
          </View>

          {/* Connected Apps */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <Text style={styles.sectionTitle}>Connected Apps</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(700)} style={styles.connectCard}>
            <View style={styles.appRow}>
              <View style={[styles.appIcon, { backgroundColor: `${FUTURE_COLORS.primary}15` }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="10" stroke={FUTURE_COLORS.primary} strokeWidth="2" fill="none" />
                  <Path d="M12 6V12L16 14" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>Google Fit</Text>
                <Text style={styles.appStatusConnected}>Connected</Text>
              </View>
              <TouchableOpacity style={styles.appSettingsButton}>
                <SettingsIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.appRow}>
              <View style={[styles.appIcon, { backgroundColor: `${FUTURE_COLORS.error}15` }]}>
                <HeartIcon size={24} />
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>Apple Health</Text>
                <Text style={styles.appStatusDisconnected}>Tap to connect</Text>
              </View>
              <PlusCircleIcon />
            </TouchableOpacity>
          </Animated.View>

          {/* Weekly Summary */}
          <Animated.View entering={FadeInDown.delay(800)}>
            <Text style={styles.sectionTitle}>This Week</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(900)} style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Workouts</Text>
              <Text style={styles.summaryValue}>5</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Minutes</Text>
              <Text style={styles.summaryValue}>320 min</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Calories Burned</Text>
              <Text style={styles.summaryValue}>2,450 kcal</Text>
            </View>
          </Animated.View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
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
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: FUTURE_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  card: {
    width: '48%',
    backgroundColor: FUTURE_COLORS.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginBottom: 6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  cardUnit: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginLeft: 4,
  },
  connectCard: {
    backgroundColor: FUTURE_COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: 14,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  appStatusConnected: {
    fontSize: 12,
    color: FUTURE_COLORS.accent,
    marginTop: 2,
  },
  appStatusDisconnected: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  appSettingsButton: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: FUTURE_COLORS.border,
    marginVertical: 16,
  },
  summaryCard: {
    backgroundColor: FUTURE_COLORS.surface,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: FUTURE_COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: FUTURE_COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
  },
});
