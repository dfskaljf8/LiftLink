/**
 * Dashboard Screen
 * Cartoonish animated dashboard with custom graphics
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  FadeInDown,
  FadeInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import {
  LiftLinkMascot,
  AnimatedTree,
  FireIcon,
  HeartIcon,
  TrophyIcon,
  LightningIcon,
  TrainerAvatar,
} from '../../src/components/CustomIllustrations';
import { CartoonButton, CartoonIconButton } from '../../src/components/AnimatedButton';
import axios from 'axios';
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

// Custom animated stat card
const StatCard = ({ icon, label, value, color, delay = 0 }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 12 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statCard, animStyle]}>
      <LinearGradient
        colors={[color + '30', color + '10']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIconContainer, { backgroundColor: color + '40' }]}>
          {icon}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

// Quick action button with bounce
const QuickAction = ({ icon, title, subtitle, color, onPress, delay = 0 }) => {
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.quickAction, animStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.quickActionGradient}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: color + '30' }]}>
            {icon}
          </View>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          <View style={[styles.quickActionArrow, { backgroundColor: color }]}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Chat bubble icon
const ChatIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
      fill="#6366f1"
    />
    <Circle cx="8" cy="10" r="1.5" fill="white" />
    <Circle cx="12" cy="10" r="1.5" fill="white" />
    <Circle cx="16" cy="10" r="1.5" fill="white" />
  </Svg>
);

// Trainer search icon
const SearchIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="10" cy="10" r="7" stroke="#10b981" strokeWidth="3" fill="none" />
    <Path d="M15 15L21 21" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

// Robot/AI icon
const RobotIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#d97706" />
      </SvgGradient>
    </Defs>
    <Path
      d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V18C18 19.1 17.1 20 16 20H8C6.9 20 6 19.1 6 18V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2Z"
      fill="url(#robotGrad)"
    />
    <Circle cx="9" cy="12" r="2" fill="white" />
    <Circle cx="15" cy="12" r="2" fill="white" />
    <Path d="M9 16H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <Path d="M4 10V14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <Path d="M20 10V14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Rocket icon
const RocketIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C12 2 7 6 7 12C7 14 8 16 9 18L12 17L15 18C16 16 17 14 17 12C17 6 12 2 12 2Z"
      fill="#8b5cf6"
    />
    <Circle cx="12" cy="10" r="2" fill="white" />
    <Path d="M9 18L7 22L10 20L9 18Z" fill="#f59e0b" />
    <Path d="M15 18L17 22L14 20L15 18Z" fill="#f59e0b" />
    <Path d="M12 17L12 22" stroke="#ef4444" strokeWidth="2" />
  </Svg>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { user, colors, treeProgress, sessions } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const isTrainer = user?.role === 'trainer';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const greetingBounce = useSharedValue(0);

  useEffect(() => {
    greetingBounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const greetingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: greetingBounce.value }],
  }));

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Animated.View style={greetingStyle}>
              <Text style={styles.greeting}>
                {isTrainer ? 'Hey Coach! 🏆' : 'Hey Champ! 💪'}
              </Text>
              <Text style={styles.userName}>{user?.name || 'Fitness Star'}</Text>
            </Animated.View>
            
            <TouchableOpacity style={styles.notificationBtn}>
              <View style={styles.notificationDot} />
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Mini Mascot with Tree */}
          <Animated.View entering={ZoomIn.delay(200)} style={styles.mascotSection}>
            <View style={styles.mascotTreeContainer}>
              <View style={styles.miniMascot}>
                <LiftLinkMascot size={100} />
              </View>
              <View style={styles.treeContainer}>
                <AnimatedTree stage={treeProgress?.current_level || 'seed'} size={120} />
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                🌱 {(treeProgress?.current_level || 'seed').replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon={<FireIcon size={28} />}
              label="Streak"
              value={`${sessions?.length || 0}`}
              color="#f59e0b"
              delay={100}
            />
            <StatCard
              icon={<HeartIcon size={28} />}
              label="Sessions"
              value={`${sessions?.length || 0}`}
              color="#ef4444"
              delay={200}
            />
            <StatCard
              icon={<TrophyIcon size={28} />}
              label={isTrainer ? 'Clients' : 'Goals'}
              value={isTrainer ? '12' : '3'}
              color="#f59e0b"
              delay={300}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon={<ChatIcon size={32} />}
              title="AI Coach"
              subtitle="Chat now"
              color="#6366f1"
              onPress={() => router.push('/ai-chat')}
              delay={400}
            />
            <QuickAction
              icon={<SearchIcon size={32} />}
              title="Find Trainer"
              subtitle="Near you"
              color="#10b981"
              onPress={() => router.push('/(tabs)/trainers')}
              delay={500}
            />
            {isTrainer && (
              <>
                <QuickAction
                  icon={<RobotIcon size={32} />}
                  title="AI Center"
                  subtitle="Insights"
                  color="#f59e0b"
                  onPress={() => router.push('/ai-command-center')}
                  delay={600}
                />
                <QuickAction
                  icon={<RocketIcon size={32} />}
                  title="Coaching"
                  subtitle="Automate"
                  color="#8b5cf6"
                  onPress={() => router.push('/coaching-hub')}
                  delay={700}
                />
              </>
            )}
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity 📊</Text>
          <Animated.View entering={FadeInDown.delay(600)} style={styles.activityCard}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.activityGradient}
            >
              {sessions?.length > 0 ? (
                sessions.slice(0, 3).map((session, index) => (
                  <View key={index} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <LightningIcon size={20} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>
                        {session.session_type || 'Training Session'}
                      </Text>
                      <Text style={styles.activitySubtitle}>
                        {session.duration_minutes || 60} min • Completed
                      </Text>
                    </View>
                    <View style={styles.activityBadge}>
                      <Text style={styles.activityBadgeText}>+10 XP</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyActivity}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No sessions yet!</Text>
                  <Text style={styles.emptySubtitle}>
                    Book your first session to start growing your tree
                  </Text>
                  <CartoonButton
                    title="Find a Trainer"
                    onPress={() => router.push('/(tabs)/trainers')}
                    variant="success"
                    size="small"
                  />
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Motivational Quote */}
          <Animated.View entering={FadeInDown.delay(800)} style={styles.quoteCard}>
            <Text style={styles.quoteEmoji}>💬</Text>
            <Text style={styles.quoteText}>
              "The only bad workout is the one that didn't happen!"
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
    color: '#a5b4fc',
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginTop: 4,
  },
  notificationBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascotTreeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  miniMascot: {
    marginRight: -20,
    zIndex: 1,
  },
  treeContainer: {
    marginLeft: -20,
  },
  levelBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  levelText: {
    color: '#a5b4fc',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    width: '48%',
    marginBottom: 12,
  },
  quickActionGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  quickActionArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  activityCard: {
    marginBottom: 24,
  },
  activityGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  activityBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activityBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  quoteCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    color: '#a5b4fc',
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 20,
  },
});
