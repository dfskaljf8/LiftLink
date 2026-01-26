/**
 * Settings/Profile Screen - Futuristic 2050 Design
 * User profile, AI features, and account management
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
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField, FutureLogo } from '../../src/components/FuturisticUI';
import { useApp } from '../../src/context/AppContext';

// Icons
const ChevronIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 18L15 12L9 6" stroke={FUTURE_COLORS.textMuted} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const AIIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.secondary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.primary} />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="12" r="9" stroke="url(#aiGrad)" strokeWidth="2" fill="none" />
    <Circle cx="9" cy="10" r="1.5" fill={FUTURE_COLORS.primary} />
    <Circle cx="15" cy="10" r="1.5" fill={FUTURE_COLORS.primary} />
    <Path d="M8 14C9.5 16 14.5 16 16 14" stroke="url(#aiGrad)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

const RocketIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="rocketGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.energy} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.gold} />
      </LinearGradient>
    </Defs>
    <Path d="M12 2C12 2 8 6 8 12C8 16 10 20 12 22C14 20 16 16 16 12C16 6 12 2 12 2Z" fill="url(#rocketGrad)" />
    <Circle cx="12" cy="10" r="2" fill={FUTURE_COLORS.void} />
    <Path d="M8 14L4 16L6 12" fill={FUTURE_COLORS.energy} opacity="0.7" />
    <Path d="M16 14L20 16L18 12" fill={FUTURE_COLORS.energy} opacity="0.7" />
  </Svg>
);

const ChatIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={FUTURE_COLORS.primary} />
        <Stop offset="100%" stopColor={FUTURE_COLORS.accent} />
      </LinearGradient>
    </Defs>
    <Path
      d="M21 11.5C21 16.19 16.97 20 12 20C10.64 20 9.34 19.75 8.14 19.29L3 21L4.71 16.86C3.64 15.36 3 13.5 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z"
      stroke="url(#chatGrad)"
      strokeWidth="2"
      fill="none"
    />
    <Circle cx="8" cy="11" r="1" fill={FUTURE_COLORS.primary} />
    <Circle cx="12" cy="11" r="1" fill={FUTURE_COLORS.primary} />
    <Circle cx="16" cy="11" r="1" fill={FUTURE_COLORS.primary} />
  </Svg>
);

const BellIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M18 8C18 6.4 17.4 4.8 16.2 3.6C15 2.4 13.3 1.8 11.7 2C8.7 2.4 6 5 6 8.2V12L4 16H20L18 12V8Z"
      stroke={FUTURE_COLORS.primary}
      strokeWidth="2"
      fill="none"
    />
    <Path d="M13.73 21C13.55 21.34 13.27 21.63 12.92 21.83C12.57 22.03 12.17 22.13 11.76 22.11C11.36 22.09 10.97 21.96 10.64 21.74C10.31 21.51 10.05 21.2 9.89 20.85" stroke={FUTURE_COLORS.primary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MoonIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke={FUTURE_COLORS.secondary}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

const ShieldIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={FUTURE_COLORS.accent}
      strokeWidth="2"
      fill="none"
    />
    <Path d="M9 12L11 14L15 10" stroke={FUTURE_COLORS.accent} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const DocIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z"
      stroke={FUTURE_COLORS.textSecondary}
      strokeWidth="2"
      fill="none"
    />
    <Path d="M14 2V8H20" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" />
    <Path d="M8 13H16M8 17H12" stroke={FUTURE_COLORS.textSecondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LogoutIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9 21H5C4.47 21 3.96 20.79 3.59 20.41C3.21 20.04 3 19.53 3 19V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H9" stroke={FUTURE_COLORS.error} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 17L21 12L16 7" stroke={FUTURE_COLORS.error} strokeWidth="2" strokeLinecap="round" />
    <Path d="M21 12H9" stroke={FUTURE_COLORS.error} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { user, handleLogout } = useApp();

  const isTrainer = user?.role === 'trainer';

  const SettingsItem = ({ icon, title, subtitle, onPress, showArrow = true, danger = false }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        {icon}
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, danger && styles.settingsTitleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <ChevronIcon />}
    </TouchableOpacity>
  );

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ParticleField count={6} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown}>
            <Text style={styles.title}>Profile</Text>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@email.com'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{isTrainer ? 'Trainer' : 'Member'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* AI Features (Trainers) */}
          {isTrainer && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>AI Features</Text>
              <SettingsItem
                icon={<AIIcon size={20} />}
                title="AI Command Center"
                subtitle="Manage AI insights"
                onPress={() => router.push('/ai-command-center')}
              />
              <SettingsItem
                icon={<RocketIcon size={20} />}
                title="Coaching Hub"
                subtitle="Automation & workflows"
                onPress={() => router.push('/coaching-hub')}
              />
            </Animated.View>
          )}

          {/* General */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <SettingsItem
              icon={<ChatIcon size={20} />}
              title="AI Coach Chat"
              subtitle="Get personalized advice"
              onPress={() => router.push('/ai-chat')}
            />
            <SettingsItem
              icon={<BellIcon size={20} />}
              title="Notifications"
              subtitle="Manage preferences"
              onPress={() => {}}
            />
            <SettingsItem
              icon={<MoonIcon size={20} />}
              title="Appearance"
              subtitle="Dark mode enabled"
              onPress={() => {}}
            />
          </Animated.View>

          {/* Legal */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>
            <SettingsItem
              icon={<ShieldIcon size={20} />}
              title="Privacy Policy"
              onPress={() => router.push('/privacy-policy')}
            />
            <SettingsItem
              icon={<DocIcon size={20} />}
              title="Terms of Service"
              onPress={() => router.push('/terms-of-service')}
            />
          </Animated.View>

          {/* Account */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <SettingsItem
              icon={<LogoutIcon size={20} />}
              title="Log Out"
              onPress={confirmLogout}
              danger
              showArrow={false}
            />
          </Animated.View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <FutureLogo size={24} />
            <Text style={styles.versionText}>LiftLink v1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FUTURE_COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 40,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.3,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: FUTURE_COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: FUTURE_COLORS.primary,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: FUTURE_COLORS.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${FUTURE_COLORS.accent}20`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: FUTURE_COLORS.accent,
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: FUTURE_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    padding: 16,
    paddingBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: FUTURE_COLORS.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconDanger: {
    backgroundColor: `${FUTURE_COLORS.error}15`,
  },
  settingsContent: {
    flex: 1,
    marginLeft: 14,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  settingsTitleDanger: {
    color: FUTURE_COLORS.error,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    opacity: 0.6,
  },
  versionText: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginLeft: 8,
  },
});
