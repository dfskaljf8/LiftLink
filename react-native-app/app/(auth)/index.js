/**
 * LiftLink - Auth Screen
 * Futuristic 2050 UI - Simplified for stability
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
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
} from '../../src/components/FuturisticUI';
import axios from 'axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  }, [response]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleGoogleSuccess = async (authentication) => {
    setGoogleLoading(true);
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        { headers: { Authorization: `Bearer ${authentication.accessToken}` } }
      );
      const googleUser = await userInfoResponse.json();
      
      try {
        const checkResponse = await axios.post(`${API_URL}/check-user`, { email: googleUser.email });
        
        if (checkResponse.data.exists) {
          const { age_verified, user_id } = checkResponse.data;
          
          if (!age_verified) {
            router.push({
              pathname: '/(auth)/document-verification',
              params: { email: googleUser.email, userId: user_id, name: googleUser.name, fromGoogle: 'true' }
            });
            return;
          }
          
          const loginResponse = await axios.post(`${API_URL}/login`, { email: googleUser.email });
          const userData = { ...loginResponse.data.user, token: loginResponse.data.access_token };
          await setUser(userData);
          router.replace('/(tabs)');
        } else {
          router.push({
            pathname: '/(auth)/ai-onboarding',
            params: { email: googleUser.email, name: googleUser.name, fromGoogle: 'true' },
          });
        }
      } catch (checkErr) {
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { email: googleUser.email, name: googleUser.name, fromGoogle: 'true' },
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not complete Google sign-in');
    } finally {
      setGoogleLoading(false);
    }
  };

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
      const checkResponse = await axios.post(`${API_URL}/check-user`, { email: cleanEmail });

      if (checkResponse.data.exists) {
        const { age_verified, user_id } = checkResponse.data;
        
        if (!age_verified) {
          router.push({
            pathname: '/(auth)/document-verification',
            params: { email: cleanEmail, userId: user_id }
          });
          return;
        }
        
        const loginResponse = await axios.post(`${API_URL}/login`, { email: cleanEmail });
        const userData = { ...loginResponse.data.user, token: loginResponse.data.access_token };
        await setUser(userData);
        router.replace('/(tabs)');
      } else {
        router.push({ pathname: '/(auth)/ai-onboarding', params: { email: cleanEmail } });
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.detail || 'Something went wrong');
      } else {
        setError('Network error. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!request) {
      Alert.alert('Not Configured', 'Google Sign-In requires OAuth credentials. Please use email.');
      return;
    }
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      setGoogleLoading(false);
      Alert.alert('Error', 'Could not start Google sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <ParticleField count={12} />
      
      <View style={styles.glowOrb1} pointerEvents="none" />
      <View style={styles.glowOrb2} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Mascot */}
            {!keyboardVisible && (
              <View style={styles.mascotContainer}>
                <FutureMascot size={130} />
              </View>
            )}

            {/* Title */}
            <View style={styles.titleSection}>
              <View style={styles.logoRow}>
                <FutureLogo size={40} />
                <Text style={styles.title}>LiftLink</Text>
              </View>
              <Text style={styles.tagline}>THE FUTURE OF FITNESS</Text>
              <Text style={styles.subtagline}>Powered by AI • Built for You</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
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

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

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
                    onChangeText={(text) => { setEmail(text); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onSubmitEditing={handleEmailContinue}
                    returnKeyType="go"
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <FutureButton
                title="Continue"
                onPress={handleEmailContinue}
                loading={loading}
                variant="primary"
                size="large"
              />
            </View>

            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text>
              {' & '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 36,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginLeft: 12,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: FUTURE_COLORS.primary,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },
  subtagline: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 6,
  },
  card: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
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
