/**
 * Animated Button - Duolingo-style
 * Clean, satisfying press feedback
 */

import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  fullWidth = true,
  style,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const variants = {
    primary: { bg: '#6366f1', shadow: '#4338ca', text: '#fff' },
    success: { bg: '#10b981', shadow: '#059669', text: '#fff' },
    danger: { bg: '#ef4444', shadow: '#dc2626', text: '#fff' },
    warning: { bg: '#f59e0b', shadow: '#d97706', text: '#fff' },
    secondary: { bg: '#1e293b', shadow: '#0f172a', text: '#fff' },
    ghost: { bg: 'transparent', shadow: 'transparent', text: '#6366f1' },
  };

  const sizes = {
    small: { height: 44, fontSize: 14, px: 16, shadowHeight: 3 },
    medium: { height: 52, fontSize: 16, px: 20, shadowHeight: 4 },
    large: { height: 56, fontSize: 17, px: 24, shadowHeight: 4 },
  };

  const v = variants[variant];
  const s = sizes[size];

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateY.value / s.shadowHeight,
  }));

  const handlePressIn = () => {
    translateY.value = withTiming(s.shadowHeight, { duration: 80 });
    scale.value = withTiming(0.98, { duration: 80 });
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const isDisabled = disabled || loading;

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
      {/* Shadow layer */}
      {variant !== 'ghost' && (
        <Animated.View
          style={[
            styles.shadow,
            {
              backgroundColor: v.shadow,
              height: s.height,
              bottom: -s.shadowHeight,
            },
            shadowStyle,
          ]}
        />
      )}

      {/* Button */}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? '#475569' : v.bg,
            height: s.height,
            paddingHorizontal: s.px,
            borderWidth: variant === 'ghost' ? 2 : 0,
            borderColor: variant === 'ghost' ? '#6366f1' : 'transparent',
          },
          buttonStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.text} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.iconWrapper}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {
                  fontSize: s.fontSize,
                  color: isDisabled ? '#94a3b8' : v.text,
                },
              ]}
            >
              {title}
            </Text>
          </View>
        )}
      </AnimatedPressable>
    </View>
  );
};

// Compact action button for cards
export const ActionButton = ({
  onPress,
  icon,
  label,
  color = '#6366f1',
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.actionButton, animStyle]}
    >
      <View style={[styles.actionIconBg, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      {label && <Text style={[styles.actionLabel, { color }]}>{label}</Text>}
    </AnimatedPressable>
  );
};

// Icon-only button
export const IconButton = ({
  onPress,
  icon,
  size = 48,
  backgroundColor = 'rgba(255,255,255,0.1)',
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      disabled={disabled}
      style={[
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
        animStyle,
      ]}
    >
      {icon}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 6,
  },
  fullWidth: {
    width: '100%',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 14,
  },
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
