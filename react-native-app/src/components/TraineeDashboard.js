/**
 * LiftLink 2.0 - Gamified Trainee Dashboard
 * Features: XP System, Streaks, Quests, Achievements, Level Progress
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
  Dimensions,
  RefreshControl,
  Animated,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, spacing, typography, borderRadius, shadows, scale } from '../styles/AppStyles';

const { width } = Dimensions.get('window');
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// XP Level Progress Ring Component
const LevelRing = ({ level, percentage, xp, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (percentage / 100) * circumference;

  return (
    <View style={[styles.levelRingContainer, { width: size, height: size }]}>
      <View style={styles.levelRingOuter}>
        <View style={[styles.levelRingBg, { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderWidth: strokeWidth
        }]} />
        <View style={[styles.levelRingProgress, {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderTopColor: '#BFFF00',
          borderRightColor: percentage > 25 ? '#BFFF00' : 'transparent',
          borderBottomColor: percentage > 50 ? '#BFFF00' : 'transparent',
          borderLeftColor: percentage > 75 ? '#BFFF00' : 'transparent',
          transform: [{ rotate: '-90deg' }]
        }]} />
        <View style={styles.levelRingContent}>
          <Text style={styles.levelNumber}>{level}</Text>
          <Text style={styles.levelLabel}>LEVEL</Text>
        </View>
      </View>
      <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
    </View>
  );
};

// Streak Fire Animation Component  
const StreakFire = ({ streak }) => {
  const getStreakColor = () => {
    if (streak >= 30) return '#ff6b00';
    if (streak >= 14) return '#f97316';
    if (streak >= 7) return '#fb923c';
    return '#fbbf24';
  };

  const getStreakEmoji = () => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '✨';
  };

  return (
    <View style={styles.streakContainer}>
      <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
      <Text style={[styles.streakNumber, { color: getStreakColor() }]}>{streak}</Text>
      <Text style={styles.streakLabel}>Day Streak</Text>
    </View>
  );
};

// Quest Card Component
const QuestCard = ({ quest, onPress }) => {
  const progressPercent = (quest.progress / quest.target) * 100;
  
  return (
    <TouchableOpacity style={styles.questCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.questHeader}>
        <Text style={styles.questEmoji}>🎯</Text>
        <View style={styles.questInfo}>
          <Text style={styles.questName}>{quest.name}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>
        <View style={styles.questXp}>
          <Text style={styles.questXpValue}>+{quest.xp_reward}</Text>
          <Text style={styles.questXpLabel}>XP</Text>
        </View>
      </View>
      
      <View style={styles.questProgressContainer}>
        <View style={styles.questProgressBar}>
          <View style={[styles.questProgressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.questProgressText}>
          {quest.progress}/{quest.target}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ achievement, unlocked, onPress }) => (
  <TouchableOpacity 
    style={[styles.achievementBadge, !unlocked && styles.achievementLocked]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.achievementIcon}>
      {unlocked ? achievement.icon : '🔒'}
    </Text>
    <Text style={[styles.achievementName, !unlocked && styles.achievementNameLocked]}>
      {achievement.name}
    </Text>
    <Text style={styles.achievementXp}>
      {unlocked ? '✓ Earned' : `${achievement.xp_reward} XP`}
    </Text>
  </TouchableOpacity>
);

// Stats Card Component
const StatsCard = ({ icon, value, label, color, trend }) => (
  <View style={[styles.statsCard, { borderLeftColor: color }]}>
    <Icon name={icon} size={24} color={color} />
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
    {trend !== undefined && (
      <View style={[styles.trendBadge, { backgroundColor: trend >= 0 ? '#10b98120' : '#ef444420' }]}>
        <Icon 
          name={trend >= 0 ? 'trending-up' : 'trending-down'} 
          size={12} 
          color={trend >= 0 ? '#10b981' : '#ef4444'} 
        />
      </View>
    )}
  </View>
);

// Today's Workout Card
const TodayWorkoutCard = ({ workout, onStart, onSkip }) => (
  <View style={styles.workoutCard}>
    <View style={styles.workoutCardHeader}>
      <View style={styles.workoutIconContainer}>
        <Icon name="fitness-center" size={28} color="#BFFF00" />
      </View>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutTitle}>{workout?.name || "Today's Workout"}</Text>
        <Text style={styles.workoutSubtitle}>
          {workout?.exercises?.length || 0} exercises • {workout?.duration || 45} min
        </Text>
      </View>
    </View>
    
    {workout?.intensity_adjustment && workout.intensity_adjustment !== 'normal' && (
      <View style={styles.adaptationBanner}>
        <Icon name="auto-fix-high" size={16} color="#8b5cf6" />
        <Text style={styles.adaptationText}>
          Adapted based on your check-in: {workout.intensity_adjustment.replace('_', ' ')}
        </Text>
      </View>
    )}
    
    <View style={styles.workoutActions}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipButtonText}>Skip Today</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Icon name="play-arrow" size={20} color="#0A0A0A" />
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Daily Check-in Modal
const CheckInModal = ({ visible, onClose, onSubmit }) => {
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(3);

  const EmojiSelector = ({ value, onChange, emojis }) => (
    <View style={styles.emojiRow}>
      {emojis.map((emoji, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.emojiBtn, value === index + 1 && styles.emojiBtnSelected]}
          onPress={() => onChange(index + 1)}
        >
          <Text style={styles.emojiText}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View style={styles.checkinSection}>
            <Text style={styles.checkinLabel}>Energy Level</Text>
            <EmojiSelector 
              value={energy} 
              onChange={setEnergy}
              emojis={['😴', '😐', '🙂', '😊', '⚡']}
            />
          </View>

          <View style={styles.checkinSection}>
            <Text style={styles.checkinLabel}>Stress Level</Text>
            <EmojiSelector 
              value={stress} 
              onChange={setStress}
              emojis={['😌', '🙂', '😐', '😰', '🤯']}
            />
          </View>

          <View style={styles.checkinSection}>
            <Text style={styles.checkinLabel}>Sleep Quality</Text>
            <EmojiSelector 
              value={sleep} 
              onChange={setSleep}
              emojis={['😫', '😔', '😐', '😊', '😴']}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitCheckinBtn}
            onPress={() => onSubmit({ energy, stress, sleep })}
          >
            <Text style={styles.submitCheckinText}>Submit Check-in (+10 XP)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main TraineeDashboard Component
const TraineeDashboard = ({ user, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gamificationData, setGamificationData] = useState(null);
  const [quests, setQuests] = useState({ active_quests: [], available_quests: [] });
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const userId = user?.id || 'test_user';
      
      // Fetch gamification stats
      const [statsRes, questsRes] = await Promise.all([
        fetch(`${API_URL}/api/gamification/stats/${userId}`),
        fetch(`${API_URL}/api/gamification/quests/${userId}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setGamificationData(statsData);
      } else {
        // Set default data if endpoint fails
        setGamificationData({
          total_xp: user?.total_xp || 0,
          level: 1,
          level_progress: { current_xp: 0, needed_xp: 100, percentage: 0 },
          current_streak: user?.current_streak || 0,
          longest_streak: user?.longest_streak || 0,
          total_workouts: user?.total_workouts_completed || 0,
          achievements: { unlocked: [], available: [] },
          active_quests: []
        });
      }

      if (questsRes.ok) {
        const questsData = await questsRes.json();
        setQuests(questsData);
      }

      // Check if user has checked in today
      // In a real app, this would be an API call
      setHasCheckedInToday(false);

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      // Set fallback data
      setGamificationData({
        total_xp: 0,
        level: 1,
        level_progress: { current_xp: 0, needed_xp: 100, percentage: 0 },
        current_streak: 0,
        longest_streak: 0,
        total_workouts: 0,
        achievements: { unlocked: [], available: [] },
        active_quests: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCheckin = async (checkinData) => {
    try {
      const response = await fetch(`${API_URL}/api/checkin/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user?.id || 'test_user',
          energy_level: checkinData.energy,
          stress_level: checkinData.stress,
          sleep_quality: checkinData.sleep,
          sleep_hours: 7
        })
      });

      if (response.ok) {
        const result = await response.json();
        setHasCheckedInToday(true);
        setShowCheckin(false);
        
        // Update local XP
        if (gamificationData) {
          setGamificationData(prev => ({
            ...prev,
            total_xp: prev.total_xp + (result.xp_earned || 10)
          }));
        }

        Alert.alert(
          'Check-in Complete! ✅',
          `+${result.xp_earned || 10} XP earned!\n${result.coaching_message || 'Great job checking in!'}`,
          [{ text: 'OK' }]
        );

        // Refresh to get updated data
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', 'Failed to submit check-in');
    }
  };

  const handleAcceptQuest = async (questId) => {
    try {
      const response = await fetch(`${API_URL}/api/gamification/accept-quest?user_id=${user?.id || 'test_user'}&quest_id=${questId}`, {
        method: 'POST'
      });

      if (response.ok) {
        Alert.alert('Quest Accepted! 🎯', 'Good luck completing your quest!');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Accept quest error:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BFFF00" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { level, level_progress, current_streak, total_workouts, achievements } = gamificationData || {};

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
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Champion'} 💪</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkinBtn, hasCheckedInToday && styles.checkinBtnDone]}
            onPress={() => !hasCheckedInToday && setShowCheckin(true)}
            disabled={hasCheckedInToday}
          >
            <Icon name={hasCheckedInToday ? "check" : "add-task"} size={20} color={hasCheckedInToday ? "#10b981" : "#BFFF00"} />
            <Text style={[styles.checkinBtnText, hasCheckedInToday && styles.checkinBtnTextDone]}>
              {hasCheckedInToday ? 'Checked In' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level & Streak Row */}
        <View style={styles.progressRow}>
          <LevelRing 
            level={level || 1}
            percentage={level_progress?.percentage || 0}
            xp={gamificationData?.total_xp || 0}
          />
          <StreakFire streak={current_streak || 0} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatsCard 
            icon="fitness-center"
            value={total_workouts || 0}
            label="Workouts"
            color="#3b82f6"
          />
          <StatsCard 
            icon="emoji-events"
            value={achievements?.unlocked?.length || 0}
            label="Achievements"
            color="#f59e0b"
          />
          <StatsCard 
            icon="trending-up"
            value={gamificationData?.longest_streak || 0}
            label="Best Streak"
            color="#10b981"
          />
        </View>

        {/* Today's Workout */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
        </View>
        <TodayWorkoutCard 
          workout={todayWorkout}
          onStart={() => Alert.alert('Start Workout', 'Starting your workout session...')}
          onSkip={() => Alert.alert('Skip', 'Are you sure you want to skip today?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Skip', style: 'destructive' }
          ])}
        />

        {/* Active Quests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Quests</Text>
          <TouchableOpacity onPress={() => Alert.alert('All Quests', 'View all available quests')}>
            <Text style={styles.sectionAction}>See All</Text>
          </TouchableOpacity>
        </View>

        {quests.active_quests?.length > 0 ? (
          quests.active_quests.map((quest) => (
            <QuestCard 
              key={quest.id}
              quest={quest}
              onPress={() => Alert.alert(quest.name, quest.description)}
            />
          ))
        ) : (
          <View style={styles.emptyQuests}>
            <Text style={styles.emptyQuestsText}>No active quests</Text>
            {quests.available_quests?.slice(0, 2).map((quest) => (
              <TouchableOpacity 
                key={quest.id}
                style={styles.availableQuestBtn}
                onPress={() => handleAcceptQuest(quest.id)}
              >
                <Text style={styles.availableQuestText}>🎯 Accept: {quest.name}</Text>
                <Text style={styles.availableQuestXp}>+{quest.xp_reward} XP</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>
              {achievements?.unlocked?.length || 0}/{(achievements?.unlocked?.length || 0) + (achievements?.available?.length || 0)}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.achievementsScroll}
          contentContainerStyle={styles.achievementsContent}
        >
          {achievements?.unlocked?.map((a) => (
            <AchievementBadge 
              key={a.achievement_id}
              achievement={{ ...a, icon: '🏆', name: a.achievement_id }}
              unlocked={true}
              onPress={() => Alert.alert('Achievement', `Unlocked: ${a.achievement_id}`)}
            />
          ))}
          {achievements?.available?.slice(0, 5).map((a) => (
            <AchievementBadge 
              key={a.id}
              achievement={a}
              unlocked={false}
              onPress={() => Alert.alert(a.name, `${a.description}\n\nReward: ${a.xp_reward} XP`)}
            />
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => navigation?.navigate('Trainers')}
          >
            <Icon name="search" size={24} color="#BFFF00" />
            <Text style={styles.quickActionText}>Find Trainer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => navigation?.navigate('Sessions')}
          >
            <Icon name="calendar-today" size={24} color="#3b82f6" />
            <Text style={styles.quickActionText}>My Sessions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => navigation?.navigate('Tree')}
          >
            <Icon name="park" size={24} color="#10b981" />
            <Text style={styles.quickActionText}>My Tree</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Check-in Modal */}
      <CheckInModal 
        visible={showCheckin}
        onClose={() => setShowCheckin(false)}
        onSubmit={handleCheckin}
      />
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
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 4,
  },
  checkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFFF00',
  },
  checkinBtnDone: {
    borderColor: '#10b981',
    backgroundColor: '#10b98120',
  },
  checkinBtnText: {
    color: '#BFFF00',
    fontWeight: '600',
    marginLeft: 6,
  },
  checkinBtnTextDone: {
    color: '#10b981',
  },

  // Progress Row
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  // Level Ring
  levelRingContainer: {
    alignItems: 'center',
  },
  levelRingOuter: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelRingBg: {
    position: 'absolute',
    borderColor: '#374151',
  },
  levelRingProgress: {
    position: 'absolute',
  },
  levelRingContent: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#BFFF00',
  },
  levelLabel: {
    fontSize: 10,
    color: '#9ca3af',
    letterSpacing: 2,
  },
  xpText: {
    marginTop: 8,
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '600',
  },

  // Streak
  streakContainer: {
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderLeftWidth: 3,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginTop: 8,
  },
  statsLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  trendBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 8,
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

  // Workout Card
  workoutCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  workoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#BFFF0020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 14,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  adaptationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf620',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  adaptationText: {
    fontSize: 12,
    color: '#8b5cf6',
    marginLeft: 8,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
    marginRight: 8,
  },
  skipButtonText: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  startButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#BFFF00',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  startButtonText: {
    color: '#0A0A0A',
    fontWeight: 'bold',
    marginLeft: 6,
  },

  // Quest Cards
  questCard: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  questDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  questXp: {
    alignItems: 'center',
    backgroundColor: '#BFFF0020',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  questXpValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#BFFF00',
  },
  questXpLabel: {
    fontSize: 10,
    color: '#BFFF00',
  },
  questProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: '#BFFF00',
    borderRadius: 3,
  },
  questProgressText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },

  // Empty Quests
  emptyQuests: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  emptyQuestsText: {
    color: '#6b7280',
    marginBottom: 12,
  },
  availableQuestBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    width: '100%',
  },
  availableQuestText: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  availableQuestXp: {
    color: '#BFFF00',
    fontWeight: 'bold',
  },

  // Achievements
  achievementsScroll: {
    marginBottom: 16,
  },
  achievementsContent: {
    paddingRight: 16,
  },
  achievementBadge: {
    width: 90,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f9fafb',
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: '#6b7280',
  },
  achievementXp: {
    fontSize: 10,
    color: '#BFFF00',
    marginTop: 4,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  checkinSection: {
    marginBottom: 20,
  },
  checkinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnSelected: {
    backgroundColor: '#BFFF0030',
    borderWidth: 2,
    borderColor: '#BFFF00',
  },
  emojiText: {
    fontSize: 28,
  },
  submitCheckinBtn: {
    backgroundColor: '#BFFF00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitCheckinText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TraineeDashboard;
