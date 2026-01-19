/**
 * LiftLink Mobile App - Main Entry Point
 * AI-Powered Fitness Coaching Platform
 * 
 * Architecture: Clean, modular structure with screens in /src/screens
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// Import Components
import DocumentVerification from './src/components/DocumentVerification';
import PaymentScreen from './src/components/PaymentScreen';
import TrainerDashboard from './src/components/TrainerDashboard';
import TraineeDashboard from './src/components/TraineeDashboard';
import GoogleFitIntegration from './src/components/GoogleFitIntegration';
import TrainerMapView from './src/components/TrainerMapView';
import CalendarScheduling from './src/components/CalendarScheduling';
import TreeSVG from './src/components/TreeSVG';
import LiftCoin from './src/components/LiftCoin';
import AppleReviewLogin from './src/components/AppleReviewLogin';
import GoogleSignInButton from './src/components/GoogleSignInButton';
import { DynamicIslandStatusBar, DynamicIslandSafeWrapper } from './src/components/DynamicIslandUtils';
import gestureManager from './src/components/MobileGestureManager';
import SwipeTrainerDiscovery from './src/components/SwipeTrainerDiscovery';
import VibeOnboarding from './src/components/VibeOnboarding';
import ContentLocker from './src/components/ContentLocker';

// Import Screens
import CoachingHubScreen from './src/screens/CoachingAutomation/CoachingHubScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import AICommandCenter from './src/screens/AICommandCenter';
import AIOnboardingScreen from './src/screens/AIOnboardingScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';

// Import Security Services
import deviceSecurity, { checkDeviceSecurity, showSecurityWarning } from './src/services/DeviceSecurityManager';
import certificatePinning from './src/services/CertificatePinningService';
import { LoadingAnimation } from './src/components/Animations';

// Import Styles
import NativeAppStyles, { colors as appColors, deviceSize } from './src/styles/AppStyles';

// Constants
const { width, height } = Dimensions.get('window');
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

if (!BACKEND_URL) {
  console.error('❌ REACT_APP_BACKEND_URL is not set!');
}
const API = `${BACKEND_URL}/api`;

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;
const isTablet = width >= 768;

// Scale function
const scale = (size) => {
  if (isSmallScreen) return size * 0.9;
  if (isMediumScreen) return size;
  if (isLargeScreen) return size * 1.1;
  if (isTablet) return size * 1.2;
  return size;
};

// Theme colors
const darkColors = {
  background: '#111827',
  surface: '#1f2937',
  surfaceLight: '#374151',
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  accent: '#10b981',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
};

// Create Context - Export for screens to use
export const AppContext = createContext();

// Navigation
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ==================== INLINE SCREENS (Small) ====================

// Dashboard Screen - Role-based routing
const DashboardScreen = ({ navigation }) => {
  const { user, colors, treeProgress, sessions } = useContext(AppContext);
  
  if (user?.role === 'trainer') {
    return <TrainerDashboard trainerId={user.id} navigation={navigation} />;
  }
  return <TraineeDashboard user={user} navigation={navigation} />;
};

// Fitness Screen
const FitnessScreen = () => {
  const { colors, user } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GoogleFitIntegration user={user} />
    </SafeAreaView>
  );
};

// Tree Screen
const TreeScreen = () => {
  const { colors, treeProgress } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Tree</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Complete sessions to grow your tree!
          </Text>
          <TreeSVG stage={treeProgress?.current_level || 'seed'} size={200} />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Sessions Screen
const SessionsScreen = () => {
  const { colors, sessions } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Sessions</Text>
        
        {sessions.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>No sessions yet</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Book your first session to get started!
            </Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {session.session_type}
              </Text>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                {session.duration_minutes} minutes
              </Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
};

// Trainers Screen
const TrainersScreen = () => {
  const { colors, handleBookTrainer } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('swipe');

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get(`${API}/trainers/all`);
      setTrainers(response.data?.trainers || []);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {viewMode === 'swipe' ? (
        <SwipeTrainerDiscovery 
          trainers={trainers} 
          onMatch={(trainer) => handleBookTrainer(trainer)}
        />
      ) : viewMode === 'map' ? (
        <TrainerMapView trainers={trainers} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Find Trainers</Text>
          {trainers.map((trainer) => (
            <View key={trainer.id} style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{trainer.name}</Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = ({ navigation }) => {
  const { colors, user, handleLogout } = useContext(AppContext);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* AI Features for Trainers */}
        {user?.role === 'trainer' && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>AI Features</Text>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('AICommandCenter')}
            >
              <Icon name="psychology" size={24} color={colors.primary} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>AI Command Center</Text>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => navigation.navigate('CoachingHub')}
            >
              <Icon name="auto-awesome" size={24} color={colors.primary} />
              <Text style={[styles.settingsItemText, { color: colors.text }]}>Coaching Hub</Text>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* AI Chat for Everyone */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => navigation.navigate('AIChat')}
          >
            <Icon name="chat" size={24} color={colors.accent} />
            <Text style={[styles.settingsItemText, { color: colors.text }]}>AI Coach Chat</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Icon name="privacy-tip" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingsItemText, { color: colors.text }]}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <Icon name="description" size={24} color={colors.textSecondary} />
            <Text style={[styles.settingsItemText, { color: colors.text }]}>Terms of Service</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Import TouchableOpacity for Settings screen
