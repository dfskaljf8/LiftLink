import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// LiftLink Mobile App - React Native Version
export default function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [fadeAnim] = useState(new Animated.Value(0));
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const WelcomeScreen = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Matrix-style header */}
          <View style={styles.header}>
            <Text style={styles.logo}>LiftLink</Text>
            <Text style={styles.tagline}>Elite Fitness Training Platform</Text>
          </View>

          {/* Cyberpunk-style feature grid */}
          <ScrollView 
            style={styles.featuresContainer}
            contentContainerStyle={styles.featuresContent}
            showsVerticalScrollIndicator={false}
          >
            <FeatureCard
              icon="🏋️"
              title="Certified Trainers"
              description="Connect with verified fitness professionals"
              onPress={() => setCurrentView('trainers')}
            />
            
            <FeatureCard
              icon="📊"
              title="Health Integration"
              description="Sync with Apple Health & Google Fit"
              onPress={() => setCurrentView('health')}
            />
            
            <FeatureCard
              icon="📍"
              title="Session Verification"
              description="GPS-verified attendance tracking"
              onPress={() => setCurrentView('sessions')}
            />
            
            <FeatureCard
              icon="👥"
              title="Find Friends"
              description="Connect with contacts using LiftLink"
              onPress={() => setCurrentView('social')}
            />
            
            <FeatureCard
              icon="🎯"
              title="Enhanced Analytics"
              description="Comprehensive fitness insights"
              onPress={() => setCurrentView('analytics')}
            />
            
            <FeatureCard
              icon="🔒"
              title="Secure Verification"
              description="Age & ID verification system"
              onPress={() => setCurrentView('verification')}
            />
          </ScrollView>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setCurrentView('onboarding')}
            >
              <LinearGradient
                colors={['#C4D600', '#B2FF66']}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setCurrentView('login')}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );

  const FeatureCard = ({ icon, title, description, onPress }) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <LinearGradient
        colors={['rgba(196, 214, 0, 0.1)', 'rgba(178, 255, 102, 0.05)']}
        style={styles.featureCardGradient}
      >
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ComingSoonScreen = ({ title }) => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>{title}</Text>
          <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            This feature is being developed and will be available in the next update.
          </Text>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentView('welcome')}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );

  // Render based on current view
  switch (currentView) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'trainers':
      return <ComingSoonScreen title="Find Trainers" />;
    case 'health':
      return <ComingSoonScreen title="Health Integration" />;
    case 'sessions':
      return <ComingSoonScreen title="Session Verification" />;
    case 'social':
      return <ComingSoonScreen title="Social Features" />;
    case 'analytics':
      return <ComingSoonScreen title="Enhanced Analytics" />;
    case 'verification':
      return <ComingSoonScreen title="ID Verification" />;
    case 'onboarding':
      return <ComingSoonScreen title="Onboarding" />;
    case 'login':
      return <ComingSoonScreen title="Sign In" />;
    default:
      return <WelcomeScreen />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#C4D600',
    marginBottom: 8,
    textShadowColor: 'rgba(196, 214, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  featuresContainer: {
    flex: 1,
  },
  featuresContent: {
    paddingBottom: 20,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(196, 214, 0, 0.2)',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  ctaContainer: {
    paddingVertical: 20,
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(196, 214, 0, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#C4D600',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C4D600',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(196, 214, 0, 0.4)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#C4D600',
    fontWeight: '500',
  },
});
