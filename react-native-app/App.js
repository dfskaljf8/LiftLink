import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Dimensions,
  Modal,
  Image,
  KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// Import components
import DocumentVerification from './src/components/DocumentVerification';
import PaymentScreen from './src/components/PaymentScreen';
import TrainerDashboard from './src/components/TrainerDashboard';
import GoogleFitIntegration from './src/components/GoogleFitIntegration';
import TrainerMapView from './src/components/TrainerMapView';
import CalendarScheduling from './src/components/CalendarScheduling';
import TreeSVG from './src/components/TreeSVG';
import LiftCoin from './src/components/LiftCoin';

// Constants
const { width, height } = Dimensions.get('window');
const BACKEND_URL = 'https://06aabe0a-6581-4a14-8d92-05c893af6d99.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

// Context
const AppContext = createContext();

// Colors for mobile app
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
  accent: '#8b5cf6'
};

// Tab Navigator
const Tab = createBottomTabNavigator();

// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [treeProgress, setTreeProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFitnessIntegration, setShowFitnessIntegration] = useState(false);

  useEffect(() => {
    checkStoredUser();
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const checkStoredUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('liftlink_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch tree progress
      const treeResponse = await axios.get(`${API}/users/${user.id}/tree-progress`);
      setTreeProgress(treeResponse.data);

      // Fetch sessions
      const sessionsResponse = await axios.get(`${API}/users/${user.id}/sessions`);
      setSessions(sessionsResponse.data.sessions || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('liftlink_user');
    setUser(null);
    setTreeProgress(null);
    setSessions([]);
  };

  // Payment and scheduling handling
  const handleBookTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setShowCalendar(true);
  };

  const handleScheduleSession = (sessionData) => {
    setSessionDetails({
      type: sessionData.session_type,
      duration: '60 minutes',
      amount: parseInt(selectedTrainer.price.replace('$', '').replace('/session', '')) * 100,
      location: selectedTrainer.location || 'LiftLink Gym',
      date: sessionData.date,
      time: sessionData.time
    });
    setShowCalendar(false);
    setShowPaymentScreen(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentScreen(false);
    setSelectedTrainer(null);
    setSessionDetails(null);
    Alert.alert('Success', `Payment successful! Your session with ${selectedTrainer.name} has been booked.`);
    fetchUserData(); // Refresh user data
  };

  const handlePaymentCancel = () => {
    setShowPaymentScreen(false);
    setSelectedTrainer(null);
    setSessionDetails(null);
  };

  const handleCalendarCancel = () => {
    setShowCalendar(false);
    setSelectedTrainer(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading LiftLink...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <AppContext.Provider value={{ darkMode, setDarkMode, colors }}>
        <AuthNavigator setUser={setUser} />
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={{ 
      darkMode, 
      setDarkMode, 
      colors, 
      user, 
      setUser, 
      treeProgress, 
      sessions,
      fetchUserData,
      handleLogout,
      handleBookTrainer,
      handleScheduleSession
    }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <MainNavigator />
        
        {/* Modals */}
        {showPaymentScreen && (
          <PaymentScreen
            trainer={selectedTrainer}
            sessionDetails={sessionDetails}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
        
        <CalendarScheduling
          user={user}
          trainer={selectedTrainer}
          visible={showCalendar}
          onClose={handleCalendarCancel}
          onScheduleConfirm={handleScheduleSession}
        />
        
        {showFitnessIntegration && (
          <GoogleFitIntegration
            user={user}
            visible={showFitnessIntegration}
            onClose={() => setShowFitnessIntegration(false)}
          />
        )}
      </NavigationContainer>
    </AppContext.Provider>
  );
};

// Auth Navigator
const AuthNavigator = ({ setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} initialParams={{ setUser }} />
      <Stack.Screen name="DocumentVerification" component={DocumentVerification} />
    </Stack.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  const { user, colors } = useContext(AppContext);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Trainers') {
            iconName = 'fitness-center';
          } else if (route.name === 'Clients') {
            iconName = 'people';
          } else if (route.name === 'Fitness') {
            iconName = 'directions-run';
          } else if (route.name === 'Tree') {
            iconName = 'nature';
          } else if (route.name === 'Sessions') {
            iconName = 'event';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 }
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      {user.role === 'trainer' ? (
        <Tab.Screen name="Clients" component={TrainerDashboard} />
      ) : (
        <Tab.Screen name="Trainers" component={TrainersScreen} />
      )}
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Tree" component={TreeScreen} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Auth Screen
const AuthScreen = ({ navigation, route }) => {
  const { setUser } = route.params;
  const { colors } = useContext(AppContext);
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('trainee');
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/check-user`, { email });
      if (response.data.exists) {
        // User exists, try to login
        await handleLogin();
      } else {
        // New user, continue with registration
        setMode('name');
      }
    } catch (error) {
      console.error('Email check failed:', error);
      setError('Failed to check email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API}/login`, { email });
      await AsyncStorage.setItem('liftlink_user', JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 403) {
        // Need verification
        const checkResponse = await axios.post(`${API}/check-user`, { email });
        if (checkResponse.data.exists) {
          navigation.navigate('DocumentVerification', {
            user: { id: checkResponse.data.user_id, email, role: checkResponse.data.role || 'trainee' }
          });
        }
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = {
        email,
        name,
        role,
        fitness_goals: fitnessGoals,
        experience_level: experienceLevel
      };

      const response = await axios.post(`${API}/users`, userData);
      
      // Navigate to document verification
      navigation.navigate('DocumentVerification', {
        user: { id: response.data.id, email, role, name }
      });
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View style={styles.authContainer}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to LiftLink</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Enter your email to get started
      </Text>
      
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.textSecondary }]}
        placeholder="Enter your email"
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleEmailSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.text }]}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.authContainer}>
      <Text style={[styles.title, { color: colors.text }]}>What's your name?</Text>
      
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.textSecondary }]}
        placeholder="Enter your name"
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setMode('role')}
        disabled={!name.trim()}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoleStep = () => (
    <View style={styles.authContainer}>
      <Text style={[styles.title, { color: colors.text }]}>I am a...</Text>
      
      <TouchableOpacity
        style={[styles.roleButton, { 
          backgroundColor: role === 'trainee' ? colors.primary : colors.surface,
          borderColor: colors.primary
        }]}
        onPress={() => setRole('trainee')}
      >
        <Text style={[styles.roleButtonText, { color: colors.text }]}>Fitness Enthusiast</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.roleButton, { 
          backgroundColor: role === 'trainer' ? colors.primary : colors.surface,
          borderColor: colors.primary
        }]}
        onPress={() => setRole('trainer')}
      >
        <Text style={[styles.roleButtonText, { color: colors.text }]}>Fitness Trainer</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => setMode('goals')}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  // Render appropriate step
  switch (mode) {
    case 'email':
      return renderEmailStep();
    case 'name':
      return renderNameStep();
    case 'role':
      return renderRoleStep();
    default:
      return renderEmailStep();
  }
};

