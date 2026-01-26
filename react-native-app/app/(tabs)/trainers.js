/**
 * Trainers Screen - Futuristic 2050 Design
 * Find and browse trainers with holographic cards
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G, Polygon } from 'react-native-svg';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField } from '../../src/components/FuturisticUI';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// Icons
const SearchIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="11" cy="11" r="6" stroke={FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Path d="M16 16L20 20" stroke={FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StarIcon = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      fill={FUTURE_COLORS.gold}
    />
  </Svg>
);

const SessionsIcon = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" fill="none" />
    <Path d="M3 10H21" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" />
  </Svg>
);

const ListIcon = ({ size = 20, active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 6H20M4 12H20M4 18H20" stroke={active ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const GridIcon = ({ size = 20, active = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
    <Rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} strokeWidth="2" fill="none" />
  </Svg>
);

// Trainer Avatar with glow
const TrainerAvatar = ({ name, specialty, size = 56 }) => {
  const colors = {
    'Strength Training': FUTURE_COLORS.energy,
    'HIIT & Cardio': FUTURE_COLORS.error,
    'Yoga & Flexibility': FUTURE_COLORS.secondary,
    'Personal Trainer': FUTURE_COLORS.primary,
  };
  
  const color = colors[specialty] || FUTURE_COLORS.primary;
  
  return (
    <View style={[styles.avatarContainer, { width: size, height: size }]}>
      <View style={[styles.avatarGlow, { backgroundColor: color, width: size + 8, height: size + 8 }]} />
      <View style={[styles.avatar, { width: size, height: size, borderColor: color }]}>
        <Text style={[styles.avatarText, { color }]}>{name?.charAt(0) || 'T'}</Text>
      </View>
    </View>
  );
};

export default function TrainersScreen() {
  const router = useRouter();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API_URL}/trainers/all`);
      setTrainers(response.data?.trainers || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      setTrainers([
        { id: '1', name: 'Sarah Johnson', specialty: 'Strength Training', rating: 4.9, sessions: 150, verified: true },
        { id: '2', name: 'Mike Chen', specialty: 'HIIT & Cardio', rating: 4.8, sessions: 200, verified: true },
        { id: '3', name: 'Emma Wilson', specialty: 'Yoga & Flexibility', rating: 4.7, sessions: 120, verified: true },
        { id: '4', name: 'James Lee', specialty: 'Personal Trainer', rating: 4.6, sessions: 85, verified: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTrainer = ({ item, index }) => (
    <Animated.View entering={FadeInRight.delay(index * 100)}>
      <TouchableOpacity style={styles.trainerCard} activeOpacity={0.8}>
        <TrainerAvatar name={item.name} specialty={item.specialty} />
        
        <View style={styles.trainerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.trainerName}>{item.name}</Text>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24">
                  <Path d="M9 12L11 14L15 10" stroke={FUTURE_COLORS.void} strokeWidth="2" strokeLinecap="round" />
                  <Circle cx="12" cy="12" r="10" fill={FUTURE_COLORS.accent} />
                  <Path d="M9 12L11 14L15 10" stroke={FUTURE_COLORS.void} strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </View>
            )}
          </View>
          <Text style={styles.trainerSpecialty}>{item.specialty || 'Personal Trainer'}</Text>
          
          <View style={styles.trainerStats}>
            <View style={styles.statItem}>
              <StarIcon size={14} />
              <Text style={styles.statText}>{item.rating || 4.5}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <SessionsIcon size={14} />
              <Text style={styles.statText}>{item.sessions || 0} sessions</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FUTURE_COLORS.primary} />
          <Text style={styles.loadingText}>Finding trainers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ParticleField count={8} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={styles.title}>Find Trainers</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <ListIcon size={18} active={viewMode === 'list'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <GridIcon size={18} active={viewMode === 'grid'} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <SearchIcon size={20} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainers..."
            placeholderTextColor={FUTURE_COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Trainers List */}
        <FlatList
          data={filteredTrainers}
          renderItem={renderTrainer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Svg width={80} height={80} viewBox="0 0 24 24">
                <Circle cx="10" cy="8" r="3" stroke={FUTURE_COLORS.textMuted} strokeWidth="1.5" fill="none" />
                <Path d="M4 18C4 15 7 13 10 13" stroke={FUTURE_COLORS.textMuted} strokeWidth="1.5" fill="none" />
                <Circle cx="17" cy="17" r="4" stroke={FUTURE_COLORS.textMuted} strokeWidth="1.5" fill="none" />
                <Path d="M20 20L22 22" stroke={FUTURE_COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
              <Text style={styles.emptyTitle}>No trainers found</Text>
              <Text style={styles.emptyText}>Try adjusting your search</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: FUTURE_COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: FUTURE_COLORS.elevated,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FUTURE_COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  searchIcon: {
    paddingLeft: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    fontSize: 15,
    color: FUTURE_COLORS.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FUTURE_COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    borderRadius: 32,
    opacity: 0.2,
  },
  avatar: {
    borderRadius: 28,
    backgroundColor: FUTURE_COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  trainerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  trainerSpecialty: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  trainerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: FUTURE_COLORS.border,
    marginHorizontal: 10,
  },
  bookButton: {
    backgroundColor: FUTURE_COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    color: FUTURE_COLORS.void,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 4,
  },
});
