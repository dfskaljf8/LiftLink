/**
 * Dashboard Screen
 * Dark theme with lime green accents - Inspired by LiftLink design
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import {
  COLORS,
  LiftLinkLogo,
  DumbbellIcon,
  FireIcon,
  TrophyIcon,
  ChatIcon,
  SearchPersonIcon,
  CalendarIcon,
  StarIcon,
} from '../../src/components/CustomIllustrations';
import { Button } from '../../src/components/AnimatedButton';

// Stat Card
const StatCard = ({ icon, value, label, delay = 0 }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.statCard, animStyle]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// Quick Action Button
const QuickAction = ({ icon, title, onPress, delay = 0 }) => {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.quickActionIcon}>{icon}</View>
        <Text style={styles.quickActionTitle}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Mentor Card
const MentorCard = ({ name, specialty, rating, image }) => (
  <TouchableOpacity style={styles.mentorCard} activeOpacity={0.8}>
    <View style={styles.mentorAvatar}>
      <Text style={styles.mentorAvatarText}>{name?.charAt(0) || 'M'}</Text>
    </View>
    <View style={styles.mentorInfo}>
      <Text style={styles.mentorName}>{name}</Text>
      <Text style={styles.mentorSpecialty}>{specialty}</Text>
    </View>
    <View style={styles.mentorRating}>
      <StarIcon size={14} color={COLORS.primary} />
      <Text style={styles.ratingText}>{rating}</Text>
    </View>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { user, sessions } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const isTrainer = user?.role === 'trainer';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Mock data for mentors
  const mentors = [
    { name: 'Herbert Lindsey', specialty: 'Strength Training', rating: '4.9' },
    { name: 'Sarah Chen', specialty: 'HIIT & Cardio', rating: '4.8' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'Champion'}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {user?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Today's Workout Card */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>Today's Workout</Text>
              <View style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeText}>In Progress</Text>
              </View>
            </View>
            
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <DumbbellIcon size={28} color={COLORS.primary} />
                <Text style={styles.workoutStatValue}>45 min</Text>
                <Text style={styles.workoutStatLabel}>Duration</Text>
              </View>
              <View style={styles.workoutStatDivider} />
              <View style={styles.workoutStat}>
                <FireIcon size={28} color={COLORS.primary} />
                <Text style={styles.workoutStatValue}>320</Text>
                <Text style={styles.workoutStatLabel}>Calories</Text>
              </View>
              <View style={styles.workoutStatDivider} />
              <View style={styles.workoutStat}>
                <TrophyIcon size={28} color={COLORS.primary} />
                <Text style={styles.workoutStatValue}>5</Text>
                <Text style={styles.workoutStatLabel}>Exercises</Text>
              </View>
            </View>

            <Button
              title="Continue Workout"
              onPress={() => {}}
              variant="primary"
              size="medium"
              style={{ marginTop: 16 }}
            />
          </Animated.View>

          {/* Quick Stats */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon={<FireIcon size={24} color={COLORS.primary} />}
              value={sessions?.length || 7}
              label="Day Streak"
              delay={200}
            />
            <StatCard
              icon={<DumbbellIcon size={24} color={COLORS.primary} />}
              value={sessions?.length || 12}
              label="Workouts"
              delay={300}
            />
            <StatCard
              icon={<TrophyIcon size={24} color={COLORS.primary} />}
              value="Level 3"
              label="Rank"
              delay={400}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon={<ChatIcon size={28} color={COLORS.primary} />}
              title="AI Coach"
              onPress={() => router.push('/ai-chat')}
              delay={500}
            />
            <QuickAction
              icon={<SearchPersonIcon size={28} color={COLORS.primary} />}
              title="Find Mentor"
              onPress={() => router.push('/(tabs)/trainers')}
              delay={600}
            />
            <QuickAction
              icon={<CalendarIcon size={28} color={COLORS.primary} />}
              title="Schedule"
              onPress={() => router.push('/(tabs)/sessions')}
              delay={700}
            />
          </View>

          {/* Top Mentors */}
          <View style={styles.mentorsHeader}>
            <Text style={styles.sectionTitle}>Top Mentors</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trainers')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {mentors.map((mentor, index) => (
            <MentorCard key={index} {...mentor} />
          ))}

          {/* Motivational Quote */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Wherever You Are, Health Is Number One"
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  profileButton: {
    padding: 2,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.background,
  },
  workoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  workoutBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  workoutBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  workoutStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  workoutStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    width: '30%',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  mentorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mentorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.background,
  },
  mentorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  mentorSpecialty: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mentorRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  quoteCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  quoteText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
