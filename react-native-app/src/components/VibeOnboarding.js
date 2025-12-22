/**
 * Vibe Onboarding Screen
 * Choose coaching style: Dog Mode | Soft Grind | Easy Restart
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = 'https://vibe-workout.preview.emergentagent.com';

const VIBE_OPTIONS = [
  {
    id: 'dog_mode',
    name: 'Dog Mode',
    emoji: '🔥',
    tagline: 'No excuses. Maximum intensity.',
    description: 'For those who want to be pushed hard. Frequent check-ins, high expectations, and zero fluff.',
    traits: ['Intense coaching', 'Daily accountability', 'No-nonsense feedback'],
    color: '#ef4444',
    gradient: ['#dc2626', '#ef4444']
  },
  {
    id: 'soft_grind',
    name: 'Soft Grind',
    emoji: '💪',
    tagline: 'Consistent progress. Sustainable results.',
    description: 'Balanced approach that pushes you while respecting your limits. The sweet spot for most.',
    traits: ['Encouraging tone', 'Flexible scheduling', 'Progress-focused'],
    color: '#3b82f6',
    gradient: ['#2563eb', '#3b82f6']
  },
  {
    id: 'easy_restart',
    name: 'Easy Restart',
    emoji: '🌱',
    tagline: 'Gentle beginnings. Lasting change.',
    description: 'Perfect if you\'re getting back into fitness or building habits from scratch. Every small win counts.',
    traits: ['Compassionate coaching', 'Celebrating small wins', 'Low pressure'],
    color: '#10b981',
    gradient: ['#059669', '#10b981']
  }
];

const GOAL_OPTIONS = [
  { id: 'weight_loss', label: 'Lose Weight', icon: 'trending-down' },
  { id: 'muscle_building', label: 'Build Muscle', icon: 'fitness-center' },
  { id: 'general_fitness', label: 'Get Fit', icon: 'directions-run' },
  { id: 'sport_training', label: 'Sport Performance', icon: 'sports' },
  { id: 'wellness', label: 'Wellness & Health', icon: 'spa' }
];

const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to working out' },
  { id: 'intermediate', label: 'Intermediate', desc: '6+ months experience' },
  { id: 'advanced', label: 'Advanced', desc: '2+ years consistent' }
];

const DAY_OPTIONS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const VibeOnboarding = ({ onComplete, userId }) => {
  const [step, setStep] = useState(1);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [sessionDuration, setSessionDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 4;

  const toggleDay = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleComplete = async () => {
    if (!selectedVibe || !selectedGoal || !selectedExperience || selectedDays.length === 0) {
      setError('Please complete all selections');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/api/onboarding/vibe`, {
        user_id: userId,
        vibe_mode: selectedVibe,
        primary_goal: selectedGoal,
        experience_level: selectedExperience,
        available_days: selectedDays,
        session_duration: sessionDuration,
        equipment: ['bodyweight'], // Default, can be expanded later
        obstacles: null
      });

      if (response.data.success) {
        // Save vibe preference locally
        await AsyncStorage.setItem('user_vibe', selectedVibe);
        await AsyncStorage.setItem('onboarding_complete', 'true');
        
        onComplete?.(response.data);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.detail || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderVibeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Vibe</Text>
      <Text style={styles.stepSubtitle}>How do you want to be coached?</Text>

      {VIBE_OPTIONS.map((vibe) => (
        <TouchableOpacity
          key={vibe.id}
          style={[
            styles.vibeCard,
            selectedVibe === vibe.id && { borderColor: vibe.color, borderWidth: 2 }
          ]}
          onPress={() => setSelectedVibe(vibe.id)}
          activeOpacity={0.8}
        >
          <View style={styles.vibeHeader}>
            <Text style={styles.vibeEmoji}>{vibe.emoji}</Text>
            <View style={styles.vibeHeaderText}>
              <Text style={styles.vibeName}>{vibe.name}</Text>
              <Text style={styles.vibeTagline}>{vibe.tagline}</Text>
            </View>
            {selectedVibe === vibe.id && (
              <Icon name="check-circle" size={24} color={vibe.color} />
            )}
          </View>
          <Text style={styles.vibeDescription}>{vibe.description}</Text>
          <View style={styles.traitsContainer}>
            {vibe.traits.map((trait, idx) => (
              <View key={idx} style={[styles.traitBadge, { backgroundColor: vibe.color + '20' }]}>
                <Text style={[styles.traitText, { color: vibe.color }]}>{trait}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGoalSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What's Your Goal?</Text>
      <Text style={styles.stepSubtitle}>We'll tailor everything to help you get there</Text>

      <View style={styles.goalsGrid}>
        {GOAL_OPTIONS.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalCard,
              selectedGoal === goal.id && styles.goalCardSelected
            ]}
            onPress={() => setSelectedGoal(goal.id)}
            activeOpacity={0.8}
          >
            <Icon 
              name={goal.icon} 
              size={32} 
              color={selectedGoal === goal.id ? '#3b82f6' : '#9ca3af'} 
            />
            <Text style={[
              styles.goalLabel,
              selectedGoal === goal.id && styles.goalLabelSelected
            ]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExperienceSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Experience Level</Text>
      <Text style={styles.stepSubtitle}>This helps us set the right difficulty</Text>

      {EXPERIENCE_OPTIONS.map((exp) => (
        <TouchableOpacity
          key={exp.id}
          style={[
            styles.experienceCard,
            selectedExperience === exp.id && styles.experienceCardSelected
          ]}
          onPress={() => setSelectedExperience(exp.id)}
          activeOpacity={0.8}
        >
          <View style={styles.experienceContent}>
            <Text style={[
              styles.experienceLabel,
              selectedExperience === exp.id && styles.experienceLabelSelected
            ]}>
              {exp.label}
            </Text>
            <Text style={styles.experienceDesc}>{exp.desc}</Text>
          </View>
          {selectedExperience === exp.id && (
            <Icon name="check-circle" size={24} color="#3b82f6" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScheduleSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Schedule</Text>
      <Text style={styles.stepSubtitle}>Which days can you train?</Text>

      <View style={styles.daysContainer}>
        {DAY_OPTIONS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays.includes(day) && styles.dayButtonSelected
            ]}
            onPress={() => toggleDay(day)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.dayText,
              selectedDays.includes(day) && styles.dayTextSelected
            ]}>
              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.durationLabel}>Session Duration</Text>
      <View style={styles.durationContainer}>
        {[30, 45, 60, 90].map((mins) => (
          <TouchableOpacity
            key={mins}
            style={[
              styles.durationButton,
              sessionDuration === mins && styles.durationButtonSelected
            ]}
            onPress={() => setSessionDuration(mins)}
          >
            <Text style={[
              styles.durationText,
              sessionDuration === mins && styles.durationTextSelected
            ]}>
              {mins} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderVibeSelection();
      case 2: return renderGoalSelection();
      case 3: return renderExperienceSelection();
      case 4: return renderScheduleSelection();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedVibe !== null;
      case 2: return selectedGoal !== null;
      case 3: return selectedExperience !== null;
      case 4: return selectedDays.length > 0;
      default: return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{step} of {totalSteps}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(s => s - 1)}
          >
            <Icon name="arrow-back" size={24} color="#9ca3af" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled
          ]}
          onPress={() => {
            if (step < totalSteps) {
              setStep(s => s + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Setting up...' : step === totalSteps ? 'Start Training' : 'Continue'}
          </Text>
          {!loading && <Icon name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f9fafb',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
  },
  vibeCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  vibeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vibeEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  vibeHeaderText: {
    flex: 1,
  },
  vibeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  vibeTagline: {
    fontSize: 14,
    color: '#9ca3af',
  },
  vibeDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  goalCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f',
  },
  goalLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#f9fafb',
    fontWeight: '600',
  },
  experienceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  experienceCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f',
  },
  experienceContent: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d1d5db',
  },
  experienceLabelSelected: {
    color: '#f9fafb',
  },
  experienceDesc: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayButton: {
    width: (width - 64) / 4,
    paddingVertical: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  dayButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#fff',
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  durationButtonSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  durationText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  durationTextSelected: {
    color: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  nextButtonDisabled: {
    backgroundColor: '#374151',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default VibeOnboarding;
