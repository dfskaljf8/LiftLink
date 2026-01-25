/**
 * LiftLink - Auth Screen
 * Dark theme with lime green accents - Google OAuth implemented
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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { 
  LiftLinkLogo, 
  LiftLinkMascot, 
  EmailIcon, 
  GoogleIcon,
  AppleIcon,
  COLORS 
} from '../../src/components/CustomIllustrations';
import { Button, SocialButton } from '../../src/components/AnimatedButton';
import axios from 'axios';

// Required for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

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
    // You'll need to create these in Google Cloud Console
    // For now, we'll use Expo's proxy for development
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
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
  const logoScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Handle Google sign-in success
  const handleGoogleSuccess = async (authentication) => {
    setGoogleLoading(true);
    try {
      // Get user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
      );
      const googleUser = await userInfoResponse.json();
      
      console.log('Google user:', googleUser);

      // Send to our backend for registration/login
      const response = await axios.post(`${API_URL}/auth/google`, {
        email: googleUser.email,
        name: googleUser.name,
        google_id: googleUser.id,
        picture: googleUser.picture,
      });

      const userData = {
        ...response.data.user,
        token: response.data.access_token,
      };

      await setUser(userData);
      router.replace('/(tabs)');
      
    } catch (err) {
      console.error('Google auth error:', err);
      
      // If backend doesn't have google auth endpoint, try regular flow
      if (err.response?.status === 404) {
        // Fallback: Check if user exists and login/register
        try {
          const checkResponse = await axios.post(`${API_URL}/check-user`, { 
            email: googleUser?.email 
          });
          
          if (checkResponse.data.exists) {
            const loginResponse = await axios.post(`${API_URL}/login`, { 
              email: googleUser?.email 
            });
            const userData = {
              ...loginResponse.data.user,
              token: loginResponse.data.access_token,
            };
            await setUser(userData);
            router.replace('/(tabs)');
          } else {
            // New user from Google - go to onboarding
            router.push({
              pathname: '/(auth)/ai-onboarding',
              params: { 
                email: googleUser?.email,
                name: googleUser?.name,
                fromGoogle: 'true'
              },
            });
          }
        } catch (fallbackErr) {
          console.error('Fallback auth error:', fallbackErr);
          Alert.alert('Error', 'Unable to complete sign-in. Please try again.');
        }
      } else {
        Alert.alert('Error', err.response?.data?.detail || 'Google sign-in failed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle email login
  const handleEmailLogin = async () => {
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

    try {
      const checkResponse = await axios.post(`${API_URL}/check-user`, { 
        email: email.toLowerCase().trim() 
      });

      if (checkResponse.data.exists) {
        try {
          const loginResponse = await axios.post(`${API_URL}/login`, { 
            email: email.toLowerCase().trim() 
          });
          
          const userData = {
            ...loginResponse.data.user,
            token: loginResponse.data.access_token,
          };
          
          await setUser(userData);
          router.replace('/(tabs)');
          
        } catch (loginError) {
          const errorMessage = loginError.response?.data?.detail || 'Login failed';
          
          if (errorMessage.includes('Age verification required')) {
            Alert.alert(
              'Age Verification Required',
              'You need to verify your age (18+) before using LiftLink.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Verify Now', 
                  onPress: () => router.push({
                    pathname: '/(auth)/document-verification',
                    params: { email: email.toLowerCase().trim() }
                  })
                }
              ]
            );
          } else {
            setError(errorMessage);
          }
        }
      } else {
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { email: email.toLowerCase().trim() },
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google button press
  const handleGoogleSignIn = async () => {
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
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Logo & Mascot */}
          {!keyboardVisible && (
            <Animated.View style={[styles.logoSection, logoStyle]}>
              <LiftLinkMascot size={120} />
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Title */}
            <View style={styles.titleSection}>
              <View style={styles.logoRow}>
                <LiftLinkLogo size={40} />
                <Text style={styles.title}>LiftLink</Text>
              </View>
              <Text style={styles.tagline}>Beginners to Believers</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Social Login Buttons */}
              <SocialButton
                title="Continue with Google"
                icon={<GoogleIcon size={22} />}
                onPress={handleGoogleSignIn}
                loading={googleLoading}
              />

              <SocialButton
                title="Continue with Apple"
                icon={<AppleIcon size={22} />}
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
                    <EmailIcon size={20} color={focused ? COLORS.primary : '#666'} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#666"
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
                  />
                </View>
                {error ? (
                  <Animated.Text entering={FadeIn} style={styles.errorText}>
                    {error}
                  </Animated.Text>
                ) : null}
              </View>

              {/* Continue Button */}
              <Button
                title="Continue with Email"
                onPress={handleEmailLogin}
                loading={loading}
                variant="primary"
                size="large"
              />
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text>
              {' '}and{' '}
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
    backgroundColor: COLORS.background,
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
    marginBottom: 20,
  },
  content: {
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 12,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
  },
});