import { TouchableOpacity, ScrollView } from 'react-native';

// Auth Screen (simplified - full version in screens/AuthScreen.js)
const AuthScreen = ({ navigation, route }) => {
  const { setUser } = route.params;
  const { colors } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    setLoading(true);
    try {
      // Check if user exists
      const checkResponse = await axios.post(`${API}/check-user`, { email });
      
      if (checkResponse.data.exists) {
        // Login
        const response = await axios.post(`${API}/login`, { email });
        await AsyncStorage.setItem('liftlink_user', JSON.stringify(response.data));
        setUser(response.data);
      } else {
        // New user - start AI onboarding
        navigation.navigate('AIOnboarding', { email });
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async ({ user }) => {
    setUser(user);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.authContainer}>
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>🏋️</Text>
          <Text style={[styles.logoTitle, { color: colors.text }]}>LiftLink</Text>
          <Text style={[styles.logoTagline, { color: colors.textSecondary }]}>
            AI-Powered Coaching
          </Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => setError(msg)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Import TextInput
import { TextInput } from 'react-native';

// ==================== NAVIGATORS ====================

// Main Tab Navigator
const MainTabNavigator = () => {
  const { user, colors } = useContext(AppContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'dashboard',
            Trainers: 'people',
            Fitness: 'fitness-center',
            Tree: 'park',
            Sessions: 'event',
            Settings: 'settings',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trainers" component={TrainersScreen} />
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Tree" component={TreeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainNavigator = () => {
  const { user, colors } = useContext(AppContext);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* AI Screens */}
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="AICommandCenter" component={AICommandCenter} />
      <Stack.Screen name="CoachingHub" component={CoachingHubScreen} />
      
      {/* Legal Screens */}
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      
      {/* Modal Screens */}
      <Stack.Screen name="VibeOnboarding" options={{ presentation: 'modal' }}>
        {(props) => (
          <VibeOnboarding 
            {...props} 
            userId={user?.id} 
            onComplete={() => props.navigation.goBack()} 
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Payment" options={{ presentation: 'modal' }}>
        {(props) => <PaymentScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Calendar" options={{ presentation: 'modal' }}>
        {(props) => <CalendarScheduling {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// ==================== MAIN APP ====================

const App = () => {
  const navigationRef = React.useRef();
  
  // State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [treeProgress, setTreeProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [securityCheckComplete, setSecurityCheckComplete] = useState(false);

  const colors = darkColors;

  // Initialize
  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const initializeApp = async () => {
    try {
      // Security check
      const isSecure = await checkDeviceSecurity();
      setSecurityCheckComplete(true);

      // Check for saved user
      const savedUser = await AsyncStorage.getItem('liftlink_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Init error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [treeRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/tree-progress/${user.id}`).catch(() => ({ data: null })),
        axios.get(`${API}/sessions/user/${user.id}`).catch(() => ({ data: { sessions: [] } })),
      ]);
      
      setTreeProgress(treeRes.data);
      setSessions(sessionsRes.data?.sessions || []);
    } catch (error) {
      console.error('Fetch user data error:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('liftlink_user');
    setUser(null);
    setTreeProgress(null);
    setSessions([]);
  };

  const handleBookTrainer = (trainer) => {
    // Handle trainer booking
    console.log('Book trainer:', trainer);
  };

  // Context value
  const contextValue = {
    user,
    setUser,
    colors,
    darkMode,
    setDarkMode,
    treeProgress,
    sessions,
    handleLogout,
    handleBookTrainer,
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingAnimation />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading LiftLink...</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <>
              <Stack.Screen name="Auth">
                {(props) => <AuthScreen {...props} route={{ ...props.route, params: { setUser } }} />}
              </Stack.Screen>
              <Stack.Screen name="AIOnboarding">
                {(props) => <AIOnboardingScreen {...props} />}
              </Stack.Screen>
              <Stack.Screen name="DocumentVerification" component={DocumentVerification} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
  },
  // Auth styles
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  logoTagline: {
    fontSize: 16,
    marginTop: 8,
  },
  formSection: {
    width: '100%',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#374151',
  },
  dividerText: {
    color: '#9ca3af',
    marginHorizontal: 16,
  },
  // Settings styles
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  settingsItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
