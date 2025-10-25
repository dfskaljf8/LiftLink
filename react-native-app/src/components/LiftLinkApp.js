import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  Platform,
  AppState,
  Alert,
  Linking
} from 'react-native';

// Import all providers and components
import AuthProvider, { useAuth } from './AuthContext';
import NotificationProvider, { useNotifications } from './NotificationManager';
import SecurityProvider, { useSecurity } from './SecurityProvider';
import UIProvider, { useUI } from './UIEnhancer';

// Import existing app structure
import EnhancedApp from './EnhancedApp';

// Global notification toast integration
const AppWithGlobalFeatures = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { connected, notifications } = useNotifications();
  const { securityStatus } = useSecurity();
  const { showToast, setStatusBarStyle } = useUI();
  const [appState, setAppState] = useState(AppState.currentState);

  // Set up global toast for live notifications
  useEffect(() => {
    // Make showToast available globally for NotificationManager
    global.showGlobalToast = showToast;
    
    return () => {
      delete global.showGlobalToast;
    };
  }, [showToast]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Refresh data when app becomes active
        if (isAuthenticated()) {
          // Trigger data refresh
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState, isAuthenticated]);

  // Handle deep linking
  useEffect(() => {
    const handleURL = (url) => {
      console.log('Deep link received:', url);
      // Handle friend requests, notifications, etc.
      if (url.includes('/friend-request/')) {
        const requestId = url.split('/friend-request/')[1];
        // Navigate to friend request
      } else if (url.includes('/notification/')) {
        const notificationId = url.split('/notification/')[1];
        // Navigate to notification
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleURL(url);
      }
    });

    // Handle URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleURL(url);
    });

    return () => subscription?.remove();
  }, []);

  // Set status bar style based on authentication state
  useEffect(() => {
    if (isAuthenticated()) {
      setStatusBarStyle('dark-content', 'white');
    } else {
      setStatusBarStyle('light-content', '#4A90E2');
    }
  }, [isAuthenticated, setStatusBarStyle]);

  // Show connection status alerts for important connectivity issues
  useEffect(() => {
    let alertTimeout;
    
    if (isAuthenticated() && !connected) {
      // Show alert after 10 seconds of being disconnected
      alertTimeout = setTimeout(() => {
        Alert.alert(
          'Connection Issue',
          'Live notifications are temporarily unavailable. Check your internet connection.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Retry', onPress: () => window.location.reload() }
          ]
        );
      }, 10000);
    }

    return () => {
      if (alertTimeout) {
        clearTimeout(alertTimeout);
      }
    };
  }, [connected, isAuthenticated]);

  // Security monitoring
  useEffect(() => {
    if (!securityStatus.sessionValid && isAuthenticated()) {
      Alert.alert(
        'Security Alert',
        'Your session may have been compromised. Please log in again for security.',
        [
          { text: 'OK', style: 'destructive' }
        ],
        { cancelable: false }
      );
    }
  }, [securityStatus.sessionValid, isAuthenticated]);

  return (
    <>
      <StatusBar 
        barStyle={isAuthenticated() ? "dark-content" : "light-content"}
        backgroundColor={isAuthenticated() ? "white" : "#4A90E2"}
        translucent={Platform.OS === 'android'}
      />
      <EnhancedApp />
    </>
  );
};

// Main LiftLink App with all providers
const LiftLinkApp = () => {
  return (
    <UIProvider>
      <AuthProvider>
        <SecurityProvider>
          <NotificationProvider>
            <AppWithGlobalFeatures />
          </NotificationProvider>
        </SecurityProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export default LiftLinkApp;