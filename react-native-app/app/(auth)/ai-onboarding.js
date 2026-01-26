/**
 * AI Onboarding Screen - Futuristic 2050 Design
 * Simplified for stability
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
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useApp } from '../../src/context/AppContext';
import { FUTURE_COLORS, FutureLogo, ParticleField } from '../../src/components/FuturisticUI';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://swiftauth-1.preview.emergentagent.com/api';

// AI Avatar
const AIAvatar = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Defs>
      <LinearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Circle cx="16" cy="16" r="14" fill={FUTURE_COLORS.surface} stroke="url(#aiGrad)" strokeWidth="2" />
    <Circle cx="11" cy="13" r="2" fill={FUTURE_COLORS.primary} />
    <Circle cx="21" cy="13" r="2" fill={FUTURE_COLORS.primary} />
    <Path d="M10 20Q16 25 22 20" stroke={FUTURE_COLORS.accent} strokeWidth="2" fill="none" strokeLinecap="round" />
  </Svg>
);

export default function AIOnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useApp();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [step, setStep] = useState(0);

  const questions = [
    { id: 1, text: `Hey${params.name ? ` ${params.name.split(' ')[0]}` : ''}! Welcome to LiftLink.\n\nI'm your AI fitness companion. What brings you here?`, options: ['Find a trainer', 'Become a trainer'] },
    { id: 2, text: "What's your primary fitness goal?", options: ['Lose weight', 'Build muscle', 'Stay healthy', 'Athletic performance'] },
    { id: 3, text: "What's your current fitness level?", options: ['Beginner', 'Intermediate', 'Advanced'] },
  ];

  useEffect(() => {
    setMessages([{ id: '1', text: questions[0].text, isAI: true, options: questions[0].options }]);
  }, []);

  const handleOptionSelect = (option) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), text: option, isAI: false }]);
    
    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < questions.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: questions[nextStep].text, isAI: true, options: questions[nextStep].options }]);
      }, 500);
    } else {
      setComplete(true);
      const userData = {
        role: messages[1]?.text === 'Become a trainer' ? 'trainer' : 'fitness_enthusiast',
        goal: messages[3]?.text || 'Stay healthy',
        experience: option,
      };
      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Perfect! Creating your profile...", isAI: true }]);
        handleComplete(userData);
      }, 500);
    }
  };

  const handleComplete = async (collectedData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        email: params.email,
        name: params.name || params.email?.split('@')[0],
        role: collectedData?.role === 'trainer' ? 'trainer' : 'fitness_enthusiast',
        fitness_goals: [collectedData?.goal?.toLowerCase().replace(/ /g, '_') || 'general_fitness'],
        experience_level: collectedData?.experience?.toLowerCase() || 'beginner',
      });

      setTimeout(() => {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Account created!\n\nOne final step - we need to verify you're 18+. This is quick!", isAI: true }]);
        setTimeout(() => {
          router.replace({
            pathname: '/(auth)/document-verification',
            params: { email: params.email, userId: response.data?.id, name: params.name }
          });
        }, 2000);
      }, 800);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
        try {
          const checkRes = await axios.post(`${API_URL}/check-user`, { email: params.email });
          router.replace({ pathname: '/(auth)/document-verification', params: { email: params.email, userId: checkRes.data.user_id } });
        } catch (e) {
          router.replace({ pathname: '/(auth)/document-verification', params: { email: params.email } });
        }
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: `Error: ${error.response?.data?.detail || 'Please try again.'}`, isAI: true }]);
        setComplete(false);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.isAI ? styles.aiMessage : styles.userMessage]}>
      {item.isAI && <View style={styles.aiAvatar}><AIAvatar size={28} /></View>}
      <View style={[styles.messageContent, item.isAI ? styles.aiContent : styles.userContent]}>
        <Text style={[styles.messageText, { color: item.isAI ? FUTURE_COLORS.text : FUTURE_COLORS.void }]}>{item.text}</Text>
        {item.options && !complete && (
          <View style={styles.optionsContainer}>
            {item.options.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.optionButton} onPress={() => handleOptionSelect(opt)}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ParticleField count={6} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24"><Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" /></Svg>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <FutureLogo size={28} />
            <Text style={styles.headerTitle}>LiftLink AI</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

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
  container: { flex: 1, backgroundColor: FUTURE_COLORS.void },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: FUTURE_COLORS.border },
  backButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: FUTURE_COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: FUTURE_COLORS.border },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: FUTURE_COLORS.text, fontSize: 18, fontWeight: '700', marginLeft: 10 },
  placeholder: { width: 44 },
  messagesList: { padding: 16, paddingBottom: 100 },
  messageBubble: { flexDirection: 'row', marginBottom: 16, maxWidth: '90%' },
  aiMessage: { alignSelf: 'flex-start' },
  userMessage: { alignSelf: 'flex-end' },
  aiAvatar: { marginRight: 10, marginTop: 4 },
  messageContent: { padding: 16, borderRadius: 20, maxWidth: '85%' },
  aiContent: { backgroundColor: FUTURE_COLORS.surface, borderWidth: 1, borderColor: FUTURE_COLORS.border, borderTopLeftRadius: 4 },
  userContent: { backgroundColor: FUTURE_COLORS.primary, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  optionsContainer: { marginTop: 16 },
  optionButton: { backgroundColor: FUTURE_COLORS.elevated, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: FUTURE_COLORS.primary },
  optionText: { color: FUTURE_COLORS.primary, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  completeIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, backgroundColor: FUTURE_COLORS.surface, borderTopWidth: 1, borderTopColor: FUTURE_COLORS.border },
  completeText: { color: FUTURE_COLORS.primary, marginLeft: 12, fontSize: 14, fontWeight: '600' },
});
