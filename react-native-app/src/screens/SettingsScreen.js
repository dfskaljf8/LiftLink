import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { AppContext } from '../../App';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const SettingsScreen = ({ navigation }) => {
  const { colors, user, setUser, handleLogout } = useContext(AppContext);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name || '');
  const [editedGoals, setEditedGoals] = useState(user.fitness_goals || []);
  const [editedExperienceLevel, setEditedExperienceLevel] = useState(user.experience_level || 'beginner');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const fitnessGoals = ['Weight Loss', 'Muscle Building', 'Cardio', 'Strength Training', 'Flexibility', 'General Fitness', 'Sports Performance', 'Rehabilitation'];
  const experienceLevels = [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }];

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updatedProfile = { name: editedName, fitness_goals: editedGoals, experience_level: editedExperienceLevel, dark_mode: darkMode };
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
    setEditedGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]);
  };

  const renderProfileSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>Profile Information</Text>
      {editing ? (
        <View style={styles.editingContainer}>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput style={[styles.textInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.textSecondary }]} value={editedName} onChangeText={setEditedName} placeholder="Enter your name" placeholderTextColor={colors.textSecondary} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Fitness Goals</Text>
            <View style={styles.goalsContainer}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity key={goal} style={[styles.goalChip, { backgroundColor: editedGoals.includes(goal) ? colors.primary : colors.background, borderColor: colors.primary }]} onPress={() => handleGoalToggle(goal)}>
                  <Text style={[styles.goalChipText, { color: colors.text }]}>{goal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Experience Level</Text>
            <View style={styles.experienceContainer}>
              {experienceLevels.map((level) => (
                <TouchableOpacity key={level.value} style={[styles.experienceButton, { backgroundColor: editedExperienceLevel === level.value ? colors.primary : colors.background, borderColor: colors.primary }]} onPress={() => setEditedExperienceLevel(level.value)}>
                  <Text style={[styles.experienceButtonText, { color: colors.text }]}>{level.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.success }]} onPress={handleSaveProfile} disabled={loading}>
              {loading ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={[styles.saveButtonText, { color: colors.text }]}>Save Changes</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]} onPress={() => { setEditing(false); setEditedName(user.name || ''); setEditedGoals(user.fitness_goals || []); setEditedExperienceLevel(user.experience_level || 'beginner'); }}>
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <View style={styles.profileRow}><Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Name:</Text><Text style={[styles.profileValue, { color: colors.text }]}>{user.name}</Text></View>
          <View style={styles.profileRow}><Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Email:</Text><Text style={[styles.profileValue, { color: colors.text }]}>{user.email}</Text></View>
          <View style={styles.profileRow}><Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Role:</Text><Text style={[styles.profileValue, { color: colors.text }]}>{user.role === 'trainer' ? 'Fitness Trainer' : 'Fitness Enthusiast'}</Text></View>
          <View style={styles.profileRow}><Text style={[styles.profileLabel, { color: colors.textSecondary }]}>Experience:</Text><Text style={[styles.profileValue, { color: colors.text }]}>{user.experience_level?.charAt(0).toUpperCase() + user.experience_level?.slice(1)}</Text></View>
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
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => setEditing(true)}>
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
        <TouchableOpacity style={[styles.toggleButton, { backgroundColor: darkMode ? colors.primary : colors.textSecondary }]} onPress={() => setDarkMode(!darkMode)}>
          <Text style={[styles.toggleButtonText, { color: colors.text }]}>{darkMode ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>Account</Text>
      <View style={styles.accountInfo}>
        <View style={styles.accountRow}><Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Member Since:</Text><Text style={[styles.accountValue, { color: colors.text }]}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</Text></View>
        <View style={styles.accountRow}><Text style={[styles.accountLabel, { color: colors.textSecondary }]}>Verification Status:</Text><Text style={[styles.accountValue, { color: user.age_verified ? colors.success : colors.warning }]}>{user.age_verified ? 'Verified' : 'Pending'}</Text></View>
      </View>
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={() => { Alert.alert('Logout', 'Are you sure you want to logout?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: handleLogout }]); }}>
        <Text style={[styles.logoutButtonText, { color: colors.text }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeaturesSection = () => (
    <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.settingsCardTitle, { color: colors.text }]}>LiftLink 2.0 Features</Text>
      {user.role !== 'trainer' && (
        <>
          <TouchableOpacity style={[styles.featureRow, { borderBottomColor: colors.textSecondary + '30' }]} onPress={() => navigation?.navigate('VibeOnboarding')}>
            <View style={styles.featureIcon}><Icon name="mood" size={24} color={colors.primary} /></View>
            <View style={styles.featureInfo}><Text style={[styles.featureName, { color: colors.text }]}>Change Your Vibe</Text><Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Update your coaching style preference</Text></View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.featureRow, { borderBottomColor: colors.textSecondary + '30' }]} onPress={() => navigation?.navigate('SwipeDiscovery')}>
            <View style={styles.featureIcon}><Icon name="swipe" size={24} color="#ec4899" /></View>
            <View style={styles.featureInfo}><Text style={[styles.featureName, { color: colors.text }]}>Discover Trainers</Text><Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Swipe to find your perfect coach</Text></View>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity style={[styles.featureRow, { borderBottomColor: colors.textSecondary + '30' }]} onPress={() => navigation?.navigate('Calendar')}>
        <View style={styles.featureIcon}><Icon name="event" size={24} color="#3b82f6" /></View>
        <View style={styles.featureInfo}><Text style={[styles.featureName, { color: colors.text }]}>Calendar Scheduling</Text><Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Schedule and manage your sessions</Text></View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.featureRow, { borderBottomWidth: 0 }]} onPress={() => navigation?.navigate('Payment')}>
        <View style={styles.featureIcon}><Icon name="payment" size={24} color="#10b981" /></View>
        <View style={styles.featureInfo}><Text style={[styles.featureName, { color: colors.text }]}>Payment Methods</Text><Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Manage your payment options</Text></View>
        <Icon name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>
        {renderProfileSection()}
        {renderFeaturesSection()}
        {renderAppearanceSection()}
        {renderAccountSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  settingsCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
  settingsCardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  editingContainer: {},
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 8 },
  textInput: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  goalsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  goalChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  goalChipText: { fontSize: 12 },
  experienceContainer: { flexDirection: 'row' },
  experienceButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, marginRight: 8, alignItems: 'center' },
  experienceButtonText: { fontSize: 14 },
  editButtonsContainer: { flexDirection: 'row', marginTop: 16 },
  saveButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginRight: 8 },
  saveButtonText: { fontSize: 14, fontWeight: '600' },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: '600' },
  profileContainer: {},
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  profileColumn: { marginBottom: 12 },
  profileLabel: { fontSize: 14 },
  profileValue: { fontSize: 14, fontWeight: '500' },
  goalsDisplay: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  goalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  goalBadgeText: { fontSize: 12 },
  editButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  editButtonText: { fontSize: 14, fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingLabel: { fontSize: 16 },
  toggleButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  toggleButtonText: { fontSize: 12, fontWeight: '600' },
  accountInfo: { marginBottom: 16 },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  accountLabel: { fontSize: 14 },
  accountValue: { fontSize: 14, fontWeight: '500' },
  logoutButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { fontSize: 14, fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  featureInfo: { flex: 1 },
  featureName: { fontSize: 16, fontWeight: '500' },
  featureDesc: { fontSize: 12, marginTop: 2 }
});

export default SettingsScreen;
