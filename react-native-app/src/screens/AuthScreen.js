import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import GoogleSignInButton from '../components/GoogleSignInButton';
import AppleReviewLogin from '../components/AppleReviewLogin';
import { AppContext } from '../../App';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const LiftLinkLogo = ({ size = 60, showTagline = true }) => {
  return (
    <View style={[styles.logoContainer, { alignItems: 'center' }]}>
      <View style={[styles.logoIcon, { width: size, height: size }]}>
        <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>🏋️</Text>
      </View>
      <Text style={[styles.logoTitle, { fontSize: size * 0.3 }]}>LiftLink</Text>
      {showTagline && (
        <Text style={[styles.logoTagline, { fontSize: size * 0.15 }]}>Beginners to Believers</Text>
      )}
    </View>
  );
};

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
  const [emailError, setEmailError] = useState('');
  const [certType, setCertType] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [specialties, setSpecialties] = useState([]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setError('');
    if (text.length === 0) {
      setEmailError('');
    } else if (!validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setEmailError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API}/check-user`, { email });
      if (response.data.exists) {
        await handleLogin();
      } else {
        setMode('name');
      }
    } catch (err) {
      console.error('Email check failed:', err);
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
    } catch (err) {
      if (err.response?.status === 403) {
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
      const userData = { email, name, role, fitness_goals: fitnessGoals, experience_level: experienceLevel };
      const response = await axios.post(`${API}/users`, userData);
      navigation.navigate('DocumentVerification', { user: { id: response.data.id, email, role, name } });
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = async ({ user, token, isNewUser }) => {
    setUser(user);
    if (isNewUser) {
      Alert.alert('Welcome to LiftLink! 🎉', `Hi ${user.name}! Your account has been created with Google.`, [{ text: 'Get Started' }]);
    }
  };

  const handleGoogleSignInError = (errorMessage) => {
    setError(errorMessage || 'Google Sign-In failed. Please try again.');
  };

  const renderEmailStep = () => (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.authContainer}>
      <View style={styles.logoSection}>
        <LiftLinkLogo size={120} showTagline={true} />
      </View>
      <View style={styles.formSection}>
        <Text style={styles.authTitle}>Welcome to LiftLink</Text>
        <Text style={styles.authSubtitle}>Enter your email to get started</Text>
        <TextInput
          style={[styles.input, emailError ? { borderColor: '#ff6b6b', borderWidth: 1 } : {}]}
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.primaryButton, (!validateEmail(email) || loading) ? { opacity: 0.6 } : {}]}
          onPress={handleEmailSubmit}
          disabled={!validateEmail(email) || loading}
        >
          {loading ? <ActivityIndicator color="#f9fafb" /> : <Text style={styles.primaryButtonText}>Continue with Email</Text>}
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        <GoogleSignInButton onSignInSuccess={handleGoogleSignInSuccess} onSignInError={handleGoogleSignInError} style={styles.googleButton} />
      </View>
      <AppleReviewLogin onReviewLogin={setUser} />
    </KeyboardAvoidingView>
  );

  const renderNameStep = () => (
    <View style={styles.authContainer}>
      <Text style={styles.title}>What&apos;s your name?</Text>
      <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />
      <TouchableOpacity style={[styles.button, { opacity: name.trim() ? 1 : 0.5 }]} onPress={() => setMode('role')} disabled={!name.trim()}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRoleStep = () => (
    <View style={styles.authContainer}>
      <Text style={styles.title}>I am a...</Text>
      <TouchableOpacity style={[styles.roleButton, { backgroundColor: role === 'trainee' ? '#4f46e5' : '#1f2937' }]} onPress={() => setRole('trainee')}>
        <Text style={styles.roleButtonText}>💪 Fitness Enthusiast (Trainee)</Text>
        <Text style={styles.roleDescription}>Find trainers, track progress, grow your tree</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.roleButton, { backgroundColor: role === 'trainer' ? '#4f46e5' : '#1f2937' }]} onPress={() => setRole('trainer')}>
        <Text style={styles.roleButtonText}>🏋️ Fitness Trainer</Text>
        <Text style={styles.roleDescription}>Manage clients, schedule sessions, earn money</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => setMode(role === 'trainee' ? 'goals' : 'certifications')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGoalsStep = () => {
    const goalOptions = [
      { id: 'weight_loss', label: 'Weight Loss', icon: '🏃' },
      { id: 'muscle_building', label: 'Muscle Building', icon: '💪' },
      { id: 'cardio', label: 'Cardio Fitness', icon: '❤️' },
      { id: 'strength', label: 'Strength Training', icon: '🏋️' },
      { id: 'flexibility', label: 'Flexibility', icon: '🧘' },
      { id: 'general_fitness', label: 'General Fitness', icon: '⚡' }
    ];
    const toggleGoal = (goalId) => {
      if (fitnessGoals.includes(goalId)) {
        setFitnessGoals(fitnessGoals.filter(g => g !== goalId));
      } else {
        setFitnessGoals([...fitnessGoals, goalId]);
      }
    };
    return (
      <ScrollView style={styles.authContainer}>
        <Text style={styles.title}>What are your fitness goals?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>
        <View style={styles.goalsGrid}>
          {goalOptions.map((goal) => (
            <TouchableOpacity key={goal.id} style={[styles.goalOption, { backgroundColor: fitnessGoals.includes(goal.id) ? '#4f46e5' : '#1f2937' }]} onPress={() => toggleGoal(goal.id)}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={styles.goalLabel}>{goal.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { opacity: fitnessGoals.length > 0 ? 1 : 0.5 }]} onPress={() => setMode('experience')} disabled={fitnessGoals.length === 0}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderExperienceStep = () => {
    const experienceOptions = [
      { value: 'beginner', label: '🌱 Beginner', description: 'Just starting my fitness journey' },
      { value: 'intermediate', label: '💪 Intermediate', description: 'Been working out for a while' },
      { value: 'advanced', label: '🏆 Advanced', description: 'Experienced fitness enthusiast' }
    ];
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>What&apos;s your experience level?</Text>
        {experienceOptions.map((option) => (
          <TouchableOpacity key={option.value} style={[styles.experienceOption, { backgroundColor: experienceLevel === option.value ? '#4f46e5' : '#1f2937' }]} onPress={() => setExperienceLevel(option.value)}>
            <Text style={styles.experienceLabel}>{option.label}</Text>
            <Text style={styles.experienceDescription}>{option.description}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.button} onPress={handleRegistration} disabled={loading}>
          {loading ? <ActivityIndicator color="#f9fafb" /> : <Text style={styles.buttonText}>Complete Signup</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  const renderCertificationsStep = () => {
    const certificationTypes = ['NASM', 'ACE', 'ACSM', 'NSCA', 'ISSA', 'Other'];
    const specialtyOptions = ['Personal Training', 'Group Fitness', 'Strength & Conditioning', 'Nutrition', 'Yoga', 'CrossFit'];
    const toggleSpecialty = (s) => {
      if (specialties.includes(s)) setSpecialties(specialties.filter(x => x !== s));
      else setSpecialties([...specialties, s]);
    };
    return (
      <ScrollView style={styles.authContainer}>
        <Text style={styles.title}>Trainer Certification</Text>
        <Text style={styles.subtitle}>Tell us about your qualifications</Text>
        <Text style={styles.inputLabel}>Certification Type</Text>
        <View style={styles.pickerContainer}>
          {certificationTypes.map((cert) => (
            <TouchableOpacity key={cert} style={[styles.certOption, { backgroundColor: certType === cert ? '#4f46e5' : '#1f2937' }]} onPress={() => setCertType(cert)}>
              <Text style={styles.certText}>{cert}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.inputLabel}>Specialties</Text>
        <View style={styles.specialtiesGrid}>
          {specialtyOptions.map((s) => (
            <TouchableOpacity key={s} style={[styles.specialtyChip, { backgroundColor: specialties.includes(s) ? '#10b981' : '#1f2937' }]} onPress={() => toggleSpecialty(s)}>
              <Text style={styles.specialtyText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { opacity: certType && specialties.length > 0 ? 1 : 0.5, marginTop: 24 }]} onPress={() => { setFitnessGoals(specialties); handleRegistration(); }} disabled={!certType || specialties.length === 0 || loading}>
          {loading ? <ActivityIndicator color="#f9fafb" /> : <Text style={styles.buttonText}>Complete Signup</Text>}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  switch (mode) {
    case 'email': return renderEmailStep();
    case 'name': return renderNameStep();
    case 'role': return renderRoleStep();
    case 'goals': return renderGoalsStep();
    case 'experience': return renderExperienceStep();
    case 'certifications': return renderCertificationsStep();
    default: return renderEmailStep();
  }
};

const styles = StyleSheet.create({
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#111827' },
  logoSection: { marginBottom: 40 },
  formSection: { width: '100%', maxWidth: 400 },
  logoContainer: { alignItems: 'center' },
  logoIcon: { justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#f59e0b' },
  logoTitle: { color: '#f9fafb', fontWeight: '700', marginTop: 8 },
  logoTagline: { color: '#9ca3af', marginTop: 4 },
  authTitle: { fontSize: 28, fontWeight: '700', color: '#f9fafb', textAlign: 'center', marginBottom: 8 },
  authSubtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#f9fafb', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#9ca3af', marginBottom: 32, textAlign: 'center' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#374151', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, color: '#f9fafb', backgroundColor: '#1f2937' },
  errorText: { color: '#ef4444', fontSize: 14, marginBottom: 8 },
  primaryButton: { width: '100%', height: 50, backgroundColor: '#4f46e5', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  primaryButtonText: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
  button: { width: '100%', height: 50, backgroundColor: '#4f46e5', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#f9fafb', fontSize: 16, fontWeight: '600' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#374151' },
  dividerText: { color: '#9ca3af', paddingHorizontal: 16 },
  googleButton: { marginBottom: 16 },
  roleButton: { width: '100%', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#4f46e5' },
  roleButtonText: { color: '#f9fafb', fontSize: 18, fontWeight: '600' },
  roleDescription: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  goalOption: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  goalIcon: { fontSize: 32, marginBottom: 8 },
  goalLabel: { color: '#f9fafb', fontSize: 14, textAlign: 'center' },
  experienceOption: { width: '100%', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  experienceLabel: { color: '#f9fafb', fontSize: 18, fontWeight: '600' },
  experienceDescription: { color: '#9ca3af', fontSize: 14, marginTop: 4 },
  inputLabel: { color: '#f9fafb', fontSize: 14, marginBottom: 8, marginTop: 16 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  certOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#374151' },
  certText: { color: '#f9fafb', fontSize: 14 },
  specialtiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  specialtyChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#374151' },
  specialtyText: { color: '#f9fafb', fontSize: 13 }
});

export default AuthScreen;
