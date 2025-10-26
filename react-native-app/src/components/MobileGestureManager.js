import React from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

/**
 * MobileGestureManager
 * 
 * Handles back-to-home, cross-task, and cross-activity gestures for React Native mobile app
 * Supports both iOS and Android platforms with platform-specific implementations
 */

class MobileGestureManager {
  constructor() {
    this.navigationRef = null;
    this.backHandlers = [];
    this.deepLinkHandlers = [];
    this.gestureEnabled = true;
  }

  /**
   * Initialize gesture manager with navigation reference
   */
  initialize(navigationRef) {
    this.navigationRef = navigationRef;
    this.setupBackGestures();
    this.setupDeepLinking();
    this.setupCrossTaskGestures();
  }

  /**
   * Setup back button and swipe-back gestures
   */
  setupBackGestures() {
    if (Platform.OS === 'android') {
      // Android back button handling
      const { BackHandler } = require('react-native');
      
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return this.handleBackPress();
      });
      
      this.backHandlers.push(backHandler);
    }
    
    // iOS swipe-back gesture is handled automatically by React Navigation
    // Additional custom swipe gestures can be added here
  }

  /**
   * Handle back button press
   * Returns true if event is handled, false to allow default behavior
   */
  handleBackPress() {
    if (!this.navigationRef) return false;
    
    try {
      const state = this.navigationRef.current?.getRootState();
      
      // If we're at the root of navigation stack, minimize app instead of closing
      if (state && state.index === 0) {
        if (Platform.OS === 'android') {
          const { BackHandler } = require('react-native');
          BackHandler.exitApp(); // Minimizes app to background
        }
        return true;
      }
      
      // Navigate back in stack
      if (this.navigationRef.current?.canGoBack()) {
        this.navigationRef.current.goBack();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error handling back press:', error);
      return false;
    }
  }

  /**
   * Setup deep linking for cross-task navigation
   */
  setupDeepLinking() {
    const prefix = Linking.createURL('/');
    
    const config = {
      screens: {
        Home: '',
        Dashboard: 'dashboard',
        TrainerMap: 'trainers',
        Profile: 'profile',
        Notifications: 'notifications',
        Payment: 'payment/:trainerId/:sessionType',
        TrainerDashboard: 'trainer/dashboard',
        Calendar: 'trainer/calendar',
        FriendRequests: 'friends',
        Settings: 'settings',
      },
    };

    // Handle initial URL when app is opened from notification or link
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle URL updates when app is already open
    const linkingListener = Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });
    
    this.deepLinkHandlers.push(linkingListener);
  }

  /**
   * Handle deep link navigation
   */
  handleDeepLink(url) {
    if (!url || !this.navigationRef) return;
    
    try {
      const { path, queryParams } = Linking.parse(url);
      
      // Map deep link paths to navigation routes
      const routeMap = {
        'dashboard': 'Dashboard',
        'trainers': 'TrainerMap',
        'profile': 'Profile',
        'notifications': 'Notifications',
        'payment': 'Payment',
        'trainer/dashboard': 'TrainerDashboard',
        'trainer/calendar': 'Calendar',
        'friends': 'FriendRequests',
        'settings': 'Settings',
      };
      
      const route = routeMap[path];
      if (route) {
        this.navigationRef.current?.navigate(route, queryParams);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  /**
   * Setup cross-task and cross-activity gestures
   */
  setupCrossTaskGestures() {
    // Register app state change handlers for cross-task behavior
    if (Platform.OS === 'android') {
      const { AppState } = require('react-native');
      
      AppState.addEventListener('change', (nextAppState) => {
        this.handleAppStateChange(nextAppState);
      });
    }
  }

  /**
   * Handle app state changes (foreground/background)
   */
  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      // App came to foreground - restore session
      this.restoreSession();
    } else if (nextAppState === 'background') {
      // App went to background - save session
      this.saveSession();
    }
  }

  /**
   * Save current session state for cross-task resumption
   */
  async saveSession() {
    try {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const state = this.navigationRef.current?.getRootState();
      
      if (state) {
        await AsyncStorage.setItem('navigation_state', JSON.stringify(state));
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Restore session state after app returns from background
   */
  async restoreSession() {
    try {
      const { AsyncStorage } = require('@react-native-async-storage/async-storage');
      const savedState = await AsyncStorage.getItem('navigation_state');
      
      if (savedState && this.navigationRef.current) {
        const state = JSON.parse(savedState);
        // Optionally restore navigation state
        // this.navigationRef.current.reset(state);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }

  /**
   * Navigate to home screen
   */
  navigateHome() {
    if (this.navigationRef.current) {
      this.navigationRef.current.navigate('Home');
    }
  }

  /**
   * Navigate back
   */
  navigateBack() {
    if (this.navigationRef.current?.canGoBack()) {
      this.navigationRef.current.goBack();
    }
  }

  /**
   * Reset navigation to root
   */
  resetToRoot() {
    if (this.navigationRef.current) {
      this.navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }

  /**
   * Enable/disable gesture handling
   */
  setGestureEnabled(enabled) {
    this.gestureEnabled = enabled;
  }

  /**
   * Cleanup gesture handlers
   */
  cleanup() {
    // Remove back handlers
    this.backHandlers.forEach(handler => {
      if (handler && handler.remove) {
        handler.remove();
      }
    });
    
    // Remove deep link handlers
    this.deepLinkHandlers.forEach(handler => {
      if (handler && handler.remove) {
        handler.remove();
      }
    });
    
    this.backHandlers = [];
    this.deepLinkHandlers = [];
    this.navigationRef = null;
  }
}

// Create singleton instance
const gestureManager = new MobileGestureManager();

export default gestureManager;

/**
 * Hook for using gesture manager in components
 */
export const useGestureManager = () => {
  const navigation = require('@react-navigation/native').useNavigation();
  
  React.useEffect(() => {
    gestureManager.navigationRef = { current: navigation };
    
    return () => {
      // Cleanup if needed
    };
  }, [navigation]);
  
  return {
    navigateHome: () => gestureManager.navigateHome(),
    navigateBack: () => gestureManager.navigateBack(),
    resetToRoot: () => gestureManager.resetToRoot(),
    setGestureEnabled: (enabled) => gestureManager.setGestureEnabled(enabled),
  };
};
