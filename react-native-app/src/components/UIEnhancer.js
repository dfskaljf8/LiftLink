import React, { createContext, useContext, useState, useRef } from 'react';
import {
  View,
  Animated,
  Easing,
  Platform,
  Vibration,
  Dimensions,
  StatusBar
} from 'react-native';
import NotificationToast from './NotificationToast';
import { LoadingOverlay, ErrorOverlay, SuccessOverlay } from './LoadingOverlay';

const { width, height } = Dimensions.get('window');

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  // State for various UI elements
  const [loading, setLoading] = useState({ visible: false, message: '' });
  const [error, setError] = useState({ visible: false, message: '' });
  const [success, setSuccess] = useState({ visible: false, message: '' });
  const [toast, setToast] = useState({ visible: false, notification: null });

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Loading functions
  const showLoading = (message = 'Loading...') => {
    setLoading({ visible: true, message });
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setLoading({ visible: false, message: '' });
    });
  };

  // Error functions
  const showError = (message, options = {}) => {
    setError({ visible: true, message });
    
    // Haptic feedback on error
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 100]);
    }
    
    // Auto-hide after delay if specified
    if (options.autoHide) {
      setTimeout(() => {
        hideError();
      }, options.duration || 3000);
    }
  };

  const hideError = () => {
    setError({ visible: false, message: '' });
  };

  // Success functions
  const showSuccess = (message, autoHide = true, duration = 2000) => {
    setSuccess({ visible: true, message });
    
    // Haptic feedback on success
    if (Platform.OS === 'ios') {
      Vibration.vibrate(100);
    }
    
    if (autoHide) {
      setTimeout(() => {
        hideSuccess();
      }, duration);
    }
  };

  const hideSuccess = () => {
    setSuccess({ visible: false, message: '' });
  };

  // Toast notification functions
  const showToast = (notification, options = {}) => {
    setToast({ 
      visible: true, 
      notification: {
        ...notification,
        id: notification.id || Date.now().toString()
      }
    });
    
    // Gentle haptic feedback for notifications
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    }
  };

  const hideToast = () => {
    setToast({ visible: false, notification: null });
  };

  // Animation helpers
  const animatePress = (callback) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (callback) callback();
  };

  const animateSlideIn = (direction = 'left', callback) => {
    const startValue = direction === 'left' ? -width : width;
    slideAnim.setValue(startValue);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(callback);
  };

  const animateSlideOut = (direction = 'right', callback) => {
    const endValue = direction === 'left' ? -width : width;
    
    Animated.timing(slideAnim, {
      toValue: endValue,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(callback);
  };

  const animateFadeIn = (callback) => {
    fadeAnim.setValue(0);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  const animateFadeOut = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  // Enhanced button press with animation
  const enhancedPress = (onPress, haptic = true) => {
    return () => {
      if (haptic && Platform.OS === 'ios') {
        Vibration.vibrate(25);
      }
      
      animatePress(onPress);
    };
  };

  // Screen transition animations
  const screenTransition = {
    cardStyleInterpolator: ({ current, layouts }) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  };

  // Status bar management
  const setStatusBarStyle = (style = 'dark-content', backgroundColor = 'white') => {
    StatusBar.setBarStyle(style, true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor, true);
    }
  };

  // Context value
  const value = {
    // State
    loading: loading.visible,
    error: error.visible,
    success: success.visible,
    
    // Functions
    showLoading,
    hideLoading,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    showToast,
    hideToast,
    
    // Animations
    animatePress,
    animateSlideIn,
    animateSlideOut,
    animateFadeIn,
    animateFadeOut,
    enhancedPress,
    screenTransition,
    
    // Animation values
    scaleAnim,
    fadeAnim,
    slideAnim,
    
    // Utils
    setStatusBarStyle,
  };

  return (
    <UIContext.Provider value={value}>
      <Animated.View 
        style={{ 
          flex: 1,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        {children}
      </Animated.View>
      
      {/* Global UI Overlays */}
      <LoadingOverlay 
        visible={loading.visible} 
        message={loading.message} 
      />
      
      <ErrorOverlay 
        visible={error.visible} 
        message={error.message}
        onClose={hideError}
        onRetry={() => {
          hideError();
          // Retry logic can be passed via context if needed
        }}
      />
      
      <SuccessOverlay 
        visible={success.visible} 
        message={success.message}
        onHide={hideSuccess}
      />
      
      <NotificationToast
        visible={toast.visible}
        notification={toast.notification}
        onPress={(notification) => {
          hideToast();
          // Handle notification press - can be customized
          console.log('Notification pressed:', notification);
        }}
        onDismiss={hideToast}
      />
    </UIContext.Provider>
  );
};

// Enhanced components with animations
export const AnimatedButton = ({ children, onPress, style, ...props }) => {
  const { enhancedPress, scaleAnim } = useUI();
  
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={style}
        onPress={enhancedPress(onPress)}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AnimatedView = ({ children, style, ...props }) => {
  const { fadeAnim, slideAnim } = useUI();
  
  return (
    <Animated.View 
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default UIProvider;