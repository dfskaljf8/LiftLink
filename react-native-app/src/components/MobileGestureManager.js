import React from 'react';
import { Platform, BackHandler, AppState, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * MobileGestureManager - Handles back-to-home, cross-task, and cross-activity gestures
 */
class MobileGestureManager {
  constructor() {
    this.navigationRef = null;
    this.backHandlers = [];
    this.gestureEnabled = true;
  }

  initialize(navigationRef) {
    this.navigationRef = navigationRef;
    this.setupBackGestures();
    this.setupDeepLinking();
  }

  setupBackGestures() {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return this.handleBackPress();
      });
      this.backHandlers.push(backHandler);
    }
  }

  handleBackPress() {
    if (!this.navigationRef) return false;
    try {
      if (this.navigationRef.current?.canGoBack()) {
        this.navigationRef.current.goBack();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Back press error:', error);
      return false;
    }
  }

  setupDeepLinking() {
    Linking.getInitialURL().then((url) => {
      if (url) this.handleDeepLink(url);
    });

    Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url);
    });
  }

  handleDeepLink(url) {
    if (!url || !this.navigationRef) return;
    try {
      const route = this.parseDeepLink(url);
      if (route) {
        this.navigationRef.current?.navigate(route.name, route.params);
      }
    } catch (error) {
      console.error('Deep link error:', error);
    }
  }

  parseDeepLink(url) {
    const routes = {
      'dashboard': { name: 'Dashboard', params: {} },
      'trainers': { name: 'TrainerMap', params: {} },
      'notifications': { name: 'Notifications', params: {} },
      'profile': { name: 'Profile', params: {} },
    };
    const path = url.split('://')[1]?.split('?')[0];
    return routes[path];
  }

  navigateHome() {
    this.navigationRef.current?.navigate('Home');
  }

  navigateBack() {
    if (this.navigationRef.current?.canGoBack()) {
      this.navigationRef.current.goBack();
    }
  }

  cleanup() {
    this.backHandlers.forEach(h => h?.remove());
    this.backHandlers = [];
  }
}

const gestureManager = new MobileGestureManager();
export default gestureManager;

export const useGestureManager = () => {
  const navigation = require('@react-navigation/native').useNavigation();
  
  React.useEffect(() => {
    gestureManager.navigationRef = { current: navigation };
  }, [navigation]);
  
  return {
    navigateHome: () => gestureManager.navigateHome(),
    navigateBack: () => gestureManager.navigateBack(),
  };
};
