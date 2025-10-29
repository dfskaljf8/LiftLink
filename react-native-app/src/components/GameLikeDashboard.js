import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 120;
const STROKE_WIDTH = 12;

/**
 * GameLikeDashboard - Modernist game-like interface
 * Inspired by fitness tracking apps with gamification
 * Features: Circular progress rings, animated SVGs, card-based layout
 */

// Animated Circular Progress Component
const CircularProgress = ({ percentage, size = CIRCLE_SIZE, strokeWidth = STROKE_WIDTH, color, label, value, unit, theme }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.progressContainer}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${label})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.progressCenter}>
        <Text style={[styles.progressValue, { color: color }]}>{value}</Text>
        <Text style={[styles.progressUnit, { color: theme.textSecondary }]}>{unit}</Text>
        <Text style={[styles.progressLabel, { color: theme.textTertiary }]}>{label}</Text>
      </View>
    </View>
  );
};

// Animated Stats Card
const StatsCard = ({ icon, title, value, trend, trendValue, color, theme }) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 120,
      friction: 14,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statsCard, { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsIcon}>{icon}</Text>
        <View style={[styles.trendBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.trendText, { color }]}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </Text>
        </View>
      </View>
      <Text style={[styles.statsValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statsTitle, { color: theme.textSecondary }]}>{title}</Text>
    </Animated.View>
  );
};

// Activity Status Selector
const ActivityStatus = ({ status, onStatusChange, theme }) => {
  return (
    <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
      <View style={styles.activityContent}>
        <View>
          <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>Daily Status</Text>
          <Text style={[styles.activityStatus, { color: theme.primary }]}>{status}</Text>
        </View>
        <TouchableOpacity style={[styles.activityButton, { borderColor: theme.primary }]}>
          <Text style={[styles.activityButtonText, { color: theme.primary }]}>Change</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stress Gauge with SVG
const StressGauge = ({ level, theme }) => {
  const getColor = () => {
    if (level < 30) return '#58CC02';
    if (level < 70) return '#FFD700';
    return '#FF4B4B';
  };

  return (
    <View style={styles.stressContainer}>
      <Svg width={100} height={60} viewBox="0 0 100 60">
        <Defs>
          <LinearGradient id="stressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#58CC02" />
            <Stop offset="50%" stopColor="#FFD700" />
            <Stop offset="100%" stopColor="#FF4B4B" />
          </LinearGradient>
        </Defs>
        
        {/* Background arc */}
        <Path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke={theme.border}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Colored arc */}
        <Path
          d="M 10 50 A 40 40 0 0 1 90 50"
          stroke="url(#stressGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${level * 1.25} ${125 - level * 1.25}`}
        />
        
        {/* Indicator dot */}
        <Circle
          cx={50 + 40 * Math.cos((Math.PI * (level / 100)))}
          cy={50 - 40 * Math.sin((Math.PI * (level / 100)))}
          r="6"
          fill={getColor()}
        />
      </Svg>
      
      <Text style={[styles.stressValue, { color: getColor() }]}>{level}</Text>
    </View>
  );
};

// Main Dashboard Component
const GameLikeDashboard = ({ user }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Sample data - replace with real data
  const dashboardData = {
    strain: 65,
    recovery: 82,
    sleep: 78,
    workouts: 12,
    calories: 2450,
    duration: 48,
    stress: 45,
    energy: 78,
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Good Morning</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || 'Champion'}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Text style={styles.avatar}>💪</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Status */}
        <ActivityStatus status="Active" theme={theme} />

        {/* Main Progress Rings */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Goals</Text>
          <View style={styles.progressGrid}>
            <CircularProgress
              percentage={dashboardData.strain}
              color="#FF9600"
              label="Strain"
              value={dashboardData.strain}
              unit="%"
              theme={theme}
            />
            <CircularProgress
              percentage={dashboardData.recovery}
              color="#58CC02"
              label="Recovery"
              value={dashboardData.recovery}
              unit="%"
              theme={theme}
            />
            <CircularProgress
              percentage={dashboardData.sleep}
              color="#1CB0F6"
              label="Sleep"
              value={dashboardData.sleep}
              unit="%"
              theme={theme}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>This Week</Text>
          <View style={styles.statsGrid}>
            <StatsCard
              icon="🏋️"
              title="Workouts"
              value={dashboardData.workouts}
              trend="up"
              trendValue="+3"
              color="#58CC02"
              theme={theme}
            />
            <StatsCard
              icon="🔥"
              title="Calories"
              value={dashboardData.calories}
              trend="up"
              trendValue="+200"
              color="#FF9600"
              theme={theme}
            />
            <StatsCard
              icon="⏱️"
              title="Minutes"
              value={dashboardData.duration}
              trend="up"
              trendValue="+12"
              color="#1CB0F6"
              theme={theme}
            />
          </View>
        </View>

        {/* Stress & Energy */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Stress & Energy</Text>
            <TouchableOpacity>
              <Text style={[styles.cardAction, { color: theme.primary }]}>Details →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stressContent}>
            <View>
              <Text style={[styles.stressLabel, { color: theme.textSecondary }]}>Today's Stress</Text>
              <StressGauge level={dashboardData.stress} theme={theme} />
            </View>
            
            <View style={styles.energyContainer}>
              <Text style={styles.energyIcon}>⚡</Text>
              <View>
                <Text style={[styles.energyValue, { color: theme.primary }]}>{dashboardData.energy}%</Text>
                <Text style={[styles.energyLabel, { color: theme.textSecondary }]}>Energy</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Recent Achievements</Text>
          </View>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <Text style={[styles.achievementText, { color: theme.textSecondary }]}>7 Day Streak</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>💎</Text>
              <Text style={[styles.achievementText, { color: theme.textSecondary }]}>1000 LiftCoins</Text>
            </View>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>🌳</Text>
              <Text style={[styles.achievementText, { color: theme.textSecondary }]}>Tree Level 5</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BFFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 24,
  },
  activityCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityStatus: {
    fontSize: 24,
    fontWeight: '800',
  },
  activityButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  activityButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statsSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (width - 64) / 3,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    fontSize: 24,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  stressContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stressContainer: {
    alignItems: 'center',
  },
  stressLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  stressValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  energyIcon: {
    fontSize: 40,
  },
  energyValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  energyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GameLikeDashboard;
