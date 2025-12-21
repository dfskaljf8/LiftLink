import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * LiftLink Animations Service
 * Centralized animation components using Lottie
 */

// Animation sources
const animations = {
  checkinStreak: require('../animations/checkin-streak.json'),
  themeToggle: require('../animations/theme-toggle.json'),
  paymentProcessing: require('../animations/payment-processing.json'),
  loading: require('../animations/loading.json'),
  error: require('../animations/error.json'),
};

/**
 * Check-In Streak Animation
 * Use for: Streak counters, daily check-ins, achievements
 */
export const CheckInStreakAnimation = ({ size = 100, autoPlay = true, loop = true, style }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={animations.checkinStreak}
        autoPlay={autoPlay}
        loop={loop}
        style={styles.lottie}
      />
    </View>
  );
};

/**
 * Theme Toggle Animation
 * Use for: Dark/Light mode switch
 */
export const ThemeToggleAnimation = ({ 
  size = 60, 
  isDark = false, 
  onPress, 
  style 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      // Play forward for dark mode, backward for light mode
      if (isDark) {
        animationRef.current.play(0, 50); // First half
      } else {
        animationRef.current.play(50, 100); // Second half
      }
    }
  }, [isDark]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={animations.themeToggle}
        style={styles.lottie}
        loop={false}
      />
    </View>
  );
};

/**
 * Payment Processing Animation
 * Use for: Payment confirmation, secure transaction processing
 */
export const PaymentProcessingAnimation = ({ 
  size = 120, 
  autoPlay = true, 
  onAnimationFinish,
  style 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={animations.paymentProcessing}
        autoPlay={autoPlay}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottie}
      />
    </View>
  );
};

/**
 * Loading Animation
 * Use for: General loading states, data fetching
 */
export const LoadingAnimation = ({ size = 80, autoPlay = true, style }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={animations.loading}
        autoPlay={autoPlay}
        loop={true}
        style={styles.lottie}
      />
    </View>
  );
};

/**
 * Error Animation
 * Use for: Failed payments, unauthorized access, errors
 */
export const ErrorAnimation = ({ 
  size = 100, 
  autoPlay = true, 
  onAnimationFinish,
  style 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={animations.error}
        autoPlay={autoPlay}
        loop={false}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottie}
      />
    </View>
  );
};

/**
 * Generic Lottie Animation Component
 * Use for: Custom animations with full control
 */
export const LiftLinkAnimation = ({ 
  source, 
  size = 100, 
  autoPlay = true, 
  loop = true,
  onAnimationFinish,
  style 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (autoPlay && animationRef.current) {
      animationRef.current.play();
    }
  }, [autoPlay]);

  return (
    <View style={[styles.animationContainer, { width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        onAnimationFinish={onAnimationFinish}
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});

// Export all animations
export default {
  CheckInStreakAnimation,
  ThemeToggleAnimation,
  PaymentProcessingAnimation,
  LoadingAnimation,
  ErrorAnimation,
  LiftLinkAnimation,
};

// Export animation sources for direct use
export { animations };