// LiftLink Logo Component for React Native
const LiftLinkLogo = ({ size = 60, showTagline = true }) => {
  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  };

  return (
    <View style={[styles.logoContainer, { alignItems: 'center' }]}>
      <View style={[styles.logoIcon, { width: size, height: size }]}>
        <Text style={[styles.logoText, { fontSize: size * 0.4, color: colors.warning }]}>
          🏋️
        </Text>
      </View>
      <Text style={[styles.logoTitle, { fontSize: size * 0.3, color: colors.text }]}>
        LiftLink
      </Text>
      {showTagline && (
        <Text style={[styles.logoTagline, { fontSize: size * 0.15, color: colors.textSecondary }]}>
          Beginners to Believers
        </Text>
      )}
    </View>
  );
};

// Dashboard Screen
const DashboardScreen = () => {
  const { user, colors, treeProgress, sessions } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Centered LiftLink Logo */}
        <View style={styles.logoSection}>
          <LiftLinkLogo size={120} showTagline={true} />
        </View>

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Welcome back, {user.name}!
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {user.role === 'trainer' ? 'Trainer Dashboard' : 'Your Fitness Journey'}
          </Text>
        </View>

        {/* Tree Progress Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tree Progress</Text>
          <View style={styles.treeProgressContainer}>
            <TreeSVG level={treeProgress?.current_level || 'seed'} size={100} />
            <View style={styles.progressInfo}>
              <Text style={[styles.progressLevel, { color: colors.secondary }]}>
                Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
              </Text>
              <Text style={[styles.progressSessions, { color: colors.text }]}>
                {treeProgress?.total_sessions || 0} sessions completed
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {sessions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Recent Sessions
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {treeProgress?.consistency_streak || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Day Streak
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <LiftCoin count={treeProgress?.lift_coins || 0} size="sm" />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
          
          {user.role === 'trainer' ? (
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                <Icon name="people" size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  View Clients
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                <Icon name="schedule" size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                <Icon name="search" size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Find Trainers
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                <Icon name="fitness-center" size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Start Workout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Activity</Text>
          
          {sessions.length > 0 ? (
            sessions.slice(0, 3).map((session, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="fitness-center" size={20} color={colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {session.type || 'Workout Session'}
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                    {session.duration || '45 minutes'} • {session.date || 'Today'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No recent sessions. Start your fitness journey today!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {user.role === 'trainer' ? 'View Clients' : 'Find Trainers'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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

// Trainers Screen
const TrainersScreen = () => {
  const { colors, handleBookTrainer } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      // Enhanced mock trainers data
      const mockTrainers = [
        {
          id: 'trainer_001',
          name: 'Sarah Johnson',
          specialties: ['Strength Training', 'HIIT'],
          rating: 4.8,
          price: '$75/session',
          location: 'Downtown Gym',
          image: 'https://via.placeholder.com/150',
          bio: 'Certified personal trainer with 5 years experience',
          availability: 'Mon-Fri 6AM-8PM'
        },
        {
          id: 'trainer_002',
          name: 'Mike Chen',
          specialties: ['Cardio', 'Weight Loss'],
          rating: 4.9,
          price: '$85/session',
          location: 'Fitness Center',
          image: 'https://via.placeholder.com/150',
          bio: 'Expert in cardiovascular training and nutrition',
          availability: 'Mon-Sat 7AM-9PM'
        },
        {
          id: 'trainer_003',
          name: 'Emily Rodriguez',
          specialties: ['Yoga', 'Flexibility'],
          rating: 4.7,
          price: '$60/session',
          location: 'Wellness Studio',
          image: 'https://via.placeholder.com/150',
          bio: 'Yoga instructor specializing in mindfulness',
          availability: 'Daily 5AM-7PM'
        },
        {
          id: 'trainer_004',
          name: 'David Kim',
          specialties: ['CrossFit', 'Conditioning'],
          rating: 4.6,
          price: '$80/session',
          location: 'CrossFit Box',
          image: 'https://via.placeholder.com/150',
          bio: 'High-intensity training specialist',
          availability: 'Mon-Fri 5AM-8PM'
        }
      ];
      setTrainers(mockTrainers);
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTrainerCard = (trainer) => (
    <View key={trainer.id} style={[styles.trainerCard, { backgroundColor: colors.surface }]}>
      <View style={styles.trainerHeader}>
        <View style={styles.trainerInfo}>
          <Text style={[styles.trainerName, { color: colors.text }]}>{trainer.name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: colors.warning }]}>⭐ {trainer.rating}</Text>
            <Text style={[styles.availability, { color: colors.textSecondary }]}>{trainer.availability}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => handleBookTrainer(trainer)}
        >
          <Text style={[styles.bookButtonText, { color: colors.text }]}>Book</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.trainerBio, { color: colors.textSecondary }]}>{trainer.bio}</Text>
      
      <View style={styles.trainerDetails}>
        <Text style={[styles.trainerSpecialties, { color: colors.secondary }]}>
          {trainer.specialties.join(', ')}
        </Text>
        <Text style={[styles.trainerPrice, { color: colors.primary }]}>
          {trainer.price}
        </Text>
      </View>
      
      <Text style={[styles.trainerLocation, { color: colors.textSecondary }]}>
        📍 {trainer.location}
      </Text>
    </View>
  );

  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <TouchableOpacity
        style={[styles.viewModeButton, {
          backgroundColor: viewMode === 'list' ? colors.primary : colors.surface
        }]}
        onPress={() => setViewMode('list')}
      >
        <Text style={[styles.viewModeText, { color: colors.text }]}>List</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, {
          backgroundColor: viewMode === 'map' ? colors.primary : colors.surface
        }]}
        onPress={() => setViewMode('map')}
      >
        <Text style={[styles.viewModeText, { color: colors.text }]}>Map</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Find Trainers</Text>
        {renderViewModeSelector()}
      </View>
      
      {viewMode === 'list' ? (
        <ScrollView style={styles.content}>
          {trainers.map(renderTrainerCard)}
        </ScrollView>
      ) : (
        <TrainerMapView 
          trainers={trainers} 
          onTrainerSelect={handleBookTrainer}
        />
      )}
    </SafeAreaView>
  );
};

// Tree Screen
const TreeScreen = () => {
  const { colors, treeProgress } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Tree</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Current Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Complete sessions to grow your tree!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Sessions Screen
const SessionsScreen = () => {
  const { colors, sessions } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

// Settings Screen
const SettingsScreen = () => {
  const { colors, user, setUser, handleLogout } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name || '');
  const [editedGoals, setEditedGoals] = useState(user.fitness_goals || []);
  const [editedExperienceLevel, setEditedExperienceLevel] = useState(user.experience_level || 'beginner');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const fitnessGoals = [
    'Weight Loss',
    'Muscle Building',
    'Cardio',
    'Strength Training',
    'Flexibility',
    'General Fitness',
    'Sports Performance',
    'Rehabilitation'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updatedProfile = {
        name: editedName,
        fitness_goals: editedGoals,
        experience_level: editedExperienceLevel,
        dark_mode: darkMode
      };

      const response = await axios.put(`${API}/users/${user.id}`, updatedProfile);
      
      if (response.data) {
        const updatedUser = { ...user, ...updatedProfile };
        setUser(updatedUser);
        await AsyncStorage.setItem('liftlink_user', JSON.stringify(updatedUser));
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalToggle = (goal) => {
    setEditedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const renderProfileSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>Profile Information</Text>
      
      {editing ? (
        <View style={styles.editingContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.textSecondary
              }]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Fitness Goals</Text>
            <View style={styles.goalsContainer}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.goalChip, {
                    backgroundColor: editedGoals.includes(goal) ? colors.primary : colors.background,
                    borderColor: colors.primary
                  }]}
                  onPress={() => handleGoalToggle(goal)}
                >
                  <Text style={[styles.goalChipText, { color: colors.text }]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Experience Level</Text>
            <View style={styles.experienceContainer}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[styles.experienceButton, {
                    backgroundColor: editedExperienceLevel === level.value ? colors.primary : colors.background,
                    borderColor: colors.primary
                  }]}
                  onPress={() => setEditedExperienceLevel(level.value)}
                >
                  <Text style={[styles.experienceButtonText, { color: colors.text }]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.success }]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={[styles.saveButtonText, { color: colors.text }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
              onPress={() => {
                setEditing(false);
                setEditedName(user.name || '');
                setEditedGoals(user.fitness_goals || []);
                setEditedExperienceLevel(user.experience_level || 'beginner');
              }}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Name:</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>{user.name}</Text>
          </View>
          
          <View style={styles.profileRow}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>{user.email}</Text>
          </View>
          
          <View style={styles.profileRow}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Role:</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>
              {user.role === 'trainer' ? 'Fitness Trainer' : 'Fitness Enthusiast'}
            </Text>
          </View>
          
          <View style={styles.profileRow}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Experience:</Text>
            <Text style={[styles.profileValue, { color: colors.text }]}>
              {user.experience_level?.charAt(0).toUpperCase() + user.experience_level?.slice(1)}
            </Text>
          </View>
          
          <View style={styles.profileColumn}>
            <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Fitness Goals:</Text>
            <View style={styles.goalsDisplay}>
              {(user.fitness_goals || []).map((goal, index) => (
                <View key={index} style={[styles.goalBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.goalBadgeText, { color: colors.text }]}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setEditing(true)}
          >
            <Text style={[styles.editButtonText, { color: colors.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderAppearanceSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>Appearance</Text>
      
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { 
            backgroundColor: darkMode ? colors.primary : colors.textSecondary 
          }]}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Text style={[styles.toggleButtonText, { color: colors.text }]}>
            {darkMode ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>Account</Text>
      
      <View style={styles.accountInfo}>
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Member Since:</Text>
          <Text style={[styles.accountValue, { color: colors.text }]}>
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.accountRow}>
          <Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Verification Status:</Text>
          <Text style={[styles.accountValue, { 
            color: user.age_verified ? colors.success : colors.warning 
          }]}>
            {user.age_verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error }]}
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: handleLogout }
            ]
          );
        }}
      >
        <Text style={[styles.logoutButtonText, { color: colors.text }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
        
        {renderProfileSection()}
        {renderAppearanceSection()}
        {renderAccountSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
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
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#f9fafb',
    marginTop: 16,
    fontSize: 16,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleButton: {
    width: '100%',
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
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
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trainerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  trainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    marginRight: 8,
  },
  availability: {
    fontSize: 12,
  },
  trainerBio: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  trainerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trainerSpecialties: {
    fontSize: 14,
    flex: 1,
  },
  trainerPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  trainerLocation: {
    fontSize: 12,
    marginBottom: 8,
  },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Enhanced Settings Styles
  settingsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editingContainer: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  goalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  goalChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  experienceContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  experienceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  experienceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileContainer: {
    marginTop: 8,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileColumn: {
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  profileValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  goalsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountInfo: {
    marginBottom: 16,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Logo Styles
  logoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    borderRadius: 12,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontWeight: 'bold',
  },
  logoTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logoTagline: {
    fontStyle: 'italic',
  },
});

export default App;