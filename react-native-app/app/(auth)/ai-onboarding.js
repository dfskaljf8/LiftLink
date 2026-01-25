/**
 * AI Onboarding Screen
 * Conversational onboarding with AI
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
import { useApp } from '../../src/context/AppContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function AIOnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, colors } = useApp();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    startOnboarding();
  }, []);

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai/onboarding/start`, {
        user_name: params.email?.split('@')[0] || 'Friend',
      });

      setSessionId(response.data.session_id);
      setMessages([
        {
          id: '1',
          text: response.data.message,
          isAI: true,
        },
      ]);
    } catch (error) {
      console.error('Start onboarding error:', error);
      setMessages([
        {
          id: '1',
          text: "Hey there! 👋 I'm excited to help you on your fitness journey. What brings you to LiftLink today?",
          isAI: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isAI: false,
    };

    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, aiMessage]);

      if (response.data.complete) {
        setComplete(true);
        // Create user and login
        setTimeout(() => handleComplete(response.data.collected_data), 2000);
      }
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I had a little hiccup there. Let's continue - tell me more about your fitness goals!",
        isAI: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (collectedData) => {
    try {
      // Register user
      const response = await axios.post(`${API_URL}/register`, {
        email: params.email,
        name: params.email?.split('@')[0],
        role: collectedData?.role || 'trainee',
        fitness_goals: collectedData?.goals,
        experience_level: collectedData?.experience,
      });

      setUser(response.data);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
      // Try to login anyway
      try {
        const loginResponse = await axios.post(`${API_URL}/login`, {
          email: params.email,
        });
        setUser(loginResponse.data);
        router.replace('/(tabs)');
      } catch (loginError) {
        router.replace('/(auth)');
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.isAI
          ? [styles.aiMessage, { backgroundColor: colors.surface }]
          : [styles.userMessage, { backgroundColor: colors.primary }],
      ]}
    >
      <Text
        style={[
          styles.messageText,
          { color: item.isAI ? colors.text : '#fff' },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Onboarding</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.typingText, { color: colors.textSecondary }]}>
            AI is typing...
          </Text>
        </View>
      )}

      {!complete && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Type your response..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: colors.primary },
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

      {complete && (
        <View style={[styles.completeContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.completeText, { color: colors.text }]}>
            🎉 All set! Setting up your account...
          </Text>
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 12 }} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  completeContainer: {
    padding: 24,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
