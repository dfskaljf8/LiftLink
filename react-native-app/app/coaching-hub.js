/**
 * Coaching Hub Screen
 * Automation and workflow management for trainers
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';

export default function CoachingHubScreen() {
  const router = useRouter();
  const { colors } = useApp();

  const FeatureCard = ({ icon, title, description, color, onPress }) => (
    <TouchableOpacity
      style={[styles.featureCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Coaching Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="rocket" size={48} color={colors.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>Automate Your Coaching</Text>
          <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
            Let AI help you create programs, send reminders, and manage your clients.
          </Text>
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>

        <FeatureCard
          icon="document-text-outline"
          title="Program Generator"
          description="AI creates personalized workout programs"
          color="#4f46e5"
          onPress={() => {}}
        />

        <FeatureCard
          icon="notifications-outline"
          title="Smart Reminders"
          description="Automated check-ins and session reminders"
          color="#f59e0b"
          onPress={() => {}}
        />

        <FeatureCard
          icon="analytics-outline"
          title="Progress Tracking"
          description="AI analyzes client progress and suggests adjustments"
          color="#10b981"
          onPress={() => {}}
        />

        <FeatureCard
          icon="chatbubbles-outline"
          title="Client Communication"
          description="AI-powered messaging templates"
          color="#8b5cf6"
          onPress={() => {}}
        />

        <FeatureCard
          icon="calendar-outline"
          title="Schedule Optimization"
          description="Smart scheduling based on client availability"
          color="#ef4444"
          onPress={() => {}}
        />
      </ScrollView>
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 4,
  },
});
