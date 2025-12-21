import React, { useState, useEffect } from 'react';
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
  RefreshControl
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/AppStyles';
import TreeSVG from './TreeSVG';
import LiftCoin from './LiftCoin';
import { CheckInStreakAnimation } from './Animations';

const { width, height } = Dimensions.get('window');
const API = process.env.REACT_APP_BACKEND_URL;

if (!API) {
  console.error('❌ REACT_APP_BACKEND_URL is not set!');
}

const TraineeDashboard = ({ user, navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [treeProgress, setTreeProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTraineeData();
  }, []);

  const fetchTraineeData = async () => {
    try {
      const [treeResponse, sessionsResponse, friendsResponse] = await Promise.all([
        axios.get(`${API}/api/users/${user.id}/tree-progress`),
        axios.get(`${API}/api/users/${user.id}/upcoming-sessions`),
        axios.get(`${API}/api/users/${user.id}/friends`)
      ]);

      setTreeProgress(treeResponse.data);
      setUpcomingSessions(sessionsResponse.data.sessions || []);
      setFriends(friendsResponse.data.friends || []);

      // Build stats from tree progress
      setStats({
        totalSessions: treeResponse.data.total_sessions || 0,
        weekStreak: treeResponse.data.consistency_streak || 0,
        liftCoins: treeResponse.data.lift_coins || 0,
        currentLevel: treeProgress?.current_level || 'seed',
        weeklyGoal: 5,
        completedThisWeek: 3
      });

      // Mock leaderboard for now
      setLeaderboard([
        { id: '1', name: user.name, rank: 1, coins: treeResponse.data.lift_coins || 0, avatar: '🏆' },
        { id: '2', name: 'Sarah J.', rank: 2, coins: 850, avatar: '🥈' },
        { id: '3', name: 'Mike C.', rank: 3, coins: 720, avatar: '🥉' },
        { id: '4', name: 'Emma R.', rank: 4, coins: 680, avatar: '💪' },
        { id: '5', name: 'David K.', rank: 5, coins: 550, avatar: '⚡' }
      ]);
    } catch (error) {
      console.error('Error fetching trainee data:', error);
      setStats({
        totalSessions: 0,
        weekStreak: 0,
        liftCoins: 0,
        currentLevel: 'seed',
        weeklyGoal: 5,
        completedThisWeek: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTraineeData();
  };

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Stats Overview */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Your Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {stats?.totalSessions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Sessions
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={styles.streakContainer}>
              <CheckInStreakAnimation size={40} />
              <Text style={[styles.statValue, { color: colors.warning, marginTop: 4 }]}>
                {stats?.weekStreak || 0}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <View style={styles.liftCoinContainer}>
              <LiftCoin count={stats?.liftCoins || 0} size="sm" />
            </View>
          </View>
        </View>
      </View>

      {/* Tree Progress */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🌳 Tree Growth</Text>
        <View style={styles.treeContainer}>
          <TreeSVG level={stats?.currentLevel || 'seed'} size={120} />
          <View style={styles.treeInfo}>
            <Text style={[styles.treeLevel, { color: colors.secondary }]}>
              {stats?.currentLevel?.replace('_', ' ').toUpperCase() || 'SEED'}
            </Text>
            <Text style={[styles.treeDescription, { color: colors.textSecondary }]}>
              Complete more sessions to grow your tree!
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { 
                  backgroundColor: colors.primary,
                  width: `${((stats?.completedThisWeek || 0) / (stats?.weeklyGoal || 5)) * 100}%`
                }]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {stats?.completedThisWeek || 0} / {stats?.weeklyGoal || 5} sessions this week
            </Text>
          </View>
        </View>
      </View>

      {/* Upcoming Sessions */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Upcoming Sessions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sessions')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {upcomingSessions.length > 0 ? (
          upcomingSessions.slice(0, 3).map((session, index) => (
            <View key={index} style={[styles.sessionCard, { backgroundColor: colors.background }]}>
              <View style={styles.sessionIcon}>
                <Icon name="fitness-center" size={24} color={colors.primary} />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitle, { color: colors.text }]}>
                  {session.session_type || 'Workout Session'}
                </Text>
                <Text style={[styles.sessionSubtitle, { color: colors.textSecondary }]}>
                  {session.trainer_name || 'Trainer'} • {session.date || 'Today'} at {session.time || '10:00 AM'}
                </Text>
              </View>
              <TouchableOpacity style={[styles.checkInButton, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.checkInText, { color: colors.text }]}>Check In</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No upcoming sessions. Book a session with a trainer!
            </Text>
            <TouchableOpacity 
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Trainers')}
            >
              <Text style={[styles.bookButtonText, { color: colors.text }]}>Find Trainers</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Trainers')}
        >
          <Icon name="search" size={24} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Find Trainers</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('Fitness')}
        >
          <Icon name="directions-run" size={24} color={colors.text} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Sync Fitness</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSocialTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Leaderboard */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Leaderboard</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Top performers this week
        </Text>
        
        {leaderboard.map((entry) => (
          <View key={entry.id} style={[styles.leaderboardItem, { backgroundColor: colors.background }]}>
            <View style={styles.leaderboardRank}>
              <Text style={[styles.rankText, { color: colors.text }]}>
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <Text style={[styles.leaderboardName, { color: colors.text }]}>
                {entry.name}
              </Text>
              <View style={styles.coinsDisplay}>
                <Text style={[styles.coinsText, { color: colors.warning }]}>
                  {entry.coins} 🪙
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Friends */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 Friends</Text>
          <TouchableOpacity>
            <Text style={[styles.addFriendText, { color: colors.primary }]}>+ Add Friend</Text>
          </TouchableOpacity>
        </View>

        {friends.length > 0 ? (
          friends.map((friend, index) => (
            <View key={index} style={[styles.friendCard, { backgroundColor: colors.background }]}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {friend.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.text }]}>
                  {friend.name}
                </Text>
                <Text style={[styles.friendStats, { color: colors.textSecondary }]}>
                  Level {friend.level || 1} • {friend.total_sessions || 0} sessions
                </Text>
              </View>
              <TouchableOpacity style={[styles.challengeButton, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.challengeButtonText, { color: colors.text }]}>Challenge</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No friends yet. Add friends to compete and motivate each other!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Hey {user.name}, ready to train? 💪
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, { 
            backgroundColor: activeTab === 'overview' ? colors.primary : colors.surface 
          }]}
          onPress={() => setActiveTab('overview')}
        >
          <Icon name="dashboard" size={20} color={colors.text} />
          <Text style={[styles.tabText, { color: colors.text }]}>Overview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, { 
            backgroundColor: activeTab === 'social' ? colors.primary : colors.surface 
          }]}
          onPress={() => setActiveTab('social')}
        >
          <Icon name="people" size={20} color={colors.text} />
          <Text style={[styles.tabText, { color: colors.text }]}>Social</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' ? renderOverviewTab() : renderSocialTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  liftCoinContainer: {
    alignItems: 'center',
  },
  treeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  treeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  treeLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  treeDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionSubtitle: {
    fontSize: 14,
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkInText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderboardRank: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addFriendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendStats: {
    fontSize: 14,
  },
  challengeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  challengeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TraineeDashboard;
