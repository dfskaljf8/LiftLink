/**
 * TrainerMapView - Interactive Map for Finding Trainers
 * Uses react-native-maps 1.26.0 (compatible with RN 0.76)
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TrainerMapView = ({ trainers = [], onTrainerSelect, navigation }) => {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nearbyTrainers, setNearbyTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyTrainers();
      setRegion({
        ...userLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  }, [userLocation]);

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
        // Default to San Francisco if location fails
        setUserLocation({ latitude: 37.78825, longitude: -122.4324 });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchNearbyTrainers = async () => {
    if (!userLocation) return;
    
    try {
      const response = await fetch(`${API}/trainers/nearby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add random offsets to trainers for map display
        const trainersWithCoords = (data.trainers || []).map((trainer, index) => ({
          ...trainer,
          coordinate: {
            latitude: userLocation.latitude + (Math.random() - 0.5) * 0.05,
            longitude: userLocation.longitude + (Math.random() - 0.5) * 0.05,
          },
        }));
        setNearbyTrainers(trainersWithCoords);
      }
    } catch (error) {
      console.error('Error fetching nearby trainers:', error);
    }
  };

  const handleMarkerPress = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const handleBookPress = (trainer) => {
    if (onTrainerSelect) {
      onTrainerSelect(trainer);
    } else {
      Alert.alert(
        'Book Session',
        `Would you like to book a session with ${trainer.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Book', onPress: () => console.log('Booking:', trainer) },
        ]
      );
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: LATITUDE_DELTA * 0.5,
        longitudeDelta: LONGITUDE_DELTA * 0.5,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Finding trainers near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
        customMapStyle={darkMapStyle}
      >
        {/* Trainer Markers */}
        {nearbyTrainers.map((trainer) => (
          <Marker
            key={trainer.id}
            coordinate={trainer.coordinate}
            onPress={() => handleMarkerPress(trainer)}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                selectedTrainer?.id === trainer.id && styles.markerSelected
              ]}>
                <Icon name="fitness-center" size={20} color="#fff" />
              </View>
            </View>
            <Callout onPress={() => handleBookPress(trainer)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{trainer.name}</Text>
                <Text style={styles.calloutSpecialty}>
                  {trainer.specialties?.join(', ') || 'Personal Training'}
                </Text>
                <View style={styles.calloutRow}>
                  <Text style={styles.calloutPrice}>${trainer.hourly_rate || 75}/hr</Text>
                  <Text style={styles.calloutRating}>⭐ {trainer.rating || 5.0}</Text>
                </View>
                <Text style={styles.calloutAction}>Tap to book →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {nearbyTrainers.length} Trainers Nearby
        </Text>
      </View>

      {/* Center on User Button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Icon name="my-location" size={24} color="#4f46e5" />
      </TouchableOpacity>

      {/* Selected Trainer Card */}
      {selectedTrainer && (
        <View style={styles.trainerCard}>
          <View style={styles.trainerAvatar}>
            <Text style={styles.avatarText}>
              {selectedTrainer.name?.charAt(0).toUpperCase() || 'T'}
            </Text>
          </View>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{selectedTrainer.name}</Text>
            <Text style={styles.trainerSpecialty}>
              {selectedTrainer.specialties?.join(', ') || 'Personal Training'}
            </Text>
            <View style={styles.trainerMeta}>
              <Text style={styles.trainerPrice}>${selectedTrainer.hourly_rate || 75}/hr</Text>
              <Text style={styles.trainerRating}>⭐ {selectedTrainer.rating || 5.0}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handleBookPress(selectedTrainer)}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedTrainer(null)}
          >
            <Icon name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Dark map style for consistent look
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2937' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#374151' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f9fafb',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    textAlign: 'center',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    backgroundColor: '#f9fafb',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#4f46e5',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerSelected: {
    backgroundColor: '#22c55e',
    transform: [{ scale: 1.2 }],
  },
  callout: {
    width: 200,
    padding: 12,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  calloutSpecialty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  calloutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  calloutRating: {
    fontSize: 14,
    color: '#6b7280',
  },
  calloutAction: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  trainerCard: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  trainerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  trainerSpecialty: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  trainerMeta: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  trainerPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  trainerRating: {
    fontSize: 14,
    color: '#9ca3af',
  },
  bookButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default TrainerMapView;
