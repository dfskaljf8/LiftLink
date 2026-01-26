/**
 * AI Chat Screen - Futuristic 2050 Design
 * Chat with AI fitness coach
 */

import React, { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField, FutureLogo } from '../src/components/FuturisticUI';
import { useApp } from '../src/context/AppContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// AI Avatar
const AIAvatar = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Defs>
      <LinearGradient id="aiAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Circle cx="16" cy="16" r="14" fill={FUTURE_COLORS.surface} stroke="url(#aiAvatarGrad)" strokeWidth="2" />
    <Circle cx="11" cy="13" r="2.5" fill={FUTURE_COLORS.primary} />
    <Circle cx="21" cy="13" r="2.5" fill={FUTURE_COLORS.primary} />
    <Path d="M10 20C12 23 20 23 22 20" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
  </Svg>
);

// Close Icon
const CloseIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M18 6L6 18M6 6L18 18" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Send Icon
const SendIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M22 2L11 13" stroke={FUTURE_COLORS.void} strokeWidth="2" strokeLinecap="round" />
    <Path d="M22 2L15 22L11 13L2 9L22 2Z" fill={FUTURE_COLORS.void} />
  </Svg>
);

export default function AIChatScreen() {
  const router = useRouter();
  const { user } = useApp();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hey! I'm your AI fitness coach. Ask me about workouts, nutrition, recovery, or anything fitness related. Let's crush your goals together!",
      isAI: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: userMessage.text,
        user_id: user?.id,
      });

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || response.data.message || "I'm here to help! What would you like to know?",
        isAI: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        isAI: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 30)}
      style={[
        styles.messageBubble,
        item.isAI ? styles.aiMessage : styles.userMessage,
      ]}
    >
      {item.isAI && (
        <View style={styles.aiAvatarContainer}>
          <AIAvatar size={28} />
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.isAI ? styles.aiMessageContent : styles.userMessageContent,
      ]}>
        <Text style={[styles.messageText, { color: item.isAI ? FUTURE_COLORS.text : FUTURE_COLORS.void }]}>
          {item.text}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ParticleField count={6} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <CloseIcon />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <FutureLogo size={28} />
            <Text style={styles.headerTitle}>AI Coach</Text>
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
              <View style={styles.dot} />
              <View style={[styles.dot, { marginLeft: 4 }]} />
              <View style={[styles.dot, { marginLeft: 4 }]} />
            </View>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor={FUTURE_COLORS.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
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
  closeButton: {
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
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginLeft: 10,
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
    marginBottom: 14,
    maxWidth: '88%',
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
    padding: 14,
    borderRadius: 18,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.6,
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
});
