/**
 * Dashboard Screen
 * Role-based dashboard (Trainer vs Trainee)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, colors, treeProgress, sessions } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const response = await axios.get(`${API_URL}/dashboard/${user?.id}`).catch(() => null);
      if (response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const isTrainer = user?.role === 'trainer';

  const QuickActionCard = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.quickActionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );

  const StatCard = ({ label, value, icon }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {isTrainer ? 'Welcome back, Coach' : 'Welcome back'}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'User'} 👋
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationBtn, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            label="Sessions"
            value={sessions?.length || 0}
            icon="calendar-outline"
          />
          <StatCard
            label="Tree Level"
            value={treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
            icon="leaf-outline"
          />
          <StatCard
            label={isTrainer ? 'Clients' : 'Streak'}
            value={isTrainer ? stats?.clientCount || 0 : stats?.streak || 0}
            icon={isTrainer ? 'people-outline' : 'flame-outline'}
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionCard
            icon="chatbubbles-outline"
            title="AI Coach"
            subtitle="Chat with AI"
            color={colors.primary}
            onPress={() => router.push('/ai-chat')}
          />
          <QuickActionCard
            icon="search-outline"
            title="Find Trainer"
            subtitle="Browse trainers"
            color={colors.accent}
            onPress={() => router.push('/(tabs)/trainers')}
          />
          {isTrainer && (
            <>
              <QuickActionCard
                icon="analytics-outline"
                title="Command Center"
                subtitle="AI insights"
                color="#f59e0b"
                onPress={() => router.push('/ai-command-center')}
              />
              <QuickActionCard
                icon="rocket-outline"
                title="Coaching Hub"
                subtitle="Automation"
                color="#8b5cf6"
                onPress={() => router.push('/coaching-hub')}
              />
            </>
          )}
        </View>

        {/* Recent Sessions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
        {sessions?.length > 0 ? (
          sessions.slice(0, 3).map((session, index) => (
            <View key={index} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionType, { color: colors.text }]}>
                  {session.session_type || 'Training Session'}
                </Text>
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                  {session.duration_minutes || 60} minutes
                </Text>
              </View>
              <View style={[styles.sessionStatus, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.sessionStatusText, { color: colors.accent }]}>
                  {session.status || 'Completed'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No sessions yet. Book your first session!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
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
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 14,
    marginTop: 4,
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
