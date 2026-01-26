/**
 * AI Onboarding Screen - Futuristic 2050 Design
 * Cyber-organic conversational onboarding
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, FutureLogo, FutureButton, ParticleField } from '../../src/components/FuturisticUI';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// AI Avatar Component
const AIAvatar = ({ size = 40 }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, pulseStyle]}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Defs>
          <LinearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
          </LinearGradient>
        </Defs>
        <Circle cx="20" cy="20" r="18" fill={FUTURE_COLORS.surface} stroke="url(#avatarGrad)" strokeWidth="2" />
        <Circle cx="14" cy="16" r="3" fill={FUTURE_COLORS.primary} />
        <Circle cx="26" cy="16" r="3" fill={FUTURE_COLORS.primary} />
        <Path d="M13 26 Q20 32 27 26" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
};

export default function AIOnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useApp();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [step, setStep] = useState(0);

  const questions = [
    { 
      id: 1, 
      text: `Hey${params.name ? ` ${params.name.split(' ')[0]}` : ''}! Welcome to LiftLink.\n\nI'm your AI fitness companion. Let me personalize your experience.\n\nFirst, what brings you here?`,
      options: ['Find a trainer', 'Become a trainer']
    },
    { 
      id: 2, 
      text: "Excellent choice! What's your primary fitness objective?",
      options: ['Lose weight', 'Build muscle', 'Stay healthy', 'Athletic performance']
    },
    { 
      id: 3, 
      text: "And where would you place your current fitness level?",
      options: ['Beginner', 'Intermediate', 'Advanced']
    },
  ];

  useEffect(() => {
    startOnboarding();
  }, []);

  const startOnboarding = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/ai/onboarding/start`, {
        user_name: params.name || params.email?.split('@')[0] || 'Friend',
      });

      setSessionId(response.data.session_id);
      setMessages([{
        id: '1',
        text: response.data.message,
        isAI: true,
      }]);
    } catch (error) {
      console.log('AI onboarding not available, using simple flow');
      setMessages([{
        id: '1',
        text: questions[0].text,
        isAI: true,
        options: questions[0].options,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (option) => {
    const userMessage = {
      id: Date.now().toString(),
      text: option,
      isAI: false,
    };
    setMessages(prev => [...prev, userMessage]);
    
    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: questions[nextStep].text,
          isAI: true,
          options: questions[nextStep].options,
        }]);
      }, 600);
    } else {
      setComplete(true);
      
      const userData = {
        role: messages[1]?.text === 'Become a trainer' ? 'trainer' : 'fitness_enthusiast',
        goal: messages[3]?.text || 'Stay healthy',
        experience: option,
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "Perfect! Initializing your profile...",
          isAI: true,
        }]);
        handleComplete(userData);
      }, 600);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/onboarding/respond`, {
        session_id: sessionId,
        response: userMessage.text,
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.message,
        isAI: true,
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.data.complete) {
        setComplete(true);
        setTimeout(() => handleComplete(response.data.collected_data), 1500);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Let's continue! Tell me about your fitness goals.",
        isAI: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (collectedData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        email: params.email,
        name: params.name || params.email?.split('@')[0],
        role: collectedData?.role === 'Become a trainer' ? 'trainer' : 'fitness_enthusiast',
        fitness_goals: [collectedData?.goal?.toLowerCase().replace(/ /g, '_') || 'general_fitness'],
        experience_level: collectedData?.experience?.toLowerCase() || 'beginner',
      });

      console.log('User registered:', response.data);

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "Account created!\n\nOne final step - we need to verify you're 18+ to comply with fitness industry regulations.\n\nThis is a quick one-time process.",
          isAI: true,
        }]);

        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/document-verification',
            params: { 
              email: params.email,
              userId: response.data?.id,
              name: params.name,
            }
          });
        }, 2500);
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        try {
          const checkRes = await axios.post(`${API_URL}/check-user`, { email: params.email });
          router.replace({
            pathname: '/(auth)/document-verification',
            params: { 
              email: params.email,
              userId: checkRes.data.user_id,
            }
          });
        } catch (e) {
          router.replace({
            pathname: '/(auth)/document-verification',
            params: { email: params.email }
          });
        }
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: `Something went wrong: ${error.response?.data?.detail || 'Please try again.'}`,
          isAI: true,
        }]);
        setComplete(false);
      }
    }
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.messageBubble,
        item.isAI ? styles.aiMessage : styles.userMessage,
      ]}
    >
      {item.isAI && (
        <View style={styles.aiAvatarContainer}>
          <AIAvatar size={32} />
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.isAI ? styles.aiMessageContent : styles.userMessageContent,
      ]}>
        <Text style={[
          styles.messageText,
          { color: item.isAI ? FUTURE_COLORS.text : FUTURE_COLORS.void }
        ]}>
          {item.text}
        </Text>
        
        {item.options && !complete && (
          <View style={styles.optionsContainer}>
            {item.options.map((option, i) => (
              <TouchableOpacity
                key={i}
                style={styles.optionButton}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ParticleField count={8} />
      
      <View style={styles.glowOrb} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <FutureLogo size={32} />
            <Text style={styles.headerTitle}>LiftLink AI</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Typing Indicator */}
        {loading && (
          <View style={styles.typingIndicator}>
            <AIAvatar size={24} />
            <View style={styles.typingDots}>
              <View style={[styles.dot, { animationDelay: '0ms' }]} />
              <View style={[styles.dot, { animationDelay: '200ms' }]} />
              <View style={[styles.dot, { animationDelay: '400ms' }]} />
            </View>
          </View>
        )}

        {/* Input */}
        {sessionId && !complete && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your response..."
                placeholderTextColor={FUTURE_COLORS.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || loading}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path d="M22 2L11 13" stroke={FUTURE_COLORS.void} strokeWidth="2" strokeLinecap="round" />
                  <Path d="M22 2L15 22L11 13L2 9L22 2Z" fill={FUTURE_COLORS.void} />
                </Svg>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* Complete indicator */}
        {complete && (
          <View style={styles.completeIndicator}>
            <ActivityIndicator size="small" color={FUTURE_COLORS.primary} />
            <Text style={styles.completeText}>Setting up your profile...</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  glowOrb: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.05,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FUTURE_COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FUTURE_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: FUTURE_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '90%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiAvatarContainer: {
    marginRight: 10,
    marginTop: 4,
  },
  messageContent: {
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
  },
  aiMessageContent: {
    backgroundColor: FUTURE_COLORS.surface,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    borderTopLeftRadius: 4,
  },
  userMessageContent: {
    backgroundColor: FUTURE_COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: FUTURE_COLORS.elevated,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.primary,
  },
  optionText: {
    color: FUTURE_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FUTURE_COLORS.primary,
    marginHorizontal: 3,
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: FUTURE_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: FUTURE_COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: FUTURE_COLORS.text,
    backgroundColor: FUTURE_COLORS.elevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FUTURE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  completeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: FUTURE_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: FUTURE_COLORS.border,
  },
  completeText: {
    color: FUTURE_COLORS.primary,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
