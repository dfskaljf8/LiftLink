import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { colors, spacing, typography, borderRadius, shadows, scale, moderateScale, deviceSize } from '../styles/AppStyles';

const { width, height } = Dimensions.get('window');

// Temporary Map Placeholder - react-native-maps has compatibility issues with RN 0.76
// This will be replaced when react-native-maps supports RN 0.76+
const TrainerMapView = ({ trainers, onTrainerSelect }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyTrainers, setNearbyTrainers] = useState([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyTrainers();
    }
  }, [userLocation]);

  const fetchNearbyTrainers = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      if (!backendUrl) {
        console.error('❌ REACT_APP_BACKEND_URL is not set!');
      }
      const response = await fetch(`${backendUrl}/api/trainers/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNearbyTrainers(data.trainers || []);
      } else {
        console.error('Failed to fetch nearby trainers');
        setNearbyTrainers([]);
      }
    } catch (error) {
      console.error('Error fetching nearby trainers:', error);
      setNearbyTrainers([]);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'LiftLink needs access to your location to show nearby trainers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setLoading(false);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleTrainerPress = (trainer) => {
    Alert.alert(
      trainer.name || trainer.display_name,
      `${trainer.specialties?.join(', ') || 'Personal Training'}\n$${trainer.hourly_rate || 75}/session\nRating: ${trainer.rating || 5.0}/5\n\n${trainer.location || 'Location available'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Session',
          onPress: () => onTrainerSelect && onTrainerSelect(trainer)
        }
      ]
    );
  };

  const renderTrainerCard = ({ item: trainer }) => (
    <TouchableOpacity
      style={styles.trainerCard}
      onPress={() => handleTrainerPress(trainer)}
    >
      <View style={styles.trainerAvatar}>
        <Text style={styles.avatarText}>
          {(trainer.name || trainer.display_name || 'T').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.trainerInfo}>
        <Text style={styles.trainerName}>{trainer.name || trainer.display_name}</Text>
        <Text style={styles.trainerSpecialty}>
          {trainer.specialties?.join(', ') || 'Personal Training'}
        </Text>
        <View style={styles.trainerMeta}>
          <Text style={styles.trainerRate}>${trainer.hourly_rate || 75}/session</Text>
          <Text style={styles.trainerRating}>⭐ {trainer.rating || 5.0}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => onTrainerSelect && onTrainerSelect(trainer)}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading nearby trainers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder Notice */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
        <Text style={styles.mapPlaceholderTitle}>Map View Coming Soon</Text>
        <Text style={styles.mapPlaceholderText}>
          Interactive map is being updated for better performance.
          Browse trainers in list view below.
        </Text>
        {userLocation && (
          <Text style={styles.locationText}>
            📍 Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Trainer List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {nearbyTrainers.length > 0
            ? `${nearbyTrainers.length} Trainer${nearbyTrainers.length === 1 ? '' : 's'} Nearby`
            : 'Finding Trainers...'}
        </Text>
        {nearbyTrainers.length > 0 ? (
          <FlatList
            data={nearbyTrainers}
            renderItem={renderTrainerCard}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No trainers found in your area</Text>
            <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.text,
  },
  mapPlaceholder: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  mapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  mapPlaceholderTitle: {
    fontSize: typography.h4,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mapPlaceholderText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  locationText: {
    fontSize: typography.caption,
    color: colors.primary,
    marginTop: spacing.md,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  listTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  trainerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: typography.body,
    fontWeight: 'bold',
    color: colors.text,
  },
  trainerSpecialty: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trainerMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  trainerRate: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  trainerRating: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.caption,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default TrainerMapView;
