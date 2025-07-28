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
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { colors, spacing, typography, borderRadius, shadows, scale, moderateScale } from '../styles/AppStyles';

const { width, height } = Dimensions.get('window');

const TrainerMapView = ({ trainers, onTrainerSelect }) => {
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
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
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://liftlink-ra6t.onrender.com';
      const response = await fetch(`${backendUrl}/api/trainers/nearby`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: 10 // 10km radius
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

  const renderCustomMarker = (trainer) => (
    <View style={styles.markerContainer}>
      <View style={[styles.markerBubble, { backgroundColor: colors.primary }]}>
        <Text style={[styles.markerText, { color: colors.text }]}>
          {(trainer.name || trainer.display_name || 'T').split(' ')[0]}
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
          Loading nearby trainers...
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
        {nearbyTrainers.map((trainer) => (
          trainer.latitude && trainer.longitude ? (
            <Marker
              key={trainer.id}
              coordinate={{
                latitude: trainer.latitude,
                longitude: trainer.longitude,
              }}
              title={trainer.name || trainer.display_name}
              description={`${trainer.specialties?.join(', ') || 'Personal Training'} • $${trainer.hourly_rate || 75}/session`}
              onPress={() => handleMarkerPress(trainer)}
            >
              {renderCustomMarker(trainer)}
            </Marker>
          ) : null
        ))}
      </MapView>

      <View style={[styles.mapOverlay, { backgroundColor: colors.surface }]}>
        <Text style={[styles.overlayTitle, { color: colors.text }]}>
          Find Trainers Near You
        </Text>
        <Text style={[styles.overlaySubtitle, { color: colors.textSecondary }]}>
          {nearbyTrainers.length > 0 
            ? `${nearbyTrainers.length} trainer${nearbyTrainers.length === 1 ? '' : 's'} nearby`
            : "No trainers found in your area"
          }
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
    backgroundColor: colors.backgroundDark,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    backgroundColor: colors.primary,
    padding: scale(8),
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: '#ffffff',
    minWidth: scale(60),
    alignItems: 'center',
    ...shadows.small,
  },
  markerText: {
    fontSize: moderateScale(12),
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: scale(6),
    borderRightWidth: scale(6),
    borderTopWidth: scale(6),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
  mapOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surfaceDark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  overlayTitle: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  overlaySubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default TrainerMapView;