import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AppContext } from '../../App';
import SwipeTrainerDiscovery from '../components/SwipeTrainerDiscovery';
import TrainerMapView from '../components/TrainerMapView';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const TrainersScreen = () => {
  const { colors, handleBookTrainer } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [likedTrainers, setLikedTrainers] = useState([]);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API}/trainers/all`);
      if (response.data && response.data.trainers) {
        setTrainers(response.data.trainers);
      } else {
        setTrainers([]);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const renderTrainerCard = (trainer) => (
    <View key={trainer.id} style={[styles.trainerCard, { backgroundColor: colors.surface }]}>
      <View style={styles.trainerHeader}>
        <View style={styles.trainerInfo}>
          <Text style={[styles.trainerName, { color: colors.text }]}>{trainer.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: colors.warning }]}>⭐ {trainer.rating}</Text>
            <Text style={[styles.availability, { color: colors.textSecondary }]}>{trainer.availability}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => handleBookTrainer(trainer)}
        >
          <Text style={[styles.bookButtonText, { color: colors.text }]}>Book</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.trainerBio, { color: colors.textSecondary }]}>{trainer.bio}</Text>
      <View style={styles.trainerDetails}>
        <Text style={[styles.trainerSpecialties, { color: colors.secondary }]}>
          {trainer.specialties?.join(', ')}
        </Text>
        <Text style={[styles.trainerPrice, { color: colors.primary }]}>{trainer.price}</Text>
      </View>
      <Text style={[styles.trainerLocation, { color: colors.textSecondary }]}>📍 {trainer.location}</Text>
    </View>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <TouchableOpacity
        style={[styles.viewModeButton, { backgroundColor: viewMode === 'swipe' ? colors.primary : colors.surface }]}
        onPress={() => setViewMode('swipe')}
      >
        <Icon name="swipe" size={18} color={colors.text} />
        <Text style={[styles.viewModeText, { color: colors.text }]}>Swipe</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, { backgroundColor: viewMode === 'list' ? colors.primary : colors.surface }]}
        onPress={() => setViewMode('list')}
      >
        <Icon name="list" size={18} color={colors.text} />
        <Text style={[styles.viewModeText, { color: colors.text }]}>List</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.viewModeButton, { backgroundColor: viewMode === 'map' ? colors.primary : colors.surface }]}
        onPress={() => setViewMode('map')}
      >
        <Icon name="map" size={18} color={colors.text} />
        <Text style={[styles.viewModeText, { color: colors.text }]}>Map</Text>
      </TouchableOpacity>
    </View>
  );

  const handleTrainerLiked = (trainer) => {
    setLikedTrainers([...likedTrainers, trainer]);
  };

  const handleTrainerPassed = (trainer) => {
    console.log('Passed trainer:', trainer.name);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (viewMode === 'swipe') {
    return (
      <SwipeTrainerDiscovery
        trainers={trainers}
        onTrainerLiked={handleTrainerLiked}
        onTrainerPassed={handleTrainerPassed}
        onExit={() => setViewMode('list')}
        onBookSession={handleBookTrainer}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Find Trainers</Text>
        {renderViewModeSelector()}
      </View>
      {viewMode === 'list' ? (
        <ScrollView style={styles.content}>
          {trainers.length > 0 ? (
            trainers.map(renderTrainerCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Trainers Available</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                We're working on connecting you with amazing trainers in your area. Check back soon!
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <TrainerMapView trainers={trainers} onTrainerSelect={handleBookTrainer} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  content: { flex: 1, padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  viewModeSelector: { flexDirection: 'row', marginBottom: 16 },
  viewModeButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  viewModeText: { fontSize: 14, marginLeft: 4 },
  trainerCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  trainerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 14, marginRight: 12 },
  availability: { fontSize: 12 },
  bookButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  bookButtonText: { fontSize: 14, fontWeight: '600' },
  trainerBio: { fontSize: 14, marginBottom: 8 },
  trainerDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  trainerSpecialties: { fontSize: 12, flex: 1 },
  trainerPrice: { fontSize: 14, fontWeight: '600' },
  trainerLocation: { fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyStateText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }
});

export default TrainersScreen;
