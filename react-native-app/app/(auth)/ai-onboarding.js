/**
 * AI Onboarding Screen
 * Conversational onboarding with AI - then to age verification
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useApp } from '../../src/context/AppContext';
import { COLORS, LiftLinkLogo } from '../../src/components/CustomIllustrations';
import { Button } from '../../src/components/AnimatedButton';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

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

  // Simple onboarding questions (fallback if AI fails)
  const questions = [
    { 
      id: 1, 
      text: `Hey${params.name ? ` ${params.name.split(' ')[0]}` : ''}! 👋 Welcome to LiftLink!\n\nI'm here to personalize your fitness journey. First, are you looking to:`,
      options: ['Find a trainer', 'Become a trainer']
    },
    { 
      id: 2, 
      text: "Great choice! What's your main fitness goal?",
      options: ['Lose weight', 'Build muscle', 'Stay healthy', 'Train for sports']
    },
    { 
      id: 3, 
      text: "And what's your current fitness experience?",
      options: ['Beginner', 'Intermediate', 'Advanced']
    },
  ];

  useEffect(() => {
    startOnboarding();
  }, []);

  const startOnboarding = async () => {
    setLoading(true);
    
    // Try to start AI onboarding
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
      // Fallback to simple questions
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
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: option,
      isAI: false,
    };
    setMessages(prev => [...prev, userMessage]);
    
    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      // Show next question
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: questions[nextStep].text,
          isAI: true,
          options: questions[nextStep].options,
        }]);
      }, 500);
    } else {
      // Onboarding complete - create user
      setComplete(true);
      
      // Gather data
      const userData = {
        role: messages[1]?.text === 'Become a trainer' ? 'trainer' : 'trainee',
        goal: messages[3]?.text || 'Stay healthy',
        experience: option,
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "Perfect! 🎉 Let me set up your account...",
          isAI: true,
        }]);
        handleComplete(userData);
      }, 500);
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
      // Create user account - endpoint is /users not /register
      const response = await axios.post(`${API_URL}/users`, {
        email: params.email,
        name: params.name || params.email?.split('@')[0],
        role: collectedData?.role === 'Become a trainer' ? 'trainer' : 'fitness_enthusiast',
        fitness_goals: [collectedData?.goal?.toLowerCase().replace(/ /g, '_') || 'general_fitness'],
        experience_level: collectedData?.experience?.toLowerCase() || 'beginner',
      });

      console.log('User registered:', response.data);

      // Now go to age verification (user needs to verify before they can use the app)
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "Account created! 🎉\n\nOne last step - we need to verify your age (18+) to comply with fitness industry regulations.\n\nThis is a quick one-time verification.",
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
        }, 2000);
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      
      // If user already exists, go to age verification
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        // User exists but not verified - get their ID and go to verification
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
          text: `Hmm, something went wrong: ${error.response?.data?.detail || 'Please try again.'}`,
          isAI: true,
        }]);
        setComplete(false);
      }
    }
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.messageBubble,
        item.isAI ? styles.aiMessage : styles.userMessage,
      ]}
    >
      <Text style={[
        styles.messageText,
        { color: item.isAI ? COLORS.text : COLORS.background }
      ]}>
        {item.text}
      </Text>
      
      {/* Options */}
      {item.options && !complete && (
        <View style={styles.optionsContainer}>
          {item.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionButton}
              onPress={() => handleOptionSelect(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <LiftLinkLogo size={28} />
            <Text style={styles.headerTitle}>LiftLink</Text>
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
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}

        {/* Input (only show if using AI chat, not simple options) */}
        {sessionId && !complete && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your response..."
                placeholderTextColor="#666"
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
                <Text style={styles.sendButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* Complete indicator */}
        {complete && (
          <View style={styles.completeIndicator}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.completeText}>Setting up your account...</Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.text,
    fontSize: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  completeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completeText: {
    color: COLORS.primary,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
});
