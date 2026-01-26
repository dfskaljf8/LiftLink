/**
 * Dashboard Screen - Futuristic 2050 Design
 * Holographic cards, glow effects, cyber-organic aesthetic
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, FutureLogo, ParticleField } from '../../src/components/FuturisticUI';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== FUTURISTIC ICONS ====================
const EnergyIcon = ({ size = 24, color = FUTURE_COLORS.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#energyGrad)" />
  </Svg>
);

const FlameIcon = ({ size = 24, color = FUTURE_COLORS.energy }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.energy} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.gold} />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 22C8 22 5 18.5 5 15C5 11.5 7 9 9 7C9 9 10 10 12 10C12 7 11 4 14 2C14 5 17 7 17 11C19 11 19 14 19 15C19 18.5 16 22 12 22Z"
      fill="url(#flameGrad)"
    />
  </Svg>
);

const TrophyIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.gold} />
        <Stop offset="100%" stopColor="#FFA500" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 15C15 15 17 12 17 8V4H7V8C7 12 9 15 12 15Z"
      stroke="url(#trophyGrad)"
      strokeWidth="2"
      fill="none"
    />
    <Path d="M7 4H4V8C4 10 5 11 7 11" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
    <Path d="M17 4H20V8C20 10 19 11 17 11" stroke="url(#trophyGrad)" strokeWidth="2" fill="none" />
    <Path d="M12 15V18" stroke="url(#trophyGrad)" strokeWidth="2" />
    <Rect x="8" y="18" width="8" height="3" rx="1" fill="url(#trophyGrad)" />
  </Svg>
);

const ChatBotIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.secondary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.primary} />
      </LinearGradient>
    </Defs>
    <Rect x="3" y="4" width="18" height="14" rx="3" stroke="url(#chatGrad)" strokeWidth="2" fill="none" />
    <Circle cx="8" cy="11" r="1.5" fill={FUTURE_COLORS.primary} />
    <Circle cx="12" cy="11" r="1.5" fill={FUTURE_COLORS.primary} />
    <Circle cx="16" cy="11" r="1.5" fill={FUTURE_COLORS.primary} />
    <Path d="M8 18L12 22L16 18" stroke="url(#chatGrad)" strokeWidth="2" fill="none" />
  </Svg>
);

const SearchIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="10" cy="10" r="6" stroke={FUTURE_COLORS.primary} strokeWidth="2" fill="none" />
    <Path d="M14.5 14.5L20 20" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="10" cy="10" r="2" fill={FUTURE_COLORS.primary} opacity="0.3" />
  </Svg>
);

const CalendarIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={FUTURE_COLORS.accent} strokeWidth="2" />
    <Path d="M8 2V6" stroke={FUTURE_COLORS.accent} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={FUTURE_COLORS.accent} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="2" fill={FUTURE_COLORS.accent} />
  </Svg>
);

const DumbbellIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6" y="9" width="12" height="6" rx="1" fill={FUTURE_COLORS.primary} opacity="0.5" />
    <Rect x="2" y="7" width="5" height="10" rx="2" fill={FUTURE_COLORS.primary} />
    <Rect x="17" y="7" width="5" height="10" rx="2" fill={FUTURE_COLORS.primary} />
  </Svg>
);

// ==================== STAT CARD ====================
const StatCard = ({ icon, value, label, delay = 0, glowColor = FUTURE_COLORS.primary }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const glowPulse = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowPulse.value,
  }));

  return (
    <Animated.View style={[styles.statCard, { shadowColor: glowColor }, animStyle, glowStyle]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${glowColor}15` }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// ==================== QUICK ACTION ====================
const QuickAction = ({ icon, title, subtitle, onPress, delay = 0 }) => {
  const translateX = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.quickActionIcon}>{icon}</View>
        <View style={styles.quickActionText}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.quickActionArrow}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path d="M9 18L15 12L9 6" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==================== PROGRESS RING ====================
const ProgressRing = ({ progress = 0.7, size = 100 }) => {
  const animatedProgress = useSharedValue(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1500, easing: Easing.out(Easing.ease) });
  }, [progress]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
        </Defs>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={FUTURE_COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.progressLabel}>Weekly Goal</Text>
      </View>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================
export default function DashboardScreen() {
  const router = useRouter();
  const { user, treeProgress, sessions, refreshUserData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Champion';

  return (
    <View style={styles.container}>
      {/* Background particles */}
      <ParticleField count={10} />
      
      {/* Ambient glow orbs */}
      <View style={styles.glowOrb1} pointerEvents="none" />
      <View style={styles.glowOrb2} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={FUTURE_COLORS.primary}
            />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <View style={styles.avatarGlow} />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.progressSection}>
            <View style={styles.progressCard}>
              <View style={styles.progressLeft}>
                <ProgressRing progress={0.72} size={110} />
              </View>
              <View style={styles.progressRight}>
                <Text style={styles.progressTitle}>This Week</Text>
                <Text style={styles.progressDescription}>
                  You're crushing it! Just 2 more sessions to hit your weekly goal.
                </Text>
                <TouchableOpacity style={styles.progressButton}>
                  <Text style={styles.progressButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon={<FlameIcon size={28} />}
              value="7"
              label="Day Streak"
              delay={300}
              glowColor={FUTURE_COLORS.energy}
            />
            <StatCard
              icon={<DumbbellIcon size={28} />}
              value="12"
              label="Workouts"
              delay={400}
              glowColor={FUTURE_COLORS.primary}
            />
            <StatCard
              icon={<TrophyIcon size={28} />}
              value="3"
              label="Achievements"
              delay={500}
              glowColor={FUTURE_COLORS.gold}
            />
          </View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <QuickAction
              icon={<ChatBotIcon size={28} />}
              title="AI Coach"
              subtitle="Get personalized workout advice"
              onPress={() => router.push('/ai-chat')}
              delay={100}
            />
            
            <QuickAction
              icon={<SearchIcon size={28} />}
              title="Find Trainers"
              subtitle="Connect with fitness experts"
              onPress={() => router.push('/(tabs)/trainers')}
              delay={200}
            />
            
            <QuickAction
              icon={<CalendarIcon size={28} />}
              title="Book Session"
              subtitle="Schedule your next workout"
              onPress={() => router.push('/(tabs)/sessions')}
              delay={300}
            />
          </Animated.View>

          {/* Bottom Spacer for Tab Bar */}
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
  glowOrb1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.06,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: FUTURE_COLORS.accent,
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: FUTURE_COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginTop: 4,
  },
  profileButton: {
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 30,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.3,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FUTURE_COLORS.surface,
    borderWidth: 2,
    borderColor: FUTURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: FUTURE_COLORS.primary,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  progressLeft: {
    marginRight: 16,
  },
  progressRight: {
    flex: 1,
    justifyContent: 'center',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
  },
  progressLabel: {
    fontSize: 10,
    color: FUTURE_COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginBottom: 8,
  },
  progressDescription: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressButton: {
    alignSelf: 'flex-start',
  },
  progressButtonText: {
    color: FUTURE_COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: FUTURE_COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  quickActionArrow: {
    opacity: 0.5,
  },
});
