import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, View, Text, Easing } from 'react-native';
import { colors, componentStyles, animations, glassmorphism, neumorphism, scale } from '../styles/EnhancedStyles';

/**
 * Enhanced UI Components with Micro-Animations
 * Matching LiftLink Design Vision
 */

// ANIMATED BUTTON WITH PRESS EFFECT
export const AnimatedButton = ({ 
  children, 
  onPress, 
  style, 
  variant = 'primary',
  disabled = false 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: animations.scale.press,
        ...animations.spring.normal,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: animations.timing.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...animations.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: animations.timing.normal,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const buttonStyle = variant === 'primary' 
    ? componentStyles.primaryButton 
    : variant === 'outline'
    ? componentStyles.outlineButton
    : componentStyles.glassButton;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          buttonStyle,
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// GLASS CARD WITH FADE-IN ANIMATION
export const GlassCard = ({ children, style, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.timing.slow,
        delay: delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: delay,
        ...animations.spring.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        componentStyles.glassCard,
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// NEUMORPHIC CARD WITH PRESS EFFECT
export const NeuCard = ({ children, style, onPress }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: animations.timing.fast,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: animations.timing.normal,
      useNativeDriver: false,
    }).start();
  };

  const shadowOpacity = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.1],
  });

  const shadowRadius = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 4],
  });

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      activeOpacity={0.9}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress}
    >
      <Animated.View
        style={[
          componentStyles.neuCard,
          style,
          {
            shadowOpacity,
            shadowRadius,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Component>
  );
};

// PULSING MENTOR MARKER (For Map)
export const PulsingMarker = ({ selected = false, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, []);

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        style={[
          componentStyles.mapMarker,
          {
            transform: [{ scale: selected ? pulseAnim : 1 }],
            shadowColor: colors.limeGreen,
            shadowOpacity: glowAnim,
            shadowRadius: 15,
            elevation: 10,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

// SHIMMER LOADING EFFECT
export const ShimmerCard = ({ width = '100%', height = 100, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: colors.darkCard,
          borderRadius: scale(15),
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(191, 255, 0, 0.1)',
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

// METRIC CARD WITH COUNT-UP ANIMATION
export const MetricCard = ({ label, value, unit, delay = 0 }) => {
  const countAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(countAnim, {
        toValue: 1,
        duration: animations.timing.verySlow,
        delay: delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.timing.slow,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        componentStyles.metricCard,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={componentStyles.metricValue}>
        {value} {unit}
      </Text>
      <Text style={componentStyles.metricLabel}>{label}</Text>
    </Animated.View>
  );
};

// FLOATING ACTION BUTTON
export const FloatingActionButton = ({ icon, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...animations.spring.bouncy,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: animations.timing.normal,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    onPress && onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[
          {
            width: scale(60),
            height: scale(60),
            borderRadius: scale(30),
            backgroundColor: colors.limeGreen,
            justifyContent: 'center',
            alignItems: 'center',
            ...neumorphism.raised,
            shadowColor: colors.limeGreen,
            shadowOpacity: 0.6,
            shadowRadius: 15,
            elevation: 10,
          },
          style,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
          },
        ]}
      >
        {icon}
      </Animated.View>
    </TouchableOpacity>
  );
};

// PROGRESS BAR WITH ANIMATION
export const AnimatedProgressBar = ({ progress = 0, height = 8, style }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: animations.timing.verySlow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        {
          width: '100%',
          height: scale(height),
          backgroundColor: colors.darkCard,
          borderRadius: scale(height / 2),
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          height: '100%',
          width,
          backgroundColor: colors.limeGreen,
          borderRadius: scale(height / 2),
          ...neumorphism.raised,
        }}
      />
    </View>
  );
};

// TOAST NOTIFICATION
export const ToastNotification = ({ message, visible = false, type = 'info' }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 20,
          ...animations.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: animations.timing.normal,
          useNativeDriver: true,
        }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: animations.timing.normal,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: animations.timing.normal,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const backgroundColor = 
    type === 'success' ? colors.success :
    type === 'error' ? colors.error :
    type === 'warning' ? colors.warning :
    colors.info;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: slideAnim,
        left: scale(20),
        right: scale(20),
        backgroundColor,
        borderRadius: scale(15),
        padding: scale(16),
        opacity: opacityAnim,
        zIndex: 1000,
        ...glassmorphism.strong,
      }}
    >
      <Text style={{ color: colors.textPrimary, fontSize: scale(14), fontWeight: '600' }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default {
  AnimatedButton,
  GlassCard,
  NeuCard,
  PulsingMarker,
  ShimmerCard,
  MetricCard,
  FloatingActionButton,
  AnimatedProgressBar,
  ToastNotification,
};
