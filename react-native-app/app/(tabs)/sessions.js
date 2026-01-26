/**
 * Sessions Screen - Futuristic 2050 Design
 * View and manage training sessions with holographic UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField, FutureButton } from '../../src/components/FuturisticUI';
import { useApp } from '../../src/context/AppContext';

// Icons
const FitnessIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="fitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Rect x="2" y="9" width="5" height="6" rx="1" fill="url(#fitGrad)" />
    <Rect x="17" y="9" width="5" height="6" rx="1" fill="url(#fitGrad)" />
    <Rect x="6" y="10" width="12" height="4" rx="1" fill="url(#fitGrad)" opacity="0.7" />
  </Svg>
);

const CalendarIcon = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" fill="none" />
    <Path d="M3 10H21" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" />
    <Path d="M8 2V6" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M16 2V6" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const ClockIcon = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="9" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" fill="none" />
    <Path d="M12 6V12L16 14" stroke={FUTURE_COLORS.textSecondary} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const LocationIcon = ({ size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={FUTURE_COLORS.textSecondary}
      strokeWidth="1.5"
      fill="none"
    />
    <Circle cx="12" cy="9" r="2" fill={FUTURE_COLORS.textSecondary} />
  </Svg>
);

const PlusIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5V19M5 12H19" stroke={FUTURE_COLORS.void} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

const EmptyCalendarIcon = ({ size = 80 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} stopOpacity="0.3" />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} stopOpacity="0.3" />
      </LinearGradient>
    </Defs>
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke="url(#emptyGrad)" strokeWidth="1.5" fill="none" />
    <Path d="M3 10H21" stroke="url(#emptyGrad)" strokeWidth="1.5" />
    <Path d="M8 2V6" stroke="url(#emptyGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M16 2V6" stroke="url(#emptyGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="12" cy="15" r="2" fill={FUTURE_COLORS.primary} opacity="0.5" />
  </Svg>
);

export default function SessionsScreen() {
  const router = useRouter();
  const { sessions } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return session.status === 'scheduled';
    if (filter === 'completed') return session.status === 'completed';
    return true;
  });

  const FilterButton = ({ value, label }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSession = ({ item, index }) => {
    const isCompleted = item.status === 'completed';
    
    return (
      <Animated.View entering={FadeInRight.delay(index * 80)}>
        <TouchableOpacity style={styles.sessionCard} activeOpacity={0.8}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionIconContainer}>
              <FitnessIcon size={28} />
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionType}>{item.session_type || 'Training Session'}</Text>
              <Text style={styles.sessionTrainer}>with {item.trainer_name || 'Trainer'}</Text>
            </View>
            <View style={[styles.statusBadge, isCompleted ? styles.statusCompleted : styles.statusScheduled]}>
              <Text style={[styles.statusText, isCompleted ? styles.statusTextCompleted : styles.statusTextScheduled]}>
                {item.status || 'Scheduled'}
              </Text>
            </View>
          </View>

          <View style={styles.sessionDetails}>
            <View style={styles.detailItem}>
              <CalendarIcon size={14} />
              <Text style={styles.detailText}>{item.date || 'TBD'}</Text>
            </View>
            <View style={styles.detailItem}>
              <ClockIcon size={14} />
              <Text style={styles.detailText}>{item.duration_minutes || 60} min</Text>
            </View>
            <View style={styles.detailItem}>
              <LocationIcon size={14} />
              <Text style={styles.detailText}>{item.location || 'Online'}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ParticleField count={6} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={styles.title}>My Sessions</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/calendar')}
          >
            <PlusIcon size={22} />
          </TouchableOpacity>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.filterRow}>
          <FilterButton value="all" label="All" />
          <FilterButton value="upcoming" label="Upcoming" />
          <FilterButton value="completed" label="Completed" />
        </Animated.View>

        {/* Sessions List */}
        <FlatList
          data={filteredSessions}
          renderItem={renderSession}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FUTURE_COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <EmptyCalendarIcon size={100} />
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptySubtitle}>
                Book a session with a trainer to get started on your fitness journey!
              </Text>
              <TouchableOpacity
                style={styles.findTrainerButton}
                onPress={() => router.push('/(tabs)/trainers')}
              >
                <Text style={styles.findTrainerText}>Find a Trainer</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FUTURE_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: FUTURE_COLORS.surface,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: FUTURE_COLORS.primary,
    borderColor: FUTURE_COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: FUTURE_COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: FUTURE_COLORS.void,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sessionCard: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sessionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: FUTURE_COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  sessionTrainer: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusScheduled: {
    backgroundColor: `${FUTURE_COLORS.primary}20`,
  },
  statusCompleted: {
    backgroundColor: `${FUTURE_COLORS.accent}20`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextScheduled: {
    color: FUTURE_COLORS.primary,
  },
  statusTextCompleted: {
    color: FUTURE_COLORS.accent,
  },
  sessionDetails: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: FUTURE_COLORS.border,
    backgroundColor: FUTURE_COLORS.elevated,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  detailText: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: FUTURE_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  findTrainerButton: {
    backgroundColor: FUTURE_COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
  },
  findTrainerText: {
    color: FUTURE_COLORS.void,
    fontSize: 15,
    fontWeight: '700',
  },
});
