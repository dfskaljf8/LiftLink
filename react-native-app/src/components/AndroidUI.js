import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Android-optimized button component
export const AndroidButton = ({ 
  children, 
  onPress, 
  style, 
  rippleColor = 'rgba(255,255,255,0.3)',
  disabled = false,
  ...props 
}) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(rippleColor, false)}
        disabled={disabled}
        {...props}
      >
        <View style={[styles.androidButton, style, disabled && styles.disabledButton]}>
          {children}
        </View>
      </TouchableNativeFeedback>
    );
  }

  // Fallback for iOS
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.androidButton, style, disabled && styles.disabledButton]}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Android status bar wrapper
export const AndroidStatusBar = ({ backgroundColor = '#4A90E2', barStyle = 'light-content' }) => {
  if (Platform.OS === 'android') {
    return (
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={barStyle}
        translucent={false}
        animated={true}
      />
    );
  }
  return null;
};

// Android safe area wrapper (for devices with navigation bars)
export const AndroidSafeArea = ({ children, style }) => {
  const androidStyles = Platform.OS === 'android' ? {
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: 20, // Space for Android navigation bar
  } : {};

  return (
    <View style={[styles.androidSafeArea, androidStyles, style]}>
      {children}
    </View>
  );
};

// Android card component with elevation
export const AndroidCard = ({ children, style, elevation = 4 }) => {
  const cardStyle = Platform.OS === 'android' 
    ? { elevation } 
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      };

  return (
    <View style={[styles.androidCard, cardStyle, style]}>
      {children}
    </View>
  );
};

// Android floating action button
export const AndroidFAB = ({ 
  onPress, 
  icon, 
  style, 
  backgroundColor = '#4A90E2',
  size = 56 
}) => {
  const fabStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    ...(Platform.OS === 'android' ? { elevation: 6 } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    })
  };

  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('rgba(255,255,255,0.3)', true)}
      >
        <View style={[styles.androidFAB, fabStyle, style]}>
          {icon}
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.androidFAB, fabStyle, style]}
      activeOpacity={0.8}
    >
      {icon}
    </TouchableOpacity>
  );
};

// Android app bar component
export const AndroidAppBar = ({ 
  title, 
  backgroundColor = '#4A90E2', 
  titleColor = 'white',
  leftAction,
  rightActions = [],
  style 
}) => {
  return (
    <View>
      {Platform.OS === 'android' && (
        <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      )}
      <View style={[styles.androidAppBar, { backgroundColor }, style]}>
        <View style={styles.appBarContent}>
          {leftAction && (
            <View style={styles.appBarLeft}>
              {leftAction}
            </View>
          )}
          
          <View style={styles.appBarTitle}>
            {title}
          </View>
          
          {rightActions.length > 0 && (
            <View style={styles.appBarRight}>
              {rightActions.map((action, index) => (
                <View key={index} style={styles.appBarAction}>
                  {action}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Android material design colors
export const AndroidColors = {
  primary: '#4A90E2',
  primaryDark: '#2471A3',
  accent: '#FF6B35',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  text: {
    primary: 'rgba(0,0,0,0.87)',
    secondary: 'rgba(0,0,0,0.54)',
    disabled: 'rgba(0,0,0,0.38)',
  },
  divider: 'rgba(0,0,0,0.12)',
};

// Android-specific responsive breakpoints
export const AndroidBreakpoints = {
  compact: { maxWidth: 599 },
  medium: { minWidth: 600, maxWidth: 839 },
  expanded: { minWidth: 840 },
};

// Get screen size category for Android
export const getAndroidScreenSize = () => {
  if (width < 600) return 'compact';
  if (width < 840) return 'medium';
  return 'expanded';
};

// Android-specific animations
export const AndroidAnimations = {
  // Standard Android motion curves
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  },
  
  // Standard duration values
  duration: {
    short: 150,
    medium: 300,
    long: 500,
  },
};

const styles = StyleSheet.create({
  androidButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  disabledButton: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    opacity: 0.6,
  },
  
  androidSafeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  androidCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    margin: 8,
  },
  
  androidFAB: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  androidAppBar: {
    height: 56,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  appBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  
  appBarLeft: {
    marginRight: 16,
  },
  
  appBarTitle: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  appBarRight: {
    flexDirection: 'row',
  },
  
  appBarAction: {
    marginLeft: 16,
  },
});

export default {
  AndroidButton,
  AndroidStatusBar,
  AndroidSafeArea,
  AndroidCard,
  AndroidFAB,
  AndroidAppBar,
  AndroidColors,
  AndroidBreakpoints,
  getAndroidScreenSize,
  AndroidAnimations,
};