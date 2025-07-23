import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

const API = 'https://1c6587b8-a4c5-4550-aaa8-d1f1e8eabfb1.preview.emergentagent.com/api';

const GoogleFitIntegration = ({ user }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fitnessData, setFitnessData] = useState([]);
  const [lastSync, setLastSync] = useState(null);

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

  useEffect(() => {
    initializeGoogleSignIn();
    checkConnectionStatus();
  }, []);

  const initializeGoogleSignIn = async () => {
    try {
      await GoogleSignin.configure({
        webClientId: Platform.OS === 'ios' 
          ? '464466068216-e1qq893h44vejoau0vddk93ev2tih0f3.apps.googleusercontent.com'
          : '464466068216-4sfg6htsflfler6ri9f9hqbsvgl7n7ij.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
        scopes: [
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.body.read',
          'https://www.googleapis.com/auth/fitness.location.read'
        ]
      });
    } catch (error) {
      console.error('Google Sign-In configuration error:', error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`${API}/fitness/status/${user.id}`);
      setConnected(response.data.google_fit_connected);
      setLastSync(response.data.last_sync);
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const handleConnectGoogleFit = async () => {
    setLoading(true);
    setError('');

    try {
      // Check if user is already signed in
      const isSignedIn = await GoogleSignin.isSignedIn();
      
      if (!isSignedIn) {
        // Sign in user
        await GoogleSignin.signIn();
      }

      // Get user info and tokens
      const userInfo = await GoogleSignin.getTokens();
      
      // Connect to backend
      const response = await axios.post(`${API}/google-fit/connect`, {
        user_id: user.id,
        access_token: userInfo.accessToken,
        refresh_token: userInfo.refreshToken,
        mock_mode: true // Using mock mode for now
      });

      if (response.data.success) {
        setConnected(true);
        Alert.alert('Success', 'Google Fit connected successfully!');
        await syncWorkoutData();
      } else {
        setError('Failed to connect to Google Fit');
      }
    } catch (error) {
      console.error('Google Fit connection error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setError('Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setError('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available');
      } else {
        setError('Failed to connect to Google Fit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const syncWorkoutData = async () => {
    try {
      const response = await axios.post(`${API}/sync/workouts`, {
        user_id: user.id,
        source: 'google_fit'
      });

      if (response.data.synced_workouts) {
        setFitnessData(response.data.synced_workouts);
        setLastSync(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error syncing workout data:', error);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Google Fit',
      'Are you sure you want to disconnect Google Fit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoogleSignin.signOut();
              await axios.delete(`${API}/google-fit/disconnect/${user.id}`);
              setConnected(false);
              setFitnessData([]);
              setLastSync(null);
              Alert.alert('Success', 'Google Fit disconnected');
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert('Error', 'Failed to disconnect Google Fit');
            }
          }
        }
      ]
    );
  };

  const renderConnectionStatus = () => (
    <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
      <View style={styles.statusHeader}>
        <Text style={[styles.statusTitle, { color: colors.text }]}>Google Fit Integration</Text>
        <View style={[styles.statusIndicator, { 
          backgroundColor: connected ? colors.success : colors.textSecondary 
        }]} />
      </View>
      
      <Text style={[styles.statusText, { color: colors.textSecondary }]}>
        {connected ? 'Connected and syncing' : 'Not connected'}
      </Text>
      
      {lastSync && (
        <Text style={[styles.lastSyncText, { color: colors.textSecondary }]}>
          Last sync: {new Date(lastSync).toLocaleString()}
        </Text>
      )}
    </View>
  );

  const renderConnectionButton = () => (
    <TouchableOpacity
      style={[styles.connectionButton, { 
        backgroundColor: connected ? colors.error : colors.primary 
      }]}
      onPress={connected ? handleDisconnect : handleConnectGoogleFit}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.connectionButtonText, { color: colors.text }]}>
          {connected ? 'Disconnect Google Fit' : 'Connect Google Fit'}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFitnessData = () => (
    <View style={[styles.dataCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.dataTitle, { color: colors.text }]}>Recent Workouts</Text>
      
      {fitnessData.length === 0 ? (
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          No workout data available
        </Text>
      ) : (
        fitnessData.map((workout, index) => (
          <View key={index} style={styles.workoutItem}>
            <Text style={[styles.workoutType, { color: colors.text }]}>
              {workout.workout_type}
            </Text>
            <Text style={[styles.workoutDetails, { color: colors.textSecondary }]}>
              {workout.duration_minutes} minutes • {workout.calories_burned} calories
            </Text>
            <Text style={[styles.workoutDate, { color: colors.textSecondary }]}>
              {new Date(workout.start_time).toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
      
      {connected && (
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: colors.secondary }]}
          onPress={syncWorkoutData}
        >
          <Text style={[styles.syncButtonText, { color: colors.text }]}>
            Sync Now
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Fitness Integration
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Connect your Google Fit account to sync workout data
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {renderConnectionStatus()}
        {renderConnectionButton()}
        {renderFitnessData()}

        <View style={[styles.benefitsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.benefitsTitle, { color: colors.text }]}>
            Why Connect Google Fit?
          </Text>
          <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>
            • Automatically track workouts and progress
          </Text>
          <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>
            • Sync across all your devices
          </Text>
          <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>
            • Get detailed analytics and insights
          </Text>
          <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>
            • Complete challenges and earn rewards
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastSyncText: {
    fontSize: 12,
  },
  connectionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  workoutItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 12,
  },
  syncButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  benefitsItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default GoogleFitIntegration;