/**
 * LiftLink 2.0 - AI-Powered Trainer Dashboard
 * Card-based layout with AI insights, client management, and automation controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  RefreshControl,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography, borderRadius, shadows, scale, moderateScale } from '../styles/AppStyles';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Card Component for consistent styling
const DashboardCard = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.card, style]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// Stat Card Component
const StatCard = ({ icon, value, label, color, trend }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Icon name={icon} size={24} color={color} />
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#10b98120' : '#ef444420' }]}>
          <Icon 
            name={trend > 0 ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={trend > 0 ? '#10b981' : '#ef4444'} 
          />
          <Text style={[styles.trendText, { color: trend > 0 ? '#10b981' : '#ef4444' }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Client Card Component
const ClientCard = ({ client, onPress, onMessage }) => {
  const getVibeColor = (vibe) => {
    switch(vibe) {
      case 'big_dog_mode': return '#ef4444';
      case 'soft_grind': return '#3b82f6';
      case 'easy_restart': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getVibeLabel = (vibe) => {
    switch(vibe) {
      case 'big_dog_mode': return '🐕‍🦺 Big Dog';
      case 'soft_grind': return '💪 Soft Grind';
      case 'easy_restart': return '🌱 Easy Restart';
      default: return 'Unknown';
    }
  };

  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.clientHeader}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientInitials}>
            {client.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name || 'Unknown'}</Text>
          <View style={[styles.vibeBadge, { backgroundColor: getVibeColor(client.vibe) + '20' }]}>
            <Text style={[styles.vibeText, { color: getVibeColor(client.vibe) }]}>
              {getVibeLabel(client.vibe)}
            </Text>
          </View>
        </View>
        <View style={styles.streakContainer}>
          <Icon name="local-fire-department" size={16} color="#f97316" />
          <Text style={styles.streakText}>{client.current_streak || 0}</Text>
        </View>
      </View>
      
      <View style={styles.clientStats}>
        <View style={styles.clientStatItem}>
          <Text style={styles.clientStatValue}>{client.total_xp || 0}</Text>
          <Text style={styles.clientStatLabel}>XP</Text>
        </View>
        <View style={styles.clientStatDivider} />
        <View style={styles.clientStatItem}>
          <Text style={styles.clientStatValue}>
            {client.last_checkin ? '✓' : '—'}
          </Text>
          <Text style={styles.clientStatLabel}>Check-in</Text>
        </View>
      </View>

      <View style={styles.clientActions}>
        <TouchableOpacity 
          style={styles.clientActionBtn}
          onPress={() => onMessage?.(client)}
        >
          <Icon name="chat" size={18} color="#3b82f6" />
          <Text style={styles.clientActionText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.clientActionBtn, styles.clientActionBtnPrimary]}
          onPress={() => onPress?.(client)}
        >
          <Icon name="fitness-center" size={18} color="#fff" />
          <Text style={[styles.clientActionText, { color: '#fff' }]}>View Plan</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Alert Card Component
const AlertCard = ({ type, clients, onPress }) => {
  const config = {
    needs_attention: {
      icon: 'warning',
      color: '#f97316',
      title: 'Needs Attention',
      description: 'Clients who may need a check-in'
    },
    on_fire: {
      icon: 'local-fire-department',
      color: '#10b981',
      title: 'On Fire! 🔥',
      description: 'Clients with 7+ day streaks'
    }
  };

  const { icon, color, title, description } = config[type] || config.needs_attention;

  if (!clients || clients.length === 0) return null;

  return (
    <DashboardCard style={[styles.alertCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.alertHeader}>
        <Icon name={icon} size={24} color={color} />
        <View style={styles.alertHeaderText}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertDescription}>{description}</Text>
        </View>
        <View style={[styles.alertBadge, { backgroundColor: color }]}>
          <Text style={styles.alertBadgeText}>{clients.length}</Text>
        </View>
      </View>
      
      <View style={styles.alertClients}>
        {clients.slice(0, 3).map((client, index) => (
          <View key={client.id || index} style={styles.alertClientItem}>
            <View style={[styles.alertClientAvatar, { backgroundColor: color + '20' }]}>
              <Text style={[styles.alertClientInitial, { color }]}>
                {client.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.alertClientName} numberOfLines={1}>
              {client.name}
            </Text>
            {type === 'on_fire' && (
              <Text style={styles.alertClientStreak}>
                {client.streak}🔥
              </Text>
            )}
          </View>
        ))}
        {clients.length > 3 && (
          <Text style={styles.alertMoreText}>+{clients.length - 3} more</Text>
        )}
      </View>
    </DashboardCard>
  );
};

// AI Insight Card Component
const AIInsightCard = ({ insight, onAction }) => (
  <DashboardCard style={styles.insightCard} onPress={onAction}>
    <View style={styles.insightHeader}>
      <View style={styles.insightIcon}>
        <Icon name="auto-awesome" size={20} color="#8b5cf6" />
      </View>
      <Text style={styles.insightLabel}>AI Insight</Text>
    </View>
    <Text style={styles.insightText}>{insight.message}</Text>
    {insight.action && (
      <TouchableOpacity style={styles.insightAction} onPress={onAction}>
        <Text style={styles.insightActionText}>{insight.action}</Text>
        <Icon name="arrow-forward" size={16} color="#8b5cf6" />
      </TouchableOpacity>
    )}
  </DashboardCard>
);

// Quick Action Button
const QuickActionButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Main TrainerDashboard Component
const TrainerDashboard = ({ navigation, trainerId, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Mock AI insight (would come from backend in production)
  const [aiInsight] = useState({
    message: "3 clients have missed workouts this week. Consider sending a personalized check-in message to re-engage them.",
    action: "Send Check-ins"
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const effectiveTrainerId = trainerId || 'trainer_001';
      
      const response = await fetch(`${API_URL}/api/trainer/dashboard/${effectiveTrainerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else if (response.status === 404) {
        // Trainer not found - show empty state
        setDashboardData({
          trainer: { id: effectiveTrainerId, name: 'New Trainer' },
          stats: { total_clients: 0, active_clients: 0, content_items: 0 },
          alerts: { needs_attention: [], on_fire: [] },
          recent_activity: [],
          clients: []
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to load dashboard. Pull to refresh.');
      // Set empty data on error
      setDashboardData({
        trainer: { id: trainerId || 'trainer_001', name: 'Trainer' },
        stats: { total_clients: 0, active_clients: 0, content_items: 0 },
        alerts: { needs_attention: [], on_fire: [] },
        recent_activity: [],
        clients: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleClientPress = (client) => {
    Alert.alert(
      client.name,
      `Streak: ${client.current_streak || 0} days\nXP: ${client.total_xp || 0}\nVibe: ${client.vibe || 'Not set'}`,
      [
        { text: 'View Plan', onPress: () => console.log('View plan for', client.id) },
        { text: 'Message', onPress: () => handleMessage(client) },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleMessage = (client) => {
    Alert.alert('Send Message', `Start conversation with ${client.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => console.log('Messaging', client.id) }
    ]);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'create_workout':
        Alert.alert('Create Workout', 'AI-powered workout creation coming soon!');
        break;
      case 'add_client':
        Alert.alert('Add Client', 'Invite a new client to your roster');
        break;
      case 'automations':
        Alert.alert('Automations', 'Configure behavior-based automations');
        break;
      case 'content':
        Alert.alert('Content Locker', 'Manage your content library');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BFFF00" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { trainer, stats, alerts, clients } = dashboardData || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#BFFF00"
            colors={['#BFFF00']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.trainerName}>{trainer?.name || 'Coach'} 💪</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Icon name="notifications" size={24} color="#f9fafb" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Icon name="error-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard 
            icon="people" 
            value={stats?.total_clients || 0}
            label="Total Clients"
            color="#3b82f6"
          />
          <StatCard 
            icon="check-circle" 
            value={stats?.active_clients || 0}
            label="Active Today"
            color="#10b981"
            trend={12}
          />
          <StatCard 
            icon="library-books" 
            value={stats?.content_items || 0}
            label="Content Items"
            color="#8b5cf6"
          />
        </View>

        {/* AI Insight */}
        {clients && clients.length > 0 && (
          <AIInsightCard 
            insight={aiInsight}
            onAction={() => Alert.alert('AI Action', 'Sending check-in messages...')}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton 
            icon="add-circle" 
            label="Create Workout" 
            color="#BFFF00"
            onPress={() => handleQuickAction('create_workout')}
          />
          <QuickActionButton 
            icon="person-add" 
            label="Add Client" 
            color="#3b82f6"
            onPress={() => handleQuickAction('add_client')}
          />
          <QuickActionButton 
            icon="auto-fix-high" 
            label="Automations" 
            color="#8b5cf6"
            onPress={() => handleQuickAction('automations')}
          />
          <QuickActionButton 
            icon="folder" 
            label="Content" 
            color="#f97316"
            onPress={() => handleQuickAction('content')}
          />
        </View>

        {/* Alerts Section */}
        {alerts && (alerts.needs_attention?.length > 0 || alerts.on_fire?.length > 0) && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alerts & Updates</Text>
            </View>
            <AlertCard 
              type="needs_attention" 
              clients={alerts.needs_attention}
              onPress={() => Alert.alert('Needs Attention', 'View clients who need follow-up')}
            />
            <AlertCard 
              type="on_fire" 
              clients={alerts.on_fire}
              onPress={() => Alert.alert('On Fire!', 'Celebrate your most consistent clients')}
            />
          </>
        )}

        {/* Clients Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Clients</Text>
          <TouchableOpacity onPress={() => Alert.alert('View All', 'Show all clients')}>
            <Text style={styles.sectionAction}>View All</Text>
          </TouchableOpacity>
        </View>

        {clients && clients.length > 0 ? (
          clients.slice(0, 5).map((client) => (
            <ClientCard 
              key={client.id}
              client={client}
              onPress={() => handleClientPress(client)}
              onMessage={() => handleMessage(client)}
            />
          ))
        ) : (
          <DashboardCard style={styles.emptyStateCard}>
            <Icon name="person-add" size={48} color="#6b7280" />
            <Text style={styles.emptyStateTitle}>No Clients Yet</Text>
            <Text style={styles.emptyStateText}>
              Start building your roster by inviting clients to join LiftLink
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateBtn}
              onPress={() => handleQuickAction('add_client')}
            >
              <Icon name="add" size={20} color="#0A0A0A" />
              <Text style={styles.emptyStateBtnText}>Add Your First Client</Text>
            </TouchableOpacity>
          </DashboardCard>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
  },
  trainerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef444420',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    marginLeft: 8,
    flex: 1,
  },

  // Card Base
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    borderLeftWidth: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  sectionAction: {
    fontSize: 14,
    color: '#BFFF00',
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickAction: {
    width: (width - 48) / 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Client Cards
  clientCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
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
  },
  clientInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#BFFF00',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  vibeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  vibeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9731620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f97316',
    marginLeft: 4,
  },
  clientStats: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  clientStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  clientStatDivider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: 12,
  },
  clientStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  clientStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  clientActionBtnPrimary: {
    backgroundColor: '#BFFF00',
  },
  clientActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f9fafb',
    marginLeft: 6,
  },

  // Alert Cards
  alertCard: {
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  alertDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  alertBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  alertClients: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  alertClientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  alertClientAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertClientInitial: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertClientName: {
    fontSize: 12,
    color: '#d1d5db',
    marginLeft: 6,
    maxWidth: 80,
  },
  alertClientStreak: {
    fontSize: 11,
    marginLeft: 4,
  },
  alertMoreText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },

  // AI Insight Card
  insightCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#8b5cf640',
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#8b5cf620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    marginLeft: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  insightActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    marginRight: 4,
  },

  // Empty State
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  emptyStateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BFFF00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyStateBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0A0A',
    marginLeft: 8,
  },
});

export default TrainerDashboard;
