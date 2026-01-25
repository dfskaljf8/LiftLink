/**
 * Trainers Screen
 * Find and browse trainers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function TrainersScreen() {
  const { colors } = useApp();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API_URL}/trainers/all`);
      setTrainers(response.data?.trainers || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      // Mock data for demo
      setTrainers([
        { id: '1', name: 'Sarah Johnson', specialty: 'Strength Training', rating: 4.9, sessions: 150 },
        { id: '2', name: 'Mike Chen', specialty: 'HIIT & Cardio', rating: 4.8, sessions: 200 },
        { id: '3', name: 'Emma Wilson', specialty: 'Yoga & Flexibility', rating: 4.7, sessions: 120 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderTrainer = ({ item }) => (
    <TouchableOpacity style={[styles.trainerCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
        <Text style={styles.avatarText}>{item.name?.charAt(0) || 'T'}</Text>
      </View>
      <View style={styles.trainerInfo}>
        <Text style={[styles.trainerName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.trainerSpecialty, { color: colors.textSecondary }]}>
          {item.specialty || 'Personal Trainer'}
        </Text>
        <View style={styles.trainerStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={[styles.statText, { color: colors.text }]}>{item.rating || 4.5}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {item.sessions || 0} sessions
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={[styles.bookButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Find Trainers</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'map' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name="map"
              size={20}
              color={viewMode === 'map' ? '#fff' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Trainers List */}
      <FlatList
        data={trainers}
        renderItem={renderTrainer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No trainers found nearby
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  trainerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  trainerSpecialty: {
    fontSize: 14,
    marginTop: 2,
  },
  trainerStats: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
