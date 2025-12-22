import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ClientActivityScreen = ({ trainerId, clientId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      const requests = [
        axios.get(`${API}/coaching/dashboard-analytics/${trainerId}`),
        axios.get(`${API}/coaching/at-risk-alerts/${trainerId}`)
      ];
      
      if (clientId) {
        requests.push(axios.get(`${API}/coaching/activity-log/${clientId}`));
      }
      
      const responses = await Promise.all(requests);
      setAnalytics(responses[0].data.analytics || responses[0].data);
      setAlerts(responses[1].data.alerts || []);
      if (clientId && responses[2]) {
        setActivities(responses[2].data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId, clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.post(`${API}/coaching/at-risk-alerts/${alertId}/acknowledge`);
      fetchData();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'workout_completed': return 'fitness-center';
      case 'task_completed': return 'check-circle';
      case 'pr_set': return 'emoji-events';
      case 'checkin': return 'event-available';
      default: return 'history';
    }
  };

  const renderOverview = () => (
    <>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Icon name="people" size={28} color="#FFF" />
          <Text style={styles.statNumber}>{analytics?.total_clients || 0}</Text>
          <Text style={styles.statLabel}>Total Clients</Text>
        </View>
        <View style={[styles.statCard, styles.successCard]}>
          <Icon name="trending-up" size={28} color="#FFF" />
          <Text style={styles.statNumber}>{analytics?.active_clients || 0}</Text>
          <Text style={styles.statLabel}>Active (7d)</Text>
        </View>
        <View style={[styles.statCard, styles.warningCard]}>
          <Icon name="warning" size={28} color="#FFF" />
          <Text style={styles.statNumber}>{analytics?.at_risk_count || 0}</Text>
          <Text style={styles.statLabel}>At Risk</Text>
        </View>
        <View style={[styles.statCard, styles.infoCard]}>
          <Icon name="trending-down" size={28} color="#FFF" />
          <Text style={styles.statNumber}>{analytics?.inactive_clients || 0}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Recent PRs */}
      {analytics?.recent_prs?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Recent PRs</Text>
          {analytics.recent_prs.slice(0, 5).map((pr, index) => (
            <View key={index} style={styles.prCard}>
              <Icon name="emoji-events" size={24} color="#F59E0B" />
              <View style={styles.prInfo}>
                <Text style={styles.prExercise}>{pr.exercise_name}</Text>
                <Text style={styles.prValue}>{pr.value} {pr.unit}</Text>
              </View>
              <Text style={styles.prDate}>{new Date(pr.achieved_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Workouts */}
      {analytics?.upcoming_workouts?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Upcoming Workouts</Text>
          {analytics.upcoming_workouts.slice(0, 5).map((workout, index) => (
            <View key={index} style={styles.workoutCard}>
              <View style={styles.workoutDate}>
                <Text style={styles.workoutDay}>{new Date(workout.scheduled_date).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={styles.workoutDateNum}>{new Date(workout.scheduled_date).getDate()}</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.workout_name}</Text>
                <Text style={styles.workoutClients}>{workout.client_ids?.length || 0} clients</Text>
              </View>
              {workout.scheduled_time && (
                <Text style={styles.workoutTime}>{workout.scheduled_time}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </>
  );

  const renderAlerts = () => (
    <>
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="check-circle" size={64} color="#10B981" />
          <Text style={styles.emptyText}>All clients on track!</Text>
          <Text style={styles.emptySubtext}>No at-risk alerts</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(alert.risk_level) + '20' }]}>
                <Text style={[styles.riskText, { color: getRiskColor(alert.risk_level) }]}>
                  {alert.risk_level.toUpperCase()} RISK
                </Text>
              </View>
              <Text style={styles.alertDate}>{new Date(alert.created_at).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.alertClient}>{alert.client_name}</Text>
            <View style={styles.riskFactors}>
              {alert.risk_factors?.map((factor, idx) => (
                <View key={idx} style={styles.factorItem}>
                  <Icon name="warning" size={14} color="#F59E0B" />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
            {alert.recommended_actions?.length > 0 && (
              <View style={styles.actionsSection}>
                <Text style={styles.actionsTitle}>Recommended Actions:</Text>
                {alert.recommended_actions.map((action, idx) => (
                  <View key={idx} style={styles.actionItem}>
                    <Icon name="arrow-forward" size={14} color="#6366F1" />
                    <Text style={styles.actionText}>{action}</Text>
                  </View>
                ))}
              </View>
            )}
            {!alert.is_acknowledged && (
              <TouchableOpacity 
                style={styles.acknowledgeButton}
                onPress={() => acknowledgeAlert(alert.id)}
              >
                <Text style={styles.acknowledgeText}>Acknowledge</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </>
  );

  const renderActivity = () => (
    <>
      {activities.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="history" size={64} color="#9CA3AF" />
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>Client activity will appear here</Text>
        </View>
      ) : (
        activities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Icon name={getActivityIcon(activity.activity_type)} size={20} color="#6366F1" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityType}>{activity.activity_type.replace(/_/g, ' ')}</Text>
              <Text style={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        ))
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client Activity</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Icon name="dashboard" size={20} color={activeTab === 'overview' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
          onPress={() => setActiveTab('alerts')}
        >
          <Icon name="warning" size={20} color={activeTab === 'alerts' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>Alerts ({alerts.length})</Text>
        </TouchableOpacity>
        {clientId && (
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'activity' && styles.activeTab]}
            onPress={() => setActiveTab('activity')}
          >
            <Icon name="history" size={20} color={activeTab === 'activity' ? '#6366F1' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'activity' && styles.activeTabText]}>Activity</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'activity' && renderActivity()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#6366F1' },
  tabText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  activeTabText: { color: '#6366F1', fontWeight: '600' },
  scrollView: { flex: 1, padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center' },
  primaryCard: { backgroundColor: '#6366F1' },
  successCard: { backgroundColor: '#10B981' },
  warningCard: { backgroundColor: '#F59E0B' },
  infoCard: { backgroundColor: '#3B82F6' },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#FFF', marginVertical: 4 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  prCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8 },
  prInfo: { flex: 1, marginLeft: 12 },
  prExercise: { fontSize: 14, fontWeight: '600', color: '#111827' },
  prValue: { fontSize: 12, color: '#6B7280' },
  prDate: { fontSize: 11, color: '#9CA3AF' },
  workoutCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8 },
  workoutDate: { width: 50, alignItems: 'center', backgroundColor: '#EEF2FF', padding: 8, borderRadius: 8 },
  workoutDay: { fontSize: 10, color: '#6366F1', fontWeight: '600' },
  workoutDateNum: { fontSize: 18, fontWeight: '700', color: '#6366F1' },
  workoutInfo: { flex: 1, marginLeft: 12 },
  workoutName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  workoutClients: { fontSize: 12, color: '#6B7280' },
  workoutTime: { fontSize: 12, color: '#6B7280' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  alertCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  riskText: { fontSize: 10, fontWeight: '700' },
  alertDate: { fontSize: 11, color: '#9CA3AF' },
  alertClient: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 },
  riskFactors: { marginBottom: 12 },
  factorItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  factorText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  actionsSection: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 },
  actionsTitle: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 8 },
  actionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  actionText: { fontSize: 12, color: '#6366F1', marginLeft: 6 },
  acknowledgeButton: { backgroundColor: '#EEF2FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  acknowledgeText: { color: '#6366F1', fontWeight: '600' },
  activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 8 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1, marginLeft: 12 },
  activityType: { fontSize: 14, fontWeight: '500', color: '#111827', textTransform: 'capitalize' },
  activityTime: { fontSize: 12, color: '#9CA3AF' }
});

export default ClientActivityScreen;
