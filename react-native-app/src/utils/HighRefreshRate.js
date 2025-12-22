/**
 * LiftLink High Refresh Rate (120fps) Support
 * 
 * This module provides utilities for optimizing animations and UI updates
 * for high refresh rate displays (90Hz, 120Hz ProMotion)
 * 
 * Supported devices:
 * - iOS: iPhone 13 Pro, 14 Pro, 15 Pro, 16 Pro (ProMotion 120Hz)
 * - Android: Most flagship devices with 90Hz/120Hz/144Hz displays
 */

import { Platform, Dimensions, NativeModules } from 'react-native';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

// Constants for frame rates
const FRAME_RATES = {
  STANDARD: 60,
  HIGH: 90,
  PROMOTION: 120,
  ULTRA: 144,
};

// Optimal animation durations for different frame rates (in ms)
const ANIMATION_DURATIONS = {
  INSTANT: 100,
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
};

/**
 * Hook to detect if the device supports high refresh rate
 * Returns the estimated refresh rate of the display
 */
export const useHighRefreshRate = () => {
  const [refreshRate, setRefreshRate] = useState(FRAME_RATES.STANDARD);
  const [isHighRefreshRate, setIsHighRefreshRate] = useState(false);

  useEffect(() => {
    const detectRefreshRate = async () => {
      try {
        if (Platform.OS === 'ios') {
          // iOS 15+ on iPhone Pro models have ProMotion
          const { width, height } = Dimensions.get('window');
          const isProModel = width >= 390 || height >= 844; // Approximate Pro model detection
          
          // Check iOS version for ProMotion support
          const iosVersion = parseInt(Platform.Version, 10);
          if (iosVersion >= 15 && isProModel) {
            setRefreshRate(FRAME_RATES.PROMOTION);
            setIsHighRefreshRate(true);
          }
        } else if (Platform.OS === 'android') {
          // Android - most flagships support 90Hz+
          // This is a conservative estimate; actual detection requires native module
          const androidVersion = Platform.Version;
          if (androidVersion >= 30) { // Android 11+
            // Assume high refresh rate on modern Android
            setRefreshRate(FRAME_RATES.HIGH);
            setIsHighRefreshRate(true);
          }
        }
      } catch (error) {
        console.log('Could not detect refresh rate:', error);
      }
    };

    detectRefreshRate();
  }, []);

  return { refreshRate, isHighRefreshRate };
};

/**
 * Optimized animation configuration for high refresh rate displays
 * Provides smoother timing curves and durations
 */
export const getOptimizedAnimationConfig = (isHighRefreshRate) => {
  if (isHighRefreshRate) {
    return {
      // Faster spring animations for smoother feel
      spring: {
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      },
      // Optimized timing for 120fps
      timing: {
        duration: ANIMATION_DURATIONS.FAST,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      },
      // Quick fade for transitions
      fade: {
        duration: ANIMATION_DURATIONS.INSTANT,
        useNativeDriver: true,
      },
    };
  }

  // Standard 60fps configurations
  return {
    spring: {
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    },
    timing: {
      duration: ANIMATION_DURATIONS.NORMAL,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    },
    fade: {
      duration: ANIMATION_DURATIONS.FAST,
      useNativeDriver: true,
    },
  };
};

/**
 * Hook for creating optimized animated values
 * Automatically adjusts animation parameters based on refresh rate
 */
export const useOptimizedAnimation = (initialValue = 0) => {
  const { isHighRefreshRate } = useHighRefreshRate();
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const config = getOptimizedAnimationConfig(isHighRefreshRate);

  const animateSpring = useCallback(
    (toValue, customConfig = {}) => {
      return Animated.spring(animatedValue, {
        toValue,
        ...config.spring,
        ...customConfig,
      });
    },
    [animatedValue, config.spring]
  );

  const animateTiming = useCallback(
    (toValue, customConfig = {}) => {
      return Animated.timing(animatedValue, {
        toValue,
        ...config.timing,
        ...customConfig,
      });
    },
    [animatedValue, config.timing]
  );

  const animateFade = useCallback(
    (toValue) => {
      return Animated.timing(animatedValue, {
        toValue,
        ...config.fade,
      });
    },
    [animatedValue, config.fade]
  );

  return {
    value: animatedValue,
    spring: animateSpring,
    timing: animateTiming,
    fade: animateFade,
    isHighRefreshRate,
  };
};

/**
 * Optimized scroll configuration for high refresh rate
 * Improves scroll momentum and deceleration
 */
export const getOptimizedScrollConfig = (isHighRefreshRate) => {
  if (isHighRefreshRate) {
    return {
      decelerationRate: 0.992, // Slightly faster deceleration for snappier feel
      scrollEventThrottle: 8, // More frequent scroll events (120fps = 8.33ms per frame)
      overScrollMode: 'always',
      bounces: true,
      bouncesZoom: true,
    };
  }

  return {
    decelerationRate: 0.985,
    scrollEventThrottle: 16, // Standard 60fps throttle
    overScrollMode: 'always',
    bounces: true,
  };
};

/**
 * Hook for optimized scroll view props
 */
export const useOptimizedScroll = () => {
  const { isHighRefreshRate } = useHighRefreshRate();
  return getOptimizedScrollConfig(isHighRefreshRate);
};

/**
 * Gesture response timing optimized for high refresh rate
 * Reduces perceived latency in touch responses
 */
export const getOptimizedGestureConfig = (isHighRefreshRate) => {
  if (isHighRefreshRate) {
    return {
      minDurationMs: 50, // Faster gesture recognition
      maxDeltaX: 10,
      maxDeltaY: 10,
      minVelocityX: 0.3,
      minVelocityY: 0.3,
    };
  }

  return {
    minDurationMs: 100,
    maxDeltaX: 15,
    maxDeltaY: 15,
    minVelocityX: 0.5,
    minVelocityY: 0.5,
  };
};

/**
 * Frame-time aware animation loop
 * Useful for custom animations that need precise timing
 */
export class HighFPSAnimationLoop {
  constructor(callback, targetFPS = FRAME_RATES.PROMOTION) {
    this.callback = callback;
    this.targetFPS = targetFPS;
    this.frameTime = 1000 / targetFPS;
    this.lastTime = 0;
    this.animationId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  loop = () => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= this.frameTime) {
      this.callback(deltaTime, currentTime);
      this.lastTime = currentTime - (deltaTime % this.frameTime);
    }

    this.animationId = requestAnimationFrame(this.loop);
  };
}

// Export constants
export { FRAME_RATES, ANIMATION_DURATIONS };

// Default export
export default {
  useHighRefreshRate,
  useOptimizedAnimation,
  useOptimizedScroll,
  getOptimizedAnimationConfig,
  getOptimizedScrollConfig,
  getOptimizedGestureConfig,
  HighFPSAnimationLoop,
  FRAME_RATES,
  ANIMATION_DURATIONS,
};
