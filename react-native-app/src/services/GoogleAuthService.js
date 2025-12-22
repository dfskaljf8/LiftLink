/**
 * Google Sign-In Service for LiftLink React Native App
 * Uses Emergent Auth for hassle-free Google OAuth
 */

import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API base URL - get from environment
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://vibe-workout.preview.emergentagent.com';

// Emergent Auth URL
const EMERGENT_AUTH_URL = 'https://auth.emergentagent.com';

// Deep link scheme for the app
const APP_SCHEME = 'liftlink';
const REDIRECT_PATH = '/auth/callback';

class GoogleAuthService {
  constructor() {
    this.sessionToken = null;
    this.user = null;
  }

  /**
   * Initialize the auth service - check for existing session
   */
  async initialize() {
    try {
      const storedToken = await AsyncStorage.getItem('session_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      
      if (storedToken) {
        this.sessionToken = storedToken;
        // Verify session is still valid
        const isValid = await this.verifySession();
        if (isValid && storedUser) {
          this.user = JSON.parse(storedUser);
          return { authenticated: true, user: this.user };
        } else {
          // Session expired, clear storage
          await this.clearSession();
        }
      }
      
      return { authenticated: false, user: null };
    } catch (error) {
      console.error('Auth initialization error:', error);
      return { authenticated: false, user: null };
    }
  }

  /**
   * Start Google Sign-In flow
   * Opens browser for Emergent Auth OAuth
   */
  async signInWithGoogle() {
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      // For React Native, we use deep linking
      const redirectUrl = `${APP_SCHEME}://${REDIRECT_PATH}`;
      const authUrl = `${EMERGENT_AUTH_URL}/?redirect=${encodeURIComponent(redirectUrl)}`;
      
      console.log('🔐 Starting Google Sign-In...');
      console.log('Redirect URL:', redirectUrl);
      
      // Open the auth URL in the browser
      const supported = await Linking.canOpenURL(authUrl);
      if (supported) {
        await Linking.openURL(authUrl);
        return { success: true, message: 'Opening Google Sign-In...' };
      } else {
        throw new Error('Cannot open authentication URL');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle the callback from Google OAuth
   * Called when app receives deep link with session_id
   */
  async handleAuthCallback(url) {
    try {
      console.log('🔐 Processing auth callback:', url);
      
      // Parse the URL to get session_id from fragment
      const urlObj = new URL(url);
      const fragment = urlObj.hash || '';
      const params = new URLSearchParams(fragment.replace('#', ''));
      const sessionId = params.get('session_id');
      
      if (!sessionId) {
        console.error('No session_id in callback URL');
        return { success: false, error: 'No session ID received' };
      }
      
      // Exchange session_id for session data
      const response = await axios.get(
        'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
        {
          headers: {
            'X-Session-ID': sessionId
          }
        }
      );
      
      const sessionData = response.data;
      console.log('✅ Session data received:', { email: sessionData.email, name: sessionData.name });
      
      // Store session token
      this.sessionToken = sessionData.session_token;
      await AsyncStorage.setItem('session_token', sessionData.session_token);
      
      // Create or update user in our backend
      const backendResult = await this.syncUserWithBackend(sessionData);
      
      if (backendResult.success) {
        this.user = backendResult.user;
        await AsyncStorage.setItem('user_data', JSON.stringify(backendResult.user));
        
        return {
          success: true,
          user: backendResult.user,
          isNewUser: backendResult.isNewUser
        };
      } else {
        return { success: false, error: backendResult.error };
      }
      
    } catch (error) {
      console.error('Auth callback error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync Google user with our backend
   */
  async syncUserWithBackend(sessionData) {
    try {
      // Check if user exists
      const checkResponse = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        email: sessionData.email,
        name: sessionData.name,
        picture: sessionData.picture,
        google_id: sessionData.id,
        session_token: sessionData.session_token
      });
      
      return {
        success: true,
        user: checkResponse.data.user,
        isNewUser: checkResponse.data.is_new_user
      };
    } catch (error) {
      console.error('Backend sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify current session is still valid
   */
  async verifySession() {
    try {
      if (!this.sessionToken) return false;
      
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.sessionToken}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.log('Session verification failed:', error.message);
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get session token for API calls
   */
  getSessionToken() {
    return this.sessionToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.sessionToken && !!this.user;
  }

  /**
   * Sign out and clear session
   */
  async signOut() {
    try {
      // Call backend logout if we have a session
      if (this.sessionToken) {
        try {
          await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
            headers: {
              'Authorization': `Bearer ${this.sessionToken}`
            }
          });
        } catch (error) {
          // Ignore backend errors during logout
          console.log('Backend logout error (ignored):', error.message);
        }
      }
      
      await this.clearSession();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear local session data
   */
  async clearSession() {
    this.sessionToken = null;
    this.user = null;
    await AsyncStorage.removeItem('session_token');
    await AsyncStorage.removeItem('user_data');
  }
}

// Singleton instance
const googleAuthService = new GoogleAuthService();

export default googleAuthService;

// Named exports for convenience
export const signInWithGoogle = () => googleAuthService.signInWithGoogle();
export const handleAuthCallback = (url) => googleAuthService.handleAuthCallback(url);
export const initializeAuth = () => googleAuthService.initialize();
export const signOut = () => googleAuthService.signOut();
export const isAuthenticated = () => googleAuthService.isAuthenticated();
export const getCurrentUser = () => googleAuthService.getCurrentUser();
export const getSessionToken = () => googleAuthService.getSessionToken();
