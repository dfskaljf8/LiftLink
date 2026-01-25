/**
 * Sessions Screen
 * View and manage training sessions
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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

export default function SessionsScreen() {
  const router = useRouter();
  const { colors, sessions } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'completed'

  const onRefresh = () => {
    setRefreshing(true);
    // Simulating refresh
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
      style={[
        styles.filterButton,
        filter === value && { backgroundColor: colors.primary },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: filter === value ? '#fff' : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSession = ({ item }) => (
    <TouchableOpacity style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
      <View style={styles.sessionHeader}>
        <View style={[styles.sessionIcon, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="fitness-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.sessionInfo}>
          <Text style={[styles.sessionType, { color: colors.text }]}>
            {item.session_type || 'Training Session'}
          </Text>
          <Text style={[styles.sessionTrainer, { color: colors.textSecondary }]}>
            with {item.trainer_name || 'Trainer'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'completed' ? colors.accent + '20' : colors.primary + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.status === 'completed' ? colors.accent : colors.primary },
            ]}
          >
            {item.status || 'Scheduled'}
          </Text>
        </View>
      </View>

      <View style={[styles.sessionDetails, { borderTopColor: colors.border }]}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.date || 'TBD'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.duration_minutes || 60} min
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {item.location || 'Online'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Sessions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/calendar')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <FilterButton value="all" label="All" />
        <FilterButton value="upcoming" label="Upcoming" />
        <FilterButton value="completed" label="Completed" />
      </View>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        renderItem={renderSession}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No sessions yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Book a session with a trainer to get started!
            </Text>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/trainers')}
            >
              <Text style={styles.bookButtonText}>Find a Trainer</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sessionCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionTrainer: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sessionDetails: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
