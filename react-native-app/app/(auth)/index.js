/**
 * LiftLink - Auth Screen
 * Futuristic 2050 UI - Buttery smooth & cyber-organic
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import {
  FUTURE_COLORS,
  FutureLogo,
  FutureMascot,
  FutureButton,
  FutureSocialButton,
  FutureEmailIcon,
  FutureGoogleIcon,
  FutureAppleIcon,
  ParticleField,
  GlowRing,
} from '../../src/components/FuturisticUI';
import axios from 'axios';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Required for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  }, [response]);

  // Keyboard listeners
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Animations
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const contentOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(600, withSpring(0, { damping: 15, stiffness: 100 }));
    
    glowOpacity.value = withDelay(1000, withTiming(1, { duration: 1000 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Handle Google sign-in success
  const handleGoogleSuccess = async (authentication) => {
    setGoogleLoading(true);
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
      );
      const googleUser = await userInfoResponse.json();
      
      console.log('Google user:', googleUser);

      try {
        const checkResponse = await axios.post(`${API_URL}/check-user`, { 
          email: googleUser.email 
        });
        
        if (checkResponse.data.exists) {
          const { age_verified, user_id } = checkResponse.data;
          
          if (!age_verified) {
            router.push({
              pathname: '/(auth)/document-verification',
              params: { 
                email: googleUser.email,
                userId: user_id,
                name: googleUser.name,
                fromGoogle: 'true'
              }
            });
            return;
          }
          
          try {
            const loginResponse = await axios.post(`${API_URL}/login`, { 
              email: googleUser.email 
            });
            
            const userData = {
              ...loginResponse.data.user,
              token: loginResponse.data.access_token,
            };
            
            await setUser(userData);
            router.replace('/(tabs)');
          } catch (loginErr) {
            const errorMsg = loginErr.response?.data?.detail || '';
            if (errorMsg.includes('Age verification')) {
              router.push({
                pathname: '/(auth)/document-verification',
                params: { 
                  email: googleUser.email,
                  userId: user_id,
                  name: googleUser.name,
                  fromGoogle: 'true'
                }
              });
            } else {
              Alert.alert('Error', errorMsg || 'Could not sign in');
            }
          }
        } else {
          router.push({
            pathname: '/(auth)/ai-onboarding',
            params: { 
              email: googleUser.email,
              name: googleUser.name,
              picture: googleUser.picture,
              fromGoogle: 'true'
            },
          });
        }
      } catch (checkErr) {
        console.error('Check user error:', checkErr);
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { 
            email: googleUser.email,
            name: googleUser.name,
            fromGoogle: 'true'
          },
        });
      }
    } catch (err) {
      console.error('Google auth error:', err);
      Alert.alert('Error', 'Could not complete Google sign-in');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle email login/signup
  const handleEmailContinue = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    const cleanEmail = email.toLowerCase().trim();

    try {
      console.log('Checking user:', cleanEmail);
      const checkResponse = await axios.post(`${API_URL}/check-user`, { 
        email: cleanEmail 
      });
      
      console.log('Check response:', checkResponse.data);

      if (checkResponse.data.exists) {
        const { age_verified, user_id } = checkResponse.data;
        
        if (!age_verified) {
          console.log('User exists but not age verified, going to verification...');
          router.push({
            pathname: '/(auth)/document-verification',
            params: { 
              email: cleanEmail,
              userId: user_id,
            }
          });
          return;
        }
        
        console.log('User exists and verified, attempting login...');
        
        try {
          const loginResponse = await axios.post(`${API_URL}/login`, { 
            email: cleanEmail 
          });
          
          console.log('Login successful!');
          
          const userData = {
            ...loginResponse.data.user,
            token: loginResponse.data.access_token,
          };
          
          await setUser(userData);
          router.replace('/(tabs)');
          
        } catch (loginError) {
          console.log('Login error:', loginError.response?.data);
          
          const errorMessage = loginError.response?.data?.detail || 'Login failed';
          
          if (errorMessage.toLowerCase().includes('age verification')) {
            router.push({
              pathname: '/(auth)/document-verification',
              params: { 
                email: cleanEmail,
                userId: user_id,
              }
            });
          } else if (errorMessage.toLowerCase().includes('certification')) {
            Alert.alert(
              'Certification Required',
              'Trainers must verify their fitness certification.',
              [{ text: 'OK' }]
            );
          } else {
            setError(errorMessage);
          }
        }
      } else {
        console.log('New user, going to onboarding...');
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { email: cleanEmail },
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      if (err.response) {
        setError(err.response.data?.detail || 'Something went wrong');
      } else if (err.request) {
        setError('Network error. Check your connection.');
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google button press
  const handleGoogleSignIn = async () => {
    if (!request) {
      Alert.alert(
        'Google Sign-In Not Configured',
        'Google Sign-In requires OAuth credentials. Please use email to continue.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      console.error('Google prompt error:', err);
      setGoogleLoading(false);
      Alert.alert('Error', 'Could not start Google sign-in');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Effects */}
      <ParticleField count={15} />
      
      {/* Ambient Glow */}
      <Animated.View style={[styles.ambientGlow, glowStyle]} pointerEvents="none">
        <View style={styles.glowOrb1} />
        <View style={styles.glowOrb2} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Logo & Mascot Section */}
          {!keyboardVisible && (
            <Animated.View style={[styles.logoSection, logoStyle]}>
              <View style={styles.mascotContainer}>
                <FutureMascot size={140} />
              </View>
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Title */}
            <View style={styles.titleSection}>
              <View style={styles.logoRow}>
                <FutureLogo size={44} />
                <Text style={styles.title}>LiftLink</Text>
              </View>
              <Text style={styles.tagline}>The Future of Fitness</Text>
              <Text style={styles.subtagline}>Powered by AI • Built for You</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Social Login Buttons */}
              <FutureSocialButton
                title="Continue with Google"
                icon={<FutureGoogleIcon size={22} />}
                onPress={handleGoogleSignIn}
                loading={googleLoading}
              />

              <FutureSocialButton
                title="Continue with Apple"
                icon={<FutureAppleIcon size={22} />}
                onPress={() => Alert.alert('Coming Soon', 'Apple Sign-In will be available soon!')}
                style={{ marginTop: 12 }}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  focused && styles.inputWrapperFocused,
                  error && styles.inputWrapperError,
                ]}>
                  <View style={styles.inputIcon}>
                    <FutureEmailIcon size={20} color={focused ? FUTURE_COLORS.primary : FUTURE_COLORS.textMuted} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={FUTURE_COLORS.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={handleEmailContinue}
                    returnKeyType="go"
                  />
                </View>
                {error ? (
                  <Animated.Text entering={FadeIn} style={styles.errorText}>
                    {error}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Continue Button */}
              <FutureButton
                title="Continue"
                onPress={handleEmailContinue}
                loading={loading}
                variant="primary"
                size="large"
              />
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text>
              {' & '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.08,
  },
  glowOrb2: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: FUTURE_COLORS.accent,
    opacity: 0.06,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginLeft: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: FUTURE_COLORS.primary,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtagline: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    // Subtle glow effect
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: FUTURE_COLORS.border,
  },
  dividerText: {
    color: FUTURE_COLORS.textMuted,
    paddingHorizontal: 16,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FUTURE_COLORS.elevated,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FUTURE_COLORS.border,
  },
  inputWrapperFocused: {
    borderColor: FUTURE_COLORS.primary,
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  inputWrapperError: {
    borderColor: FUTURE_COLORS.error,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
    color: FUTURE_COLORS.text,
    letterSpacing: 0.3,
  },
  errorText: {
    color: FUTURE_COLORS.error,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  footerText: {
    color: FUTURE_COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  footerLink: {
    color: FUTURE_COLORS.primary,
  },
});
