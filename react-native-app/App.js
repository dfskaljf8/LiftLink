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
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// Import components
import DocumentVerification from './src/components/DocumentVerification';
import PaymentScreen from './src/components/PaymentScreen';
import TrainerDashboard from './src/components/TrainerDashboard';

// Constants
const BACKEND_URL = 'https://06aabe0a-6581-4a14-8d92-05c893af6d99.preview.emergentagent.com';
const API = `${BACKEND_URL}/api`;

// Context
const AppContext = createContext();

// Colors
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

// Tab Navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

  // Payment handling
  const handleBookTrainer = (trainer) => {
    setSelectedTrainer(trainer);
    setSessionDetails({
      type: 'Personal Training',
      duration: '60 minutes',
      amount: parseInt(trainer.price.replace('$', '').replace('/session', '')) * 100,
      location: trainer.location || 'LiftLink Gym'
    });
    setShowPaymentScreen(true);
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentScreen(false);
    setSelectedTrainer(null);
    setSessionDetails(null);
    Alert.alert('Success', `Payment successful! Your session with ${selectedTrainer.name} has been booked.`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentScreen(false);
    setSelectedTrainer(null);
    setSessionDetails(null);
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
      handleBookTrainer
    }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <MainNavigator />
        {showPaymentScreen && (
          <PaymentScreen
            trainer={selectedTrainer}
            sessionDetails={sessionDetails}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
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

// Dashboard Screen
const DashboardScreen = () => {
  const { user, colors, treeProgress, sessions } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Welcome back, {user.name}!
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {user.role === 'trainer' ? 'Trainer Dashboard' : 'Your Fitness Journey'}
          </Text>
        </View>

        {/* Tree Progress */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Tree Progress</Text>
          <Text style={[styles.cardValue, { color: colors.secondary }]}>
            Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {sessions.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Sessions
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {treeProgress?.total_sessions || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              {user.role === 'trainer' ? 'View Clients' : 'Find Trainers'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Trainers Screen
const TrainersScreen = () => {
  const { colors, handleBookTrainer } = useContext(AppContext);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      // Mock trainers data
      const mockTrainers = [
        {
          id: 'trainer_001',
          name: 'Sarah Johnson',
          specialties: ['Strength Training', 'HIIT'],
          rating: 4.8,
          price: '$75/session',
          location: 'Downtown Gym',
          image: 'https://via.placeholder.com/150'
        },
        {
          id: 'trainer_002',
          name: 'Mike Chen',
          specialties: ['Cardio', 'Weight Loss'],
          rating: 4.9,
          price: '$85/session',
          location: 'Fitness Center',
          image: 'https://via.placeholder.com/150'
        }
      ];
      setTrainers(mockTrainers);
    } catch (error) {
      console.error('Error fetching trainers:', error);
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
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Find Trainers</Text>
        
        {trainers.map((trainer) => (
          <View key={trainer.id} style={[styles.trainerCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.trainerName, { color: colors.text }]}>{trainer.name}</Text>
            <Text style={[styles.trainerSpecialties, { color: colors.textSecondary }]}>
              {trainer.specialties.join(', ')}
            </Text>
            <Text style={[styles.trainerPrice, { color: colors.secondary }]}>
              {trainer.price}
            </Text>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: colors.primary }]}
              onPress={() => handleBookTrainer(trainer)}
            >
              <Text style={[styles.bookButtonText, { color: colors.text }]}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  const { colors, user, handleLogout } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Profile</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Name: {user.name}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Email: {user.email}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Role: {user.role}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
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
  trainerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trainerSpecialties: {
    fontSize: 14,
    marginBottom: 8,
  },
  trainerPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bookButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;