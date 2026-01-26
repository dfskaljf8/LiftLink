/**
 * Dashboard Screen - Futuristic 2050 Design
 * Simplified for stability
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, ParticleField } from '../../src/components/FuturisticUI';

// Icons
const FlameIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="flameG" x1="0%" y1="100%" x2="0%" y2="0%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.energy} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.gold} />
      </LinearGradient>
    </Defs>
    <Path d="M12 22C8 22 5 18.5 5 15C5 11.5 7 9 9 7C9 9 10 10 12 10C12 7 11 4 14 2C14 5 17 7 17 11C19 11 19 14 19 15C19 18.5 16 22 12 22Z" fill="url(#flameG)" />
  </Svg>
);

const DumbbellIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="2" y="9" width="5" height="6" rx="1" fill={FUTURE_COLORS.primary} />
    <Rect x="17" y="9" width="5" height="6" rx="1" fill={FUTURE_COLORS.primary} />
    <Rect x="6" y="10" width="12" height="4" rx="1" fill={FUTURE_COLORS.primary} opacity="0.7" />
  </Svg>
);

const TrophyIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="trophyG" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.gold} />
        <Stop offset="100%" stopColor="#FFA500" />
      </LinearGradient>
    </Defs>
    <Path d="M12 15C15 15 17 12 17 8V4H7V8C7 12 9 15 12 15Z" stroke="url(#trophyG)" strokeWidth="2" fill="none" />
    <Path d="M7 4H4V8C4 10 5 11 7 11" stroke="url(#trophyG)" strokeWidth="2" fill="none" />
    <Path d="M17 4H20V8C20 10 19 11 17 11" stroke="url(#trophyG)" strokeWidth="2" fill="none" />
    <Path d="M12 15V18" stroke="url(#trophyG)" strokeWidth="2" />
    <Rect x="8" y="18" width="8" height="3" rx="1" fill="url(#trophyG)" />
  </Svg>
);

const ChatIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="14" rx="3" stroke={FUTURE_COLORS.secondary} strokeWidth="2" fill="none" />
    <Circle cx="8" cy="11" r="1" fill={FUTURE_COLORS.primary} />
    <Circle cx="12" cy="11" r="1" fill={FUTURE_COLORS.primary} />
    <Circle cx="16" cy="11" r="1" fill={FUTURE_COLORS.primary} />
  </Svg>
);

const SearchIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="10" cy="10" r="6" stroke={FUTURE_COLORS.primary} strokeWidth="2" fill="none" />
    <Path d="M14.5 14.5L20 20" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const CalendarIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={FUTURE_COLORS.accent} strokeWidth="2" />
    <Circle cx="12" cy="16" r="2" fill={FUTURE_COLORS.accent} />
  </Svg>
);

const ChevronIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 18L15 12L9 6" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Stat Card
const StatCard = ({ icon, value, label, color = FUTURE_COLORS.primary }) => (
  <View style={[styles.statCard, { shadowColor: color }]}>
    <View style={[styles.statIconBg, { backgroundColor: `${color}15` }]}>{icon}</View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Quick Action
const QuickAction = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.quickActionIcon}>{icon}</View>
    <View style={styles.quickActionText}>
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </View>
    <ChevronIcon />
  </TouchableOpacity>
);

// Progress Ring
const ProgressRing = ({ progress = 0.7, size = 100 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="progressG" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={FUTURE_COLORS.border} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#progressG)" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </Svg>
      <View style={styles.progressCenter}>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.progressLabel}>Weekly</Text>
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, refreshUserData } = useApp();
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
      <ParticleField count={10} />
      <View style={styles.glowOrb1} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FUTURE_COLORS.primary} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/settings')}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{firstName.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressLeft}>
              <ProgressRing progress={0.72} size={100} />
            </View>
            <View style={styles.progressRight}>
              <Text style={styles.progressTitle}>This Week</Text>
              <Text style={styles.progressDesc}>You're crushing it! Just 2 more sessions to hit your goal.</Text>
              <TouchableOpacity>
                <Text style={styles.viewDetails}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard icon={<FlameIcon size={26} />} value="7" label="Day Streak" color={FUTURE_COLORS.energy} />
            <StatCard icon={<DumbbellIcon size={26} />} value="12" label="Workouts" color={FUTURE_COLORS.primary} />
            <StatCard icon={<TrophyIcon size={26} />} value="3" label="Badges" color={FUTURE_COLORS.gold} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickAction icon={<ChatIcon size={26} />} title="AI Coach" subtitle="Get personalized advice" onPress={() => router.push('/ai-chat')} />
          <QuickAction icon={<SearchIcon size={26} />} title="Find Trainers" subtitle="Connect with experts" onPress={() => router.push('/(tabs)/trainers')} />
          <QuickAction icon={<CalendarIcon size={26} />} title="Book Session" subtitle="Schedule workout" onPress={() => router.push('/calendar')} />

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUTURE_COLORS.void },
  glowOrb1: { position: 'absolute', top: -80, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: FUTURE_COLORS.primary, opacity: 0.06 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: FUTURE_COLORS.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  userName: { fontSize: 28, fontWeight: '800', color: FUTURE_COLORS.text, marginTop: 4 },
  profileButton: { position: 'relative' },
  avatarGlow: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 30, backgroundColor: FUTURE_COLORS.primary, opacity: 0.3 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: FUTURE_COLORS.surface, borderWidth: 2, borderColor: FUTURE_COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: FUTURE_COLORS.primary },
  progressCard: { flexDirection: 'row', backgroundColor: FUTURE_COLORS.surface, borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: FUTURE_COLORS.border },
  progressLeft: { marginRight: 16 },
  progressRight: { flex: 1, justifyContent: 'center' },
  progressCenter: { position: 'absolute', alignItems: 'center' },
  progressText: { fontSize: 22, fontWeight: '800', color: FUTURE_COLORS.text },
  progressLabel: { fontSize: 10, color: FUTURE_COLORS.textSecondary },
  progressTitle: { fontSize: 18, fontWeight: '700', color: FUTURE_COLORS.text, marginBottom: 6 },
  progressDesc: { fontSize: 13, color: FUTURE_COLORS.textSecondary, lineHeight: 18, marginBottom: 10 },
  viewDetails: { color: FUTURE_COLORS.primary, fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: FUTURE_COLORS.surface, borderRadius: 16, padding: 14, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: FUTURE_COLORS.border },
  statIconBg: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: FUTURE_COLORS.text },
  statLabel: { fontSize: 11, color: FUTURE_COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: FUTURE_COLORS.text, marginBottom: 14 },
  quickAction: { flexDirection: 'row', alignItems: 'center', backgroundColor: FUTURE_COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: FUTURE_COLORS.border },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: FUTURE_COLORS.elevated, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  quickActionText: { flex: 1 },
  quickActionTitle: { fontSize: 15, fontWeight: '600', color: FUTURE_COLORS.text },
  quickActionSubtitle: { fontSize: 12, color: FUTURE_COLORS.textSecondary, marginTop: 2 },
});
