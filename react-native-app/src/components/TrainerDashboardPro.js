/**
 * Enhanced Trainer Dashboard - AI-Powered Coaching Hub
 * Shows clients overview, AI alerts, automations, and quick actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const API_URL = 'https://trainer-match-14.preview.emergentagent.com';

const VIBE_COLORS = {
  dog_mode: '#ef4444',
  soft_grind: '#3b82f6',
  easy_restart: '#10b981'
};

const VIBE_EMOJIS = {
  dog_mode: '🔥',
  soft_grind: '💪',
  easy_restart: '🌱'
};

const TrainerDashboardPro = ({ trainerId, trainerName }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/trainer/dashboard/${trainerId}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const { trainer, stats, alerts, recent_activity, clients } = dashboardData || {};

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.trainerName}>{trainer?.name || trainerName || 'Coach'}</Text>
      </View>
      <TouchableOpacity style={styles.settingsButton}>
        <Icon name="settings" size={24} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.total_clients || 0}</Text>
        <Text style={styles.statLabel}>Total Clients</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.active_clients || 0}</Text>
        <Text style={styles.statLabel}>Active Today</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats?.content_items || 0}</Text>
        <Text style={styles.statLabel}>Content Items</Text>
      </View>
    </View>
  );

  const renderAlerts = () => {
    const needsAttention = alerts?.needs_attention || [];
    const onFire = alerts?.on_fire || [];

    if (needsAttention.length === 0 && onFire.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Attention Needed</Text>
        
        {needsAttention.length > 0 && (
          <View style={styles.alertsContainer}>
            {needsAttention.map((client, idx) => (
              <TouchableOpacity key={idx} style={styles.alertCard}>
                <View style={[styles.alertIndicator, { backgroundColor: '#ef4444' }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertName}>{client.name}</Text>
                  <Text style={styles.alertReason}>
                    {client.reason === 'low_energy' ? '😴 Low energy reported' : '⚠️ Streak broken'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.alertAction}>
                  <Icon name="message" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {onFire.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>🔥 On Fire</Text>
            <View style={styles.alertsContainer}>
              {onFire.map((client, idx) => (
                <TouchableOpacity key={idx} style={styles.alertCard}>
                  <View style={[styles.alertIndicator, { backgroundColor: '#f59e0b' }]} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertName}>{client.name}</Text>
                    <Text style={styles.alertReason}>🔥 {client.streak}-day streak!</Text>
                  </View>
                  <TouchableOpacity style={styles.alertAction}>
                    <Icon name="celebration" size={20} color="#f59e0b" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}>
          <Icon name="add" size={24} color="#fff" />
          <Text style={styles.actionText}>Add Client</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}>
          <Icon name="auto-awesome" size={24} color="#fff" />
          <Text style={styles.actionText}>AI Program</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10b981' }]}>
          <Icon name="library-add" size={24} color="#fff" />
          <Text style={styles.actionText}>Add Content</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}>
          <Icon name="campaign" size={24} color="#fff" />
          <Text style={styles.actionText}>Broadcast</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderClients = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👥 Your Clients</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {clients && clients.length > 0 ? (
        <View style={styles.clientsGrid}>
          {clients.slice(0, 6).map((client, idx) => (
            <TouchableOpacity key={idx} style={styles.clientCard}>
              <View style={styles.clientAvatar}>
                {client.profile_image ? (
                  <Image source={{ uri: client.profile_image }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {client.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                )}
                <View style={[
                  styles.vibeIndicator,
                  { backgroundColor: VIBE_COLORS[client.vibe] || '#6b7280' }
                ]} />
              </View>
              <Text style={styles.clientName} numberOfLines={1}>{client.name}</Text>
              <View style={styles.clientStats}>
                <Text style={styles.clientStreak}>
                  {client.current_streak > 0 ? `🔥 ${client.current_streak}` : '—'}
                </Text>
                <Text style={styles.clientXp}>{client.total_xp} XP</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="people-outline" size={48} color="#4b5563" />
          <Text style={styles.emptyText}>No clients yet</Text>
          <TouchableOpacity style={styles.addClientButton}>
            <Text style={styles.addClientText}>Add Your First Client</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRecentActivity = () => {
    if (!recent_activity || recent_activity.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Recent Activity</Text>
        {recent_activity.slice(0, 5).map((activity, idx) => (
          <View key={idx} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>
                <Text style={styles.activityName}>{activity.client_name}</Text>
                {' checked in'}
              </Text>
              <Text style={styles.activityMeta}>
                Energy: {activity.energy_level}/5 • Stress: {activity.stress_level}/5
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAutomations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🤖 AI Automations</Text>
        <View style={styles.automationStatus}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <View style={styles.automationsList}>
        <View style={styles.automationItem}>
          <Icon name="notifications-active" size={20} color="#f59e0b" />
          <View style={styles.automationInfo}>
            <Text style={styles.automationName}>Missed Workout Alert</Text>
            <Text style={styles.automationDesc}>Auto-message after 2 missed workouts</Text>
          </View>
          <View style={styles.automationToggle}>
            <View style={styles.toggleOn} />
          </View>
        </View>

        <View style={styles.automationItem}>
          <Icon name="local-fire-department" size={20} color="#ef4444" />
          <View style={styles.automationInfo}>
            <Text style={styles.automationName}>Streak Celebration</Text>
            <Text style={styles.automationDesc}>Reward at 7, 14, 30 day milestones</Text>
          </View>
          <View style={styles.automationToggle}>
            <View style={styles.toggleOn} />
          </View>
        </View>

        <View style={styles.automationItem}>
          <Icon name="auto-fix-high" size={20} color="#3b82f6" />
          <View style={styles.automationInfo}>
            <Text style={styles.automationName}>Workout Adaptation</Text>
            <Text style={styles.automationDesc}>Auto-adjust based on check-ins</Text>
          </View>
          <View style={styles.automationToggle}>
            <View style={styles.toggleOn} />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderStats()}
        {renderAlerts()}
        {renderQuickActions()}
        {renderClients()}
        {renderAutomations()}
        {renderRecentActivity()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#9ca3af',
  },
  trainerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  alertReason: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  alertAction: {
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  clientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clientCard: {
    width: (width - 52) / 3,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  vibeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  clientName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f9fafb',
    textAlign: 'center',
  },
  clientStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  clientStreak: {
    fontSize: 10,
    color: '#f59e0b',
    marginRight: 6,
  },
  clientXp: {
    fontSize: 10,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
  },
  addClientButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  addClientText: {
    color: '#fff',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  activityName: {
    fontWeight: '600',
    color: '#f9fafb',
  },
  activityMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  automationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10b981',
  },
  automationsList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  automationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  automationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  automationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
  },
  automationDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  automationToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
});

export default TrainerDashboardPro;
