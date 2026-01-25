/**
 * Animated Button Component
 * Cartoonish bouncy button with press animations
 */

import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const CartoonButton = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'danger'
  size = 'large', // 'small' | 'medium' | 'large'
  icon,
  style,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const variants = {
    primary: ['#6366f1', '#4f46e5'],
    secondary: ['#374151', '#1f2937'],
    success: ['#10b981', '#059669'],
    danger: ['#ef4444', '#dc2626'],
    warning: ['#f59e0b', '#d97706'],
  };

  const sizes = {
    small: { height: 44, fontSize: 14, paddingHorizontal: 16 },
    medium: { height: 52, fontSize: 16, paddingHorizontal: 24 },
    large: { height: 60, fontSize: 18, paddingHorizontal: 32 },
  };

  const currentSize = sizes[size];
  const colors = variants[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: 4 - translateY.value }],
    opacity: 1 - (translateY.value / 4),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    translateY.value = withTiming(4, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
    translateY.value = withTiming(0, { duration: 100 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[{ marginVertical: 8 }, style]}
    >
      {/* Shadow */}
      <Animated.View
        style={[
          styles.shadow,
          {
            height: currentSize.height,
            backgroundColor: colors[1],
          },
          shadowStyle,
        ]}
      />

      {/* Button */}
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={disabled ? ['#6b7280', '#4b5563'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            {
              height: currentSize.height,
              paddingHorizontal: currentSize.paddingHorizontal,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: currentSize.fontSize, marginLeft: icon ? 8 : 0 },
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </AnimatedPressable>
  );
};

export const CartoonIconButton = ({
  onPress,
  icon,
  size = 48,
  color = '#6366f1',
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={animatedStyle}
    >
      <LinearGradient
        colors={[color, color + 'cc']}
        style={[
          styles.iconButton,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {icon}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default CartoonButton;
