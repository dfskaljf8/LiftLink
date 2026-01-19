/**
 * AI Onboarding Screen - Conversational User Onboarding
 * AI guides new users through setup via natural conversation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIOnboardingScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [collectedData, setCollectedData] = useState(null);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const userName = route.params?.userName || 'there';

  useEffect(() => {
    startOnboarding();
  }, []);

  useEffect(() => {
    if (isComplete) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isComplete]);

  const startOnboarding = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await axios.post(
        `${API}/ai/onboarding/start`,
        { user_name: userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionId(response.data.session_id);
      
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString(),
      };
      
      setMessages([aiMessage]);
    } catch (error) {
      console.error('Onboarding start error:', error);
      // Fallback message
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hey ${userName}! 👋 I'm excited to help you on your fitness journey. What's the main thing you're hoping to achieve?`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await axios.post(
        `${API}/ai/onboarding/respond`,
        {
          session_id: sessionId,
          response: inputText.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.data.complete) {
        setIsComplete(true);
        setCollectedData(response.data.collected_data);
      }
    } catch (error) {
      console.error('Onboarding response error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I didn't quite catch that. Could you tell me more?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const finishOnboarding = () => {
    // Navigate to main app or trainer matching
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { onboardingComplete: true } }],
    });
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
      ]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Icon name="psychology" size={20} color="#4f46e5" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser && styles.userText,
          ]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderCompletionCard = () => (
    <Animated.View style={[styles.completionCard, { opacity: fadeAnim }]}>
      <View style={styles.completionIcon}>
        <Icon name="check-circle" size={48} color="#22c55e" />
      </View>
      <Text style={styles.completionTitle}>All Set! 🎉</Text>
      <Text style={styles.completionText}>
        We've got everything we need to find you the perfect trainer match.
      </Text>

      {collectedData && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Profile Summary</Text>
          
          {collectedData.fitness_goal && (
            <View style={styles.summaryItem}>
              <Icon name="flag" size={18} color="#6b7280" />
              <Text style={styles.summaryText}>
                Goal: {collectedData.fitness_goal.replace('_', ' ')}
              </Text>
            </View>
          )}
          
          {collectedData.experience_level && (
            <View style={styles.summaryItem}>
              <Icon name="trending-up" size={18} color="#6b7280" />
              <Text style={styles.summaryText}>
                Level: {collectedData.experience_level}
              </Text>
            </View>
          )}
          
          {collectedData.days_per_week && (
            <View style={styles.summaryItem}>
              <Icon name="calendar-today" size={18} color="#6b7280" />
              <Text style={styles.summaryText}>
                {collectedData.days_per_week} days/week
              </Text>
            </View>
          )}
          
          {collectedData.preferred_time && (
            <View style={styles.summaryItem}>
              <Icon name="schedule" size={18} color="#6b7280" />
              <Text style={styles.summaryText}>
                Prefers: {collectedData.preferred_time}
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={finishOnboarding}>
        <Text style={styles.continueButtonText}>Find My Trainer</Text>
        <Icon name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Icon name="psychology" size={28} color="#4f46e5" />
          </View>
          <View>
            <Text style={styles.headerTitle}>LiftLink AI</Text>
            <Text style={styles.headerSubtitle}>Let's get you set up</Text>
          </View>
        </View>
        <View style={styles.progressDots}>
          <View style={[styles.dot, messages.length >= 1 && styles.dotActive]} />
          <View style={[styles.dot, messages.length >= 3 && styles.dotActive]} />
          <View style={[styles.dot, messages.length >= 5 && styles.dotActive]} />
          <View style={[styles.dot, isComplete && styles.dotActive]} />
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isComplete ? renderCompletionCard : null}
        />

        {/* Typing Indicator */}
        {isLoading && !isComplete && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotDelay1]} />
            <View style={[styles.typingDot, styles.typingDotDelay2]} />
          </View>
        )}

        {/* Input Area */}
        {!isComplete && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your answer..."
              placeholderTextColor="#6b7280"
              multiline
              maxLength={500}
              editable={!isLoading}
              onSubmitEditing={sendResponse}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendResponse}
              disabled={!inputText.trim() || isLoading}
            >
              <Icon
                name="send"
                size={22}
                color={inputText.trim() && !isLoading ? "#fff" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  dotActive: {
    backgroundColor: '#4f46e5',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  assistantBubble: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  userText: {
    color: '#f9fafb',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    opacity: 0.4,
  },
  typingDotDelay1: {
    opacity: 0.6,
  },
  typingDotDelay2: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: '#f9fafb',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  completionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  completionIcon: {
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#d1d5db',
    textTransform: 'capitalize',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AIOnboardingScreen;
