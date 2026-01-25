/**
 * Settings Screen
 * User settings, AI features access, and account management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, colors, handleLogout } = useApp();

  const isTrainer = user?.role === 'trainer';

  const SettingsItem = ({ icon, title, subtitle, onPress, showArrow = true, danger = false }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={[styles.settingsIcon, { backgroundColor: danger ? '#ef444420' : colors.primary + '20' }]}>
        <Ionicons name={icon} size={20} color={danger ? '#ef4444' : colors.primary} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, { color: danger ? '#ef4444' : colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user?.email || 'user@email.com'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.roleText, { color: colors.accent }]}>
                {isTrainer ? 'Trainer' : 'Trainee'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Features (Trainers) */}
        {isTrainer && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>AI Features</Text>
            <SettingsItem
              icon="analytics-outline"
              title="AI Command Center"
              subtitle="Manage AI suggestions and insights"
              onPress={() => router.push('/ai-command-center')}
            />
            <SettingsItem
              icon="rocket-outline"
              title="Coaching Hub"
              subtitle="Automation and workflows"
              onPress={() => router.push('/coaching-hub')}
            />
          </View>
        )}

        {/* General */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
          <SettingsItem
            icon="chatbubbles-outline"
            title="AI Coach Chat"
            subtitle="Get personalized fitness advice"
            onPress={() => router.push('/ai-chat')}
          />
          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => {}}
          />
          <SettingsItem
            icon="moon-outline"
            title="Appearance"
            subtitle="Dark mode is enabled"
            onPress={() => {}}
          />
        </View>

        {/* Legal */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal</Text>
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
          />
          <SettingsItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => router.push('/terms-of-service')}
          />
        </View>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          <SettingsItem
            icon="log-out-outline"
            title="Log Out"
            onPress={confirmLogout}
            danger
            showArrow={false}
          />
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          LiftLink v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    padding: 16,
    paddingBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});
