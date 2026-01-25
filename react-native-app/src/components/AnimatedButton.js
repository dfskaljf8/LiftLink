/**
 * Button Components - LiftLink Design System
 * Lime green accent buttons
 */

import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from './CustomIllustrations';

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
  const scale = useSharedValue(1);

  const variants = {
    primary: { bg: COLORS.primary, text: '#000', border: COLORS.primary },
    secondary: { bg: 'transparent', text: '#fff', border: '#333' },
    outline: { bg: 'transparent', text: COLORS.primary, border: COLORS.primary },
    ghost: { bg: 'transparent', text: COLORS.primary, border: 'transparent' },
    dark: { bg: '#1a1a1a', text: '#fff', border: '#333' },
  };

  const sizes = {
    small: { height: 44, fontSize: 14, px: 16 },
    medium: { height: 52, fontSize: 15, px: 20 },
    large: { height: 56, fontSize: 16, px: 24 },
  };

  const v = variants[variant];
  const s = sizes[size];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? '#333' : v.bg,
          height: s.height,
          paddingHorizontal: s.px,
          borderColor: isDisabled ? '#333' : v.border,
          borderWidth: variant === 'ghost' ? 0 : 2,
          opacity: isDisabled ? 0.6 : 1,
        },
        fullWidth && styles.fullWidth,
        animStyle,
        style,
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
              { fontSize: s.fontSize, color: isDisabled ? '#666' : v.text },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

export const IconButton = ({
  onPress,
  icon,
  size = 48,
  backgroundColor = '#1a1a1a',
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
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

export const SocialButton = ({
  onPress,
  title,
  icon,
  loading = false,
  style,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      disabled={loading}
      style={[styles.socialButton, animStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <View style={styles.socialIcon}>{icon}</View>
          <Text style={styles.socialText}>{title}</Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 10,
  },
  text: {
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
