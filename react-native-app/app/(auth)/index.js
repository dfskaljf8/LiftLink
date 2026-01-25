/**
 * LiftLink - Auth Screen
 * Fixed authentication flow with proper error handling
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { LiftLinkMascot, FloatingDots } from '../../src/components/CustomIllustrations';
import { Button } from '../../src/components/AnimatedButton';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function AuthScreen() {
  const router = useRouter();
  const { setUser } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animations
  const mascotScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    mascotScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));

    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mascotScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Checking user:', email);
      
      // Step 1: Check if user exists
      const checkResponse = await axios.post(`${API_URL}/check-user`, { 
        email: email.toLowerCase().trim() 
      });
      
      console.log('Check response:', checkResponse.data);

      if (checkResponse.data.exists) {
        // User exists - try to login
        try {
          const loginResponse = await axios.post(`${API_URL}/login`, { 
            email: email.toLowerCase().trim() 
          });
          
          console.log('Login response:', loginResponse.data);
          
          // Success! Store user and navigate
          const userData = {
            ...loginResponse.data.user,
            token: loginResponse.data.access_token,
          };
          
          await setUser(userData);
          router.replace('/(tabs)');
          
        } catch (loginError) {
          console.log('Login error:', loginError.response?.data);
          
          // Handle specific error cases
          const errorMessage = loginError.response?.data?.detail || 'Login failed';
          
          if (errorMessage.includes('Age verification required')) {
            // User needs to verify age
            Alert.alert(
              'Age Verification Required',
              'You need to verify your age (18+) before you can use LiftLink. Would you like to verify now?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Verify Now', 
                  onPress: () => router.push({
                    pathname: '/(auth)/document-verification',
                    params: { email: email.toLowerCase().trim(), userId: checkResponse.data.user_id }
                  })
                }
              ]
            );
          } else if (errorMessage.includes('certification verification required')) {
            // Trainer needs certification
            Alert.alert(
              'Certification Required',
              'Trainers must verify their fitness certification before accessing the app.',
              [
                { text: 'OK' },
                { 
                  text: 'Verify Now', 
                  onPress: () => router.push({
                    pathname: '/(auth)/document-verification',
                    params: { email: email.toLowerCase().trim(), userId: checkResponse.data.user_id, type: 'certification' }
                  })
                }
              ]
            );
          } else {
            setError(errorMessage);
          }
        }
      } else {
        // New user - go to onboarding
        console.log('New user, going to onboarding');
        router.push({
          pathname: '/(auth)/ai-onboarding',
          params: { email: email.toLowerCase().trim() },
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      if (err.response) {
        // Server responded with error
        const errorDetail = err.response.data?.detail || 'Something went wrong';
        setError(errorDetail);
      } else if (err.request) {
        // Network error
        setError('Network error. Please check your connection.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google Sign-In will be available in the next update!');
  };

  // For testing - create a test user that's pre-verified
  const handleTestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create test user endpoint
      const response = await axios.post(`${API_URL}/create-test-user`, {
        email: `test_${Date.now()}@liftlink.app`,
        name: 'Test User',
        role: 'trainee',
        fitness_goals: ['weight_loss'],
        experience_level: 'beginner'
      });
      
      console.log('Test user created:', response.data);
      
      const userData = {
        ...response.data.user,
        token: response.data.access_token,
      };
      
      await setUser(userData);
      router.replace('/(tabs)');
      
    } catch (err) {
      console.error('Test login error:', err);
      setError('Could not create test user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FloatingDots count={5} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Mascot */}
          {!keyboardVisible && (
            <Animated.View style={[styles.mascotContainer, mascotStyle]}>
              <LiftLinkMascot size={140} />
            </Animated.View>
          )}

          {/* Content */}
          <Animated.View style={[styles.content, contentStyle]}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>LiftLink</Text>
              <Text style={styles.subtitle}>Your personal fitness journey starts here</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.inputWrapper,
                  focused && styles.inputWrapperFocused,
                  error && styles.inputWrapperError,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor="#64748b"
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
                title="Continue"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button */}
              <Button
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                variant="secondary"
                size="large"
                icon={<Text style={styles.googleIcon}>G</Text>}
              />
              
              {/* Test Login Button - For Development */}
              <Button
                title="Quick Test Login"
                onPress={handleTestLogin}
                variant="ghost"
                size="small"
                style={{ marginTop: 12 }}
              />
            </View>

            {/* Footer */}
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms & Privacy Policy
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
    backgroundColor: '#0f172a',
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
    marginBottom: 24,
  },
  content: {
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
  },
  inputWrapperFocused: {
    borderColor: '#6366f1',
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
