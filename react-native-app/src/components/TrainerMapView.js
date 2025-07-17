import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const TrainerMapView = ({ trainers, onTrainerSelect }) => {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  };

  const mockTrainerLocations = [
    {
      id: 'trainer_001',
      name: 'Sarah Johnson',
      specialties: ['Strength Training', 'HIIT'],
      rating: 4.8,
      price: '$75/session',
      latitude: 37.7849,
      longitude: -122.4094,
      address: '123 Fitness St, San Francisco, CA'
    },
    {
      id: 'trainer_002',
      name: 'Mike Chen',
      specialties: ['Cardio', 'Weight Loss'],
      rating: 4.9,
      price: '$85/session',
      latitude: 37.7649,
      longitude: -122.4294,
      address: '456 Gym Ave, San Francisco, CA'
    },
    {
      id: 'trainer_003',
      name: 'Emily Rodriguez',
      specialties: ['Yoga', 'Flexibility'],
      rating: 4.7,
      price: '$60/session',
      latitude: 37.7549,
      longitude: -122.4394,
      address: '789 Wellness Blvd, San Francisco, CA'
    },
    {
      id: 'trainer_004',
      name: 'David Kim',
      specialties: ['CrossFit', 'Conditioning'],
      rating: 4.6,
      price: '$80/session',
      latitude: 37.7949,
      longitude: -122.3994,
      address: '321 Strong St, San Francisco, CA'
    }
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMarkerPress = (trainer) => {
    Alert.alert(
      trainer.name,
      `${trainer.specialties.join(', ')}\n${trainer.price}\nRating: ${trainer.rating}/5\n\n${trainer.address}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Session',
          onPress: () => onTrainerSelect && onTrainerSelect(trainer)
        }
      ]
    );
  };

  const renderCustomMarker = (trainer) => (
    <View style={styles.markerContainer}>
      <View style={[styles.markerBubble, { backgroundColor: colors.primary }]}>
        <Text style={[styles.markerText, { color: colors.text }]}>
          {trainer.name.split(' ')[0]}
        </Text>
      </View>
      <View style={[styles.markerArrow, { borderTopColor: colors.primary }]} />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        customMapStyle={[
          {
            featureType: 'all',
            stylers: [
              {
                saturation: -100
              }
            ]
          }
        ]}
      >
        {mockTrainerLocations.map((trainer) => (
          <Marker
            key={trainer.id}
            coordinate={{
              latitude: trainer.latitude,
              longitude: trainer.longitude,
            }}
            title={trainer.name}
            description={`${trainer.specialties.join(', ')} • ${trainer.price}`}
            onPress={() => handleMarkerPress(trainer)}
          >
            {renderCustomMarker(trainer)}
          </Marker>
        ))}
      </MapView>

      <View style={[styles.mapOverlay, { backgroundColor: colors.surface }]}>
        <Text style={[styles.overlayTitle, { color: colors.text }]}>
          Find Trainers Near You
        </Text>
        <Text style={[styles.overlaySubtitle, { color: colors.textSecondary }]}>
          Tap on a marker to view trainer details
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    backgroundColor: '#4f46e5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    minWidth: 60,
    alignItems: 'center',
  },
  markerText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  mapOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  overlaySubtitle: {
    fontSize: 14,
  },
});

export default TrainerMapView;