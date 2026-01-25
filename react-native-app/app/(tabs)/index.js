/**
 * Dashboard Screen
 * Duolingo-style: Clean stats, smooth animations, professional gamification
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import {
  MiniMascot,
  ProgressTree,
  FlameIcon,
  HeartIcon,
  TargetIcon,
  TrophyIcon,
  ChatBubbleIcon,
  SearchIcon,
  CalendarIcon,
  BoltIcon,
  FloatingDots,
} from '../../src/components/CustomIllustrations';
import { Button, ActionButton, IconButton } from '../../src/components/AnimatedButton';

const { width } = Dimensions.get('window');

// Stat card component
const StatCard = ({ icon, value, label, color, delay = 0 }) => {
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
      <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// Quick action card
const QuickActionCard = ({ icon, title, subtitle, onPress, delay = 0 }) => {
  const translateX = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withDelay(delay, withSpring(0, { damping: 15 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity 
        style={styles.quickActionCard} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.quickActionIcon}>{icon}</View>
        <View style={styles.quickActionText}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.quickActionArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, treeProgress, sessions } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const isTrainer = user?.role === 'trainer';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <FloatingDots count={4} />
      
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
            <View style={styles.headerLeft}>
              <MiniMascot size={44} />
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.userName}>{user?.name || 'Champion'}</Text>
              </View>
            </View>
            <IconButton
              icon={<Text style={styles.bellIcon}>🔔</Text>}
              size={44}
              backgroundColor="#1e293b"
            />
          </View>

          {/* Progress Section */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.progressSection}>
            <View style={styles.progressCard}>
              <View style={styles.progressLeft}>
                <Text style={styles.progressTitle}>Your Growth</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>
                    {(treeProgress?.current_level || 'seed').replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.progressSubtext}>
                  {sessions?.length || 0} sessions completed
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min((sessions?.length || 0) * 10, 100)}%` }]} />
                </View>
              </View>
              <View style={styles.progressRight}>
                <ProgressTree stage={treeProgress?.current_level || 'seed'} size={120} />
              </View>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              icon={<FlameIcon size={24} />}
              value={sessions?.length || 0}
              label="Streak"
              color="#f59e0b"
              delay={200}
            />
            <StatCard
              icon={<HeartIcon size={24} />}
              value={sessions?.length || 0}
              label="Sessions"
              color="#ef4444"
              delay={300}
            />
            <StatCard
              icon={<TrophyIcon size={24} />}
              value={isTrainer ? '12' : '3'}
              label={isTrainer ? 'Clients' : 'Goals'}
              color="#f59e0b"
              delay={400}
            />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <QuickActionCard
            icon={<ChatBubbleIcon size={28} color="#6366f1" />}
            title="AI Coach"
            subtitle="Get personalized advice"
            onPress={() => router.push('/ai-chat')}
            delay={500}
          />
          
          <QuickActionCard
            icon={<SearchIcon size={28} color="#10b981" />}
            title="Find Trainers"
            subtitle="Browse trainers near you"
            onPress={() => router.push('/(tabs)/trainers')}
            delay={600}
          />

          {isTrainer && (
            <>
              <QuickActionCard
                icon={<BoltIcon size={28} color="#f59e0b" />}
                title="AI Command Center"
                subtitle="Manage suggestions & insights"
                onPress={() => router.push('/ai-command-center')}
                delay={700}
              />
              <QuickActionCard
                icon={<TargetIcon size={28} color="#8b5cf6" />}
                title="Coaching Hub"
                subtitle="Automate your coaching"
                onPress={() => router.push('/coaching-hub')}
                delay={800}
              />
            </>
          )}

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Animated.View entering={FadeInDown.delay(700)} style={styles.activityCard}>
            {sessions?.length > 0 ? (
              sessions.slice(0, 3).map((session, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.activityItem,
                    index < 2 && styles.activityItemBorder
                  ]}
                >
                  <View style={styles.activityIconBg}>
                    <BoltIcon size={20} color="#8b5cf6" />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {session.session_type || 'Training Session'}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {session.duration_minutes || 60} min
                    </Text>
                  </View>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpText}>+10 XP</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Text style={styles.emptyIcon}>🎯</Text>
                <Text style={styles.emptyTitle}>No sessions yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start your fitness journey today!
                </Text>
                <Button
                  title="Find a Trainer"
                  onPress={() => router.push('/(tabs)/trainers')}
                  variant="success"
                  size="medium"
                  fullWidth={false}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </Animated.View>

          {/* Motivational Card */}
          <Animated.View entering={FadeInDown.delay(900)} style={styles.motivationCard}>
            <Text style={styles.motivationQuote}>
              "The only bad workout is the one that didn't happen."
            </Text>
            <Text style={styles.motivationAuthor}>— Keep pushing! 💪</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  bellIcon: {
    fontSize: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  progressSubtext: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressRight: {
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    color: '#64748b',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    flex: 1,
    marginLeft: 14,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  quickActionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  activityIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#8b5cf615',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  activitySubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  xpBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  motivationCard: {
    backgroundColor: '#6366f115',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#6366f130',
  },
  motivationQuote: {
    fontSize: 15,
    color: '#a5b4fc',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  motivationAuthor: {
    fontSize: 13,
    color: '#6366f1',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
});
