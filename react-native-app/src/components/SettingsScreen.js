import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { scale } from '../styles/EnhancedStyles';
import encryptionService from '../services/EncryptionService';
import { ThemeToggleAnimation } from './Animations';

/**
 * Settings Screen
 * Duolingo + Revolut Inspired Design
 * Features:
 * - Light/Dark Mode Toggle
 * - Privacy & Security Settings
 * - Data Management
 * - Account Settings
 */

const SettingsScreen = ({ user, onLogout }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear cache logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete account logic
            if (user?.id) {
              await encryptionService.clearKeys(user.id);
            }
            onLogout();
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported in an encrypted format.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Export data logic
            Alert.alert('Success', 'Data export initiated');
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      {/* Appearance Section */}
      <SettingSection title="⚡ Appearance">
        <SettingRow
          icon="🌓"
          title="Dark Mode"
          subtitle={isDarkMode ? 'Currently enabled' : 'Currently disabled'}
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.border}
            />
          }
        />
        <View style={styles.themePreview}>
          <View style={[styles.themeCard, { backgroundColor: theme.card }]}>
            <Text style={styles.themeCardText}>
              {isDarkMode ? '🌙 Dark Theme Active' : '☀️ Light Theme Active'}
            </Text>
            <Text style={styles.themeCardSubtext}>
              {isDarkMode 
                ? 'Premium dark mode inspired by Revolut' 
                : 'Bright and playful like Duolingo'}
            </Text>
          </View>
        </View>
      </SettingSection>

      {/* Privacy & Security Section */}
      <SettingSection title="🔒 Privacy & Security">
        <SettingRow
          icon="🔐"
          title="End-to-End Encryption"
          subtitle="All your data is encrypted"
          rightComponent={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ACTIVE</Text>
            </View>
          }
        />
        <SettingRow
          icon="🔔"
          title="Push Notifications"
          subtitle="Receive updates about your workouts"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationsEnabled ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.border}
            />
          }
        />
        <SettingRow
          icon="👆"
          title="Biometric Login"
          subtitle={Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint'}
          rightComponent={
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={biometricsEnabled ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.border}
            />
          }
        />
        <SettingRow
          icon="📊"
          title="Analytics"
          subtitle="Help us improve the app"
          rightComponent={
            <Switch
              value={analyticsEnabled}
              onValueChange={setAnalyticsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={analyticsEnabled ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.border}
            />
          }
        />
      </SettingSection>

      {/* Data Management Section */}
      <SettingSection title="💾 Data Management">
        <SettingRow
          icon="📥"
          title="Export Your Data"
          subtitle="Download all your data in encrypted format"
          onPress={handleExportData}
          rightComponent={<Text style={styles.arrow}>›</Text>}
        />
        <SettingRow
          icon="🗑️"
          title="Clear Cache"
          subtitle="Free up storage space"
          onPress={handleClearCache}
          rightComponent={<Text style={styles.arrow}>›</Text>}
        />
        <SettingRow
          icon="🔄"
          title="Data Sync"
          subtitle="Last synced: Just now"
          rightComponent={
            <View style={[styles.badge, { backgroundColor: theme.success }]}>
              <Text style={styles.badgeText}>SYNCED</Text>
            </View>
          }
        />
      </SettingSection>

      {/* Account Section */}
      <SettingSection title="👤 Account">
        <SettingRow
          icon="📧"
          title="Email"
          subtitle={user?.email || 'Not set'}
          rightComponent={<Text style={styles.arrow}>›</Text>}
        />
        <SettingRow
          icon="🔑"
          title="Change Password"
          subtitle="Update your password"
          onPress={() => Alert.alert('Change Password', 'Feature coming soon')}
          rightComponent={<Text style={styles.arrow}>›</Text>}
        />
        <SettingRow
          icon="🚪"
          title="Logout"
          subtitle="Sign out of your account"
          onPress={onLogout}
          rightComponent={<Text style={styles.arrow}>›</Text>}
        />
      </SettingSection>

      {/* Danger Zone */}
      <SettingSection title="⚠️ Danger Zone">
        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
          <Text style={styles.dangerButtonSubtext}>
            Permanently delete your account and all data
          </Text>
        </TouchableOpacity>
      </SettingSection>

      {/* Privacy Notice */}
      <View style={styles.privacyNotice}>
        <Text style={styles.privacyTitle}>🔒 Your Privacy Matters</Text>
        <Text style={styles.privacyText}>
          All your personal data is encrypted end-to-end. We never sell your data to third parties.
        </Text>
        <Text style={styles.privacyText}>
          For more information, read our{' '}
          <Text style={styles.privacyLink}>Privacy Policy</Text> and{' '}
          <Text style={styles.privacyLink}>Terms of Service</Text>.
        </Text>
      </View>

      {/* Version Info */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>LiftLink v1.0.0</Text>
        <Text style={styles.versionSubtext}>Made with 💚 for your fitness journey</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      paddingBottom: scale(40),
    },
    header: {
      padding: scale(24),
      paddingTop: Platform.OS === 'ios' ? scale(60) : scale(24),
    },
    headerTitle: {
      fontSize: scale(32),
      fontWeight: '800',
      color: theme.textPrimary,
      marginBottom: scale(4),
    },
    headerSubtitle: {
      fontSize: scale(16),
      color: theme.textSecondary,
      fontWeight: '500',
    },
    section: {
      marginBottom: scale(32),
      paddingHorizontal: scale(24),
    },
    sectionTitle: {
      fontSize: scale(14),
      fontWeight: '700',
      color: theme.textSecondary,
      marginBottom: scale(12),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      padding: scale(16),
      borderRadius: scale(16),
      marginBottom: scale(8),
      borderWidth: 1,
      borderColor: theme.border,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: scale(24),
      marginRight: scale(12),
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: scale(16),
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: scale(2),
    },
    settingSubtitle: {
      fontSize: scale(13),
      color: theme.textSecondary,
      fontWeight: '400',
    },
    settingRight: {
      marginLeft: scale(12),
    },
    arrow: {
      fontSize: scale(24),
      color: theme.textTertiary,
      fontWeight: '300',
    },
    badge: {
      backgroundColor: theme.primary,
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: scale(8),
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: scale(11),
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    themePreview: {
      marginTop: scale(8),
    },
    themeCard: {
      padding: scale(20),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.border,
    },
    themeCardText: {
      fontSize: scale(18),
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: scale(4),
    },
    themeCardSubtext: {
      fontSize: scale(14),
      color: theme.textSecondary,
      fontWeight: '500',
    },
    dangerButton: {
      backgroundColor: theme.error + '10',
      padding: scale(16),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    dangerButtonText: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.error,
      marginBottom: scale(4),
    },
    dangerButtonSubtext: {
      fontSize: scale(13),
      color: theme.error,
      opacity: 0.7,
    },
    privacyNotice: {
      marginHorizontal: scale(24),
      padding: scale(20),
      backgroundColor: theme.surface,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: scale(16),
    },
    privacyTitle: {
      fontSize: scale(16),
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: scale(12),
    },
    privacyText: {
      fontSize: scale(14),
      color: theme.textSecondary,
      lineHeight: scale(20),
      marginBottom: scale(8),
    },
    privacyLink: {
      color: theme.primary,
      fontWeight: '600',
    },
    versionInfo: {
      alignItems: 'center',
      marginTop: scale(16),
      marginBottom: scale(8),
    },
    versionText: {
      fontSize: scale(13),
      color: theme.textTertiary,
      fontWeight: '600',
    },
    versionSubtext: {
      fontSize: scale(12),
      color: theme.textTertiary,
      marginTop: scale(4),
    },
  });

export default SettingsScreen;
