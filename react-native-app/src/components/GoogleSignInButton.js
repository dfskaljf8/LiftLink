/**
 * Google Sign-In Button Component for LiftLink
 * Integrates with Emergent Auth for Google OAuth
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API URL
const API_BASE_URL = 'https://swiftauth-1.preview.emergentagent.com';

// Emergent Auth URL
const EMERGENT_AUTH_URL = 'https://auth.emergentagent.com';

// Deep link scheme
const APP_SCHEME = 'liftlink';

const GoogleSignInButton = ({ onSignInSuccess, onSignInError, style }) => {
  const [loading, setLoading] = useState(false);

  // Set up deep link listener
  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (url && url.includes('session_id=')) {
        await handleAuthCallback(url);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('session_id=')) {
        handleAuthCallback(url);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUrl = `${APP_SCHEME}://auth/callback`;
      const authUrl = `${EMERGENT_AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      console.log('🔐 Starting Google Sign-In...');
      console.log('Redirect URL:', redirectUrl);
      
      const supported = await Linking.canOpenURL(authUrl);
      
      if (supported) {
        await Linking.openURL(authUrl);
      } else {
        // Fallback for web or unsupported platforms
        Alert.alert(
          'Google Sign-In',
          'Opening Google Sign-In in browser...',
          [{ text: 'OK' }]
        );
        await Linking.openURL(authUrl);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setLoading(false);
      onSignInError?.(error.message || 'Failed to start Google Sign-In');
    }
  };

  const handleAuthCallback = async (url) => {
    setLoading(true);
    
    try {
      console.log('🔐 Processing auth callback:', url);
      
      // Parse session_id from URL fragment
      let sessionId = null;
      
      if (url.includes('#session_id=')) {
        sessionId = url.split('#session_id=')[1]?.split('&')[0];
      } else if (url.includes('session_id=')) {
        sessionId = url.split('session_id=')[1]?.split('&')[0];
      }
      
      if (!sessionId) {
        throw new Error('No session ID received from Google');
      }
      
      console.log('Session ID received, exchanging for user data...');
      
      // Exchange session_id for user data
      const sessionResponse = await axios.get(
        'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
        {
          headers: {
            'X-Session-ID': sessionId
          }
        }
      );
      
      const sessionData = sessionResponse.data;
      console.log('✅ Session data received:', { email: sessionData.email, name: sessionData.name });
      
      // Sync with our backend
      const authResponse = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        email: sessionData.email,
        name: sessionData.name,
        picture: sessionData.picture,
        google_id: sessionData.id,
        session_token: sessionData.session_token
      });
      
      if (authResponse.data.success) {
        const { user, access_token, is_new_user } = authResponse.data;
        
        // Store auth data
        await AsyncStorage.setItem('liftlink_user', JSON.stringify(user));
        await AsyncStorage.setItem('liftlink_token', access_token);
        await AsyncStorage.setItem('session_token', sessionData.session_token);
        
        console.log('✅ Google Sign-In successful:', user.email);
        
        onSignInSuccess?.({
          user,
          token: access_token,
          isNewUser: is_new_user
        });
      } else {
        throw new Error(authResponse.data.message || 'Backend authentication failed');
      }
      
    } catch (error) {
      console.error('Auth callback error:', error);
      onSignInError?.(error.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.googleButton, style]}
      onPress={handleGoogleSignIn}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#4285F4" size="small" />
      ) : (
        <View style={styles.buttonContent}>
          {/* Google Logo */}
          <View style={styles.googleLogoContainer}>
            <Text style={styles.googleLogo}>G</Text>
          </View>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleLogo: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton;
