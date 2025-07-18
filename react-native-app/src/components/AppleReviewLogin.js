import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  ScrollView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Apple Review Credentials and Access System
const APPLE_REVIEW_CREDENTIALS = {
  email: 'applereview@liftlink.com',
  password: 'LiftLink2024Review!',
  // Demo user for Apple Review team
  user: {
    id: 'apple_review_user_123',
    name: 'Apple Review Team',
    email: 'applereview@liftlink.com',
    role: 'fitness_enthusiast',
    fitness_goals: ['General Fitness', 'Weight Loss'],
    experience_level: 'intermediate',
    age_verified: true,
    certification_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    // Mock data for demo
    tree_progress: {
      current_level: 'young_tree',
      total_sessions: 12,
      consistency_streak: 5,
      lift_coins: 250,
      progress_percentage: 65
    },
    sessions: [
      {
        id: 'session_1',
        type: 'Strength Training',
        duration: '45 minutes',
        date: '2024-01-15',
        trainer: 'Sarah Johnson',
        status: 'completed'
      },
      {
        id: 'session_2',
        type: 'Cardio Session',
        duration: '30 minutes',
        date: '2024-01-14',
        trainer: 'Mike Chen',
        status: 'completed'
      }
    ]
  }
};

const AppleReviewLogin = ({ onReviewLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showReviewPath, setShowReviewPath] = useState(false);

  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    apple: '#007AFF'
  };

  const handleAppleReviewLogin = async () => {
    if (email === APPLE_REVIEW_CREDENTIALS.email && password === APPLE_REVIEW_CREDENTIALS.password) {
      // Set up Apple Review user
      await AsyncStorage.setItem('liftlink_user', JSON.stringify(APPLE_REVIEW_CREDENTIALS.user));
      await AsyncStorage.setItem('apple_review_mode', 'true');
      
      Alert.alert(
        'Apple Review Access Granted',
        'Welcome, Apple Review Team! You now have full access to explore all LiftLink features.',
        [
          {
            text: 'Continue',
            onPress: () => onReviewLogin(APPLE_REVIEW_CREDENTIALS.user)
          }
        ]
      );
    } else {
      Alert.alert('Invalid Credentials', 'Please check your Apple Review credentials.');
    }
  };

  const showAppleReviewPath = () => {
    setShowReviewPath(true);
  };

  if (showReviewPath) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.apple }]}>🍎 Apple Review Team</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>LiftLink App Review Access</Text>
          </View>

          <View style={[styles.credentialsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Review Credentials</Text>
            
            <View style={styles.credentialRow}>
              <Text style={[styles.credentialLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.credentialValue, { color: colors.success }]}>
                {APPLE_REVIEW_CREDENTIALS.email}
              </Text>
            </View>
            
            <View style={styles.credentialRow}>
              <Text style={[styles.credentialLabel, { color: colors.textSecondary }]}>Password:</Text>
              <Text style={[styles.credentialValue, { color: colors.success }]}>
                {APPLE_REVIEW_CREDENTIALS.password}
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>App Features to Review</Text>
            
            <View style={styles.featureList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Multi-step user onboarding with role selection
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Trainer and client dashboard interfaces
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Session booking and payment processing (Stripe)
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Progress tracking with tree visualization
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Google Fit integration for fitness data
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Settings and profile management
              </Text>
            </View>
          </View>

          <View style={[styles.pathCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Review Testing Path</Text>
            
            <View style={styles.pathStep}>
              <Text style={[styles.stepNumber, { color: colors.apple }]}>1</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Use the credentials above to login
              </Text>
            </View>
            
            <View style={styles.pathStep}>
              <Text style={[styles.stepNumber, { color: colors.apple }]}>2</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Explore the Dashboard with pre-loaded fitness data
              </Text>
            </View>
            
            <View style={styles.pathStep}>
              <Text style={[styles.stepNumber, { color: colors.apple }]}>3</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Navigate through all tabs: Trainers, Fitness, Tree, Sessions, Settings
              </Text>
            </View>
            
            <View style={styles.pathStep}>
              <Text style={[styles.stepNumber, { color: colors.apple }]}>4</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Test trainer booking flow (payment in test mode)
              </Text>
            </View>
            
            <View style={styles.pathStep}>
              <Text style={[styles.stepNumber, { color: colors.apple }]}>5</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Review profile editing in Settings
              </Text>
            </View>
          </View>

          <View style={styles.loginForm}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Login with Review Credentials</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.apple }]}
              onPress={handleAppleReviewLogin}
            >
              <Text style={[styles.loginButtonText, { color: colors.text }]}>
                Login as Apple Review Team
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.textSecondary }]}
            onPress={() => setShowReviewPath(false)}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              Back to Regular Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.reviewAccessContainer}>
      <TouchableOpacity
        style={[styles.reviewAccessButton, { backgroundColor: colors.apple }]}
        onPress={showAppleReviewPath}
      >
        <Text style={[styles.reviewAccessText, { color: colors.text }]}>
          🍎 Apple Review Team Access
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  credentialsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  credentialLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  pathCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pathStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  loginForm: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  loginButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewAccessContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  reviewAccessButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reviewAccessText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppleReviewLogin;
export { APPLE_REVIEW_CREDENTIALS };