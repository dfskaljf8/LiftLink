/**
 * AI Coach Chat Screen - GPT-5.2 Powered Fitness Coaching
 * Provides intelligent workout advice, nutrition guidance, and motivation
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [user, setUser] = useState(null);
  const flatListRef = useRef(null);

  // Suggested prompts for new users
  const suggestedPrompts = [
    "What's a good beginner workout routine?",
    "How can I improve my bench press form?",
    "What should I eat before a workout?",
    "How do I stay motivated to exercise?",
    "Can you create a 4-week strength program?",
  ];

  useEffect(() => {
    loadUser();
    loadConversationHistory();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('liftlink_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const savedConversation = await AsyncStorage.getItem('ai_conversation');
      if (savedConversation) {
        const data = JSON.parse(savedConversation);
        setMessages(data.messages || []);
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const saveConversation = async (newMessages, convId) => {
    try {
      await AsyncStorage.setItem('ai_conversation', JSON.stringify({
        messages: newMessages,
        conversationId: convId,
      }));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const sendMessage = async (messageText = inputText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await axios.post(
        `${API}/ai/chat`,
        {
          message: messageText.trim(),
          conversation_id: conversationId,
          context: user ? {
            user_goal: user.fitness_goals?.[0] || 'general fitness',
            experience_level: user.experience_level || 'beginner',
          } : {},
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp,
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setMessages(updatedMessages);
        setConversationId(response.data.conversation_id);
        saveConversation(updatedMessages, response.data.conversation_id);
      } else {
        // Show error message
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.error || "I'm having trouble responding right now. Please try again.",
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages([...newMessages, errorMessage]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      let errorText = "I'm having trouble connecting. Please check your internet and try again.";
      
      if (error.response?.status === 429) {
        errorText = "You've reached the AI request limit. Please wait an hour before asking more questions.";
      } else if (error.response?.status === 401) {
        errorText = "Please log in to use the AI coach.";
      }

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorText,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    setMessages([]);
    setConversationId(null);
    await AsyncStorage.removeItem('ai_conversation');
  };

  const renderMessage = useCallback(({ item }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage,
        item.isError && styles.errorMessage,
      ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Icon name="fitness-center" size={20} color="#10b981" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          item.isError && styles.errorBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText,
          ]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderSuggestedPrompts = () => (
    <View style={styles.suggestedContainer}>
      <Text style={styles.suggestedTitle}>
        💪 Ask your AI Coach anything!
      </Text>
      <Text style={styles.suggestedSubtitle}>
        Powered by GPT-5 • 20 questions/hour
      </Text>
      {suggestedPrompts.map((prompt, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestedPrompt}
          onPress={() => sendMessage(prompt)}
        >
          <Icon name="chat" size={16} color="#6366f1" />
          <Text style={styles.suggestedText}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#f9fafb" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Icon name="psychology" size={24} color="#10b981" />
          <Text style={styles.headerText}>AI Coach</Text>
        </View>
        <TouchableOpacity onPress={clearConversation} style={styles.clearButton}>
          <Icon name="refresh" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          renderSuggestedPrompts()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#10b981" />
            <Text style={styles.typingText}>AI Coach is thinking...</Text>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask your AI Coach..."
            placeholderTextColor="#6b7280"
            multiline
            maxLength={2000}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Icon 
              name="send" 
              size={22} 
              color={inputText.trim() && !isLoading ? "#f9fafb" : "#6b7280"} 
            />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  clearButton: {
    padding: 8,
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
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  errorMessage: {
    opacity: 0.8,
  },
  avatarContainer: {
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
    padding: 12,
    borderRadius: 16,
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
  errorBubble: {
    backgroundColor: '#7f1d1d',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#f9fafb',
  },
  assistantText: {
    color: '#d1d5db',
  },
  timestamp: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    backgroundColor: '#111827',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#f9fafb',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#374151',
  },
  suggestedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  suggestedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
    textAlign: 'center',
    marginBottom: 8,
  },
  suggestedSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestedPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  suggestedText: {
    fontSize: 15,
    color: '#d1d5db',
    flex: 1,
  },
});

export default AIChatScreen;
