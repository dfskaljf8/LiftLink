/**
 * LiftLink - Auth Screen
 * Cartoonish animated login with custom illustrations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { LiftLinkMascot, FloatingParticles, AnimatedDumbbell } from '../../src/components/CustomIllustrations';
import { CartoonButton } from '../../src/components/AnimatedButton';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animations
  const titleScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const mascotY = useSharedValue(50);
  const formY = useSharedValue(100);

  useEffect(() => {
    // Initial animations
    titleScale.value = withSpring(1, { damping: 12 });
    titleOpacity.value = withTiming(1, { duration: 800 });
    mascotY.value = withSpring(0, { damping: 15 });
    formY.value = withDelay(300, withSpring(0, { damping: 15 }));

    // Keyboard listeners
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formY.value }],
  }));

  const handleLogin = async () => {
    if (!email.includes('@')) {
      setError('Oops! That doesn\'t look like an email 😅');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const checkResponse = await axios.post(`${API_URL}/check-user`, { email });

      if (checkResponse.data.exists) {
        const response = await axios.post(`${API_URL}/login`, { email });
        setUser(response.data);
        router.replace('/(tabs)');
      } else {
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { email },
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection hiccup! Try again? 🔄');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('Google Sign-In coming soon! 🚀');
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#0f172a']}
      style={styles.container}
    >
      <FloatingParticles count={12} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Mascot - Hidden when keyboard visible */}
          {!keyboardVisible && (
            <Animated.View style={[styles.mascotContainer, mascotStyle]}>
              <LiftLinkMascot size={180} />
            </Animated.View>
          )}

          {/* Title */}
          <Animated.View style={[styles.titleContainer, titleStyle]}>
            <Text style={styles.title}>LiftLink</Text>
            <Text style={styles.subtitle}>Your AI Fitness Buddy!</Text>
          </Animated.View>

          {/* Floating dumbbells decoration */}
          <View style={styles.dumbbellLeft}>
            <AnimatedDumbbell size={50} />
          </View>
          <View style={styles.dumbbellRight}>
            <AnimatedDumbbell size={40} />
          </View>

          {/* Form */}
          <Animated.View style={[styles.formContainer, formStyle]}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconContainer}>
                <Text style={styles.inputIcon}>📧</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error ? (
              <Animated.View entering={FadeIn} style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <CartoonButton
              title="Let's Go!"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
              size="large"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <CartoonButton
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="secondary"
              size="medium"
              icon={<Text style={{ fontSize: 20 }}>🌐</Text>}
            />
          </Animated.View>

          {/* Bottom decoration */}
          <View style={styles.bottomDecoration}>
            <Text style={styles.bottomText}>
              Get fit. Stay motivated. Level up! 💪
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: '#6366f1',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: '#a5b4fc',
    marginTop: 8,
    fontWeight: '600',
  },
  dumbbellLeft: {
    position: 'absolute',
    top: '15%',
    left: 10,
    opacity: 0.6,
  },
  dumbbellRight: {
    position: 'absolute',
    top: '20%',
    right: 10,
    opacity: 0.6,
    transform: [{ rotate: '-15deg' }],
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  inputIconContainer: {
    width: 50,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#fca5a5',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomDecoration: {
    marginTop: 24,
    alignItems: 'center',
  },
  bottomText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
});
