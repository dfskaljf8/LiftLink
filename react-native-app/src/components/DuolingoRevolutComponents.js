import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { scale } from '../styles/EnhancedStyles';

/**
 * Duolingo + Revolut Inspired UI Components
 * 
 * Design Principles:
 * - Duolingo: Bright, playful, gamified, encouraging
 * - Revolut: Clean, premium, minimalist, sophisticated
 * 
 * Key Characteristics:
 * - Bold typography
 * - High contrast
 * - Generous whitespace
 * - Smooth animations
 * - Clear hierarchy
 * - Friendly micro-copy
 */

// DUOLINGO-STYLE SUCCESS CARD
export const SuccessCard = ({ theme, title, subtitle, emoji = '🎉', onContinue }) => (
  <View style={[styles.successCard, { backgroundColor: theme.card, borderColor: theme.success }]}>
    <Text style={styles.successEmoji}>{emoji}</Text>
    <Text style={[styles.successTitle, { color: theme.textPrimary }]}>{title}</Text>
    <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    {onContinue && (
      <TouchableOpacity
        style={[styles.successButton, { backgroundColor: theme.primary }]}
        onPress={onContinue}
      >
        <Text style={styles.successButtonText}>Continue</Text>
      </TouchableOpacity>
    )}
  </View>
);

// REVOLUT-STYLE STAT CARD
export const StatCard = ({ theme, value, label, trend, trendValue }) => (
  <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    {trend && (
      <View style={styles.statTrend}>
        <Text style={[styles.statTrendText, { color: trend === 'up' ? theme.success : theme.error }]}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </Text>
      </View>
    )}
  </View>
);

// DUOLINGO-STYLE STREAK DISPLAY
export const StreakDisplay = ({ theme, days, onPress }) => (
  <TouchableOpacity
    style={[styles.streakCard, { backgroundColor: theme.streak + '20', borderColor: theme.streak }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.streakContent}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <View style={styles.streakText}>
        <Text style={[styles.streakDays, { color: theme.textPrimary }]}>{days} day streak!</Text>
        <Text style={[styles.streakSubtext, { color: theme.textSecondary }]}>Keep it going!</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// REVOLUT-STYLE ACTION BUTTON
export const ActionButton = ({ theme, title, subtitle, icon, onPress, variant = 'primary' }) => {
  const backgroundColor = variant === 'primary' ? theme.primary : theme.card;
  const textColor = variant === 'primary' ? '#FFFFFF' : theme.textPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor, borderColor: variant === 'secondary' ? theme.border : 'transparent' },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.actionButtonContent}>
        {icon && <Text style={styles.actionButtonIcon}>{icon}</Text>}
        <View style={styles.actionButtonText}>
          <Text style={[styles.actionButtonTitle, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.actionButtonSubtitle, { color: textColor, opacity: 0.7 }]}>
              {subtitle}
            </Text>
          )}
        </View>
        <Text style={[styles.actionButtonArrow, { color: textColor }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

// DUOLINGO-STYLE PROGRESS RING
export const ProgressRing = ({ theme, progress, size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <Animated.View style={styles.progressRingInner}>
        <Text style={[styles.progressText, { color: theme.textPrimary }]}>{progress}%</Text>
      </Animated.View>
    </View>
  );
};

// REVOLUT-STYLE SEGMENTED CONTROL
export const SegmentedControl = ({ theme, options, selected, onSelect }) => (
  <View style={[styles.segmentedControl, { backgroundColor: theme.surface, borderColor: theme.border }]}>
    {options.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.segment,
          selected === index && { backgroundColor: theme.primary },
        ]}
        onPress={() => onSelect(index)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.segmentText,
            { color: selected === index ? '#FFFFFF' : theme.textSecondary },
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// DUOLINGO-STYLE LESSON CARD
export const LessonCard = ({ theme, title, subtitle, progress, emoji, locked, onPress }) => (
  <TouchableOpacity
    style={[
      styles.lessonCard,
      { backgroundColor: theme.card, borderColor: theme.border },
      locked && { opacity: 0.5 },
    ]}
    onPress={!locked ? onPress : null}
    disabled={locked}
    activeOpacity={0.8}
  >
    <View style={styles.lessonEmoji}>
      <Text style={styles.lessonEmojiText}>{locked ? '🔒' : emoji}</Text>
    </View>
    <View style={styles.lessonContent}>
      <Text style={[styles.lessonTitle, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.lessonSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      {progress !== undefined && !locked && (
        <View style={[styles.lessonProgress, { backgroundColor: theme.surface }]}>
          <View
            style={[
              styles.lessonProgressFill,
              { width: `${progress}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// REVOLUT-STYLE INFO CARD
export const InfoCard = ({ theme, title, description, icon, type = 'info' }) => {
  const backgroundColor =
    type === 'success'
      ? theme.success + '15'
      : type === 'warning'
      ? theme.warning + '15'
      : type === 'error'
      ? theme.error + '15'
      : theme.info + '15';

  const borderColor =
    type === 'success'
      ? theme.success
      : type === 'warning'
      ? theme.warning
      : type === 'error'
      ? theme.error
      : theme.info;

  return (
    <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
      {icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <View style={styles.infoContent}>
        <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
};

// DUOLINGO-STYLE ACHIEVEMENT BADGE
export const AchievementBadge = ({ theme, title, emoji, unlocked, onPress }) => (
  <TouchableOpacity
    style={[
      styles.achievementBadge,
      { backgroundColor: theme.card, borderColor: unlocked ? theme.achievement : theme.border },
      !unlocked && { opacity: 0.5 },
    ]}
    onPress={onPress}
    disabled={!unlocked}
    activeOpacity={0.8}
  >
    <Text style={[styles.achievementEmoji, !unlocked && styles.achievementLocked]}>
      {unlocked ? emoji : '❓'}
    </Text>
    <Text style={[styles.achievementTitle, { color: theme.textPrimary }]} numberOfLines={2}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // Success Card (Duolingo-inspired)
  successCard: {
    padding: scale(24),
    borderRadius: scale(20),
    alignItems: 'center',
    borderWidth: 2,
    marginVertical: scale(16),
  },
  successEmoji: {
    fontSize: scale(64),
    marginBottom: scale(16),
  },
  successTitle: {
    fontSize: scale(24),
    fontWeight: '800',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: scale(16),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: scale(20),
  },
  successButton: {
    paddingHorizontal: scale(40),
    paddingVertical: scale(14),
    borderRadius: scale(30),
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '700',
  },

  // Stat Card (Revolut-inspired)
  statCard: {
    padding: scale(20),
    borderRadius: scale(16),
    borderWidth: 1,
    minWidth: scale(120),
  },
  statValue: {
    fontSize: scale(32),
    fontWeight: '800',
    marginBottom: scale(4),
  },
  statLabel: {
    fontSize: scale(13),
    fontWeight: '600',
  },
  statTrend: {
    marginTop: scale(8),
  },
  statTrendText: {
    fontSize: scale(14),
    fontWeight: '700',
  },

  // Streak Display (Duolingo-inspired)
  streakCard: {
    borderRadius: scale(16),
    borderWidth: 2,
    padding: scale(16),
    marginVertical: scale(8),
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: scale(40),
    marginRight: scale(12),
  },
  streakText: {
    flex: 1,
  },
  streakDays: {
    fontSize: scale(18),
    fontWeight: '800',
  },
  streakSubtext: {
    fontSize: scale(14),
    fontWeight: '500',
  },

  // Action Button (Revolut-inspired)
  actionButton: {
    borderRadius: scale(16),
    padding: scale(16),
    marginVertical: scale(6),
    borderWidth: 1,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: scale(24),
    marginRight: scale(12),
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: scale(2),
  },
  actionButtonSubtitle: {
    fontSize: scale(13),
    fontWeight: '500',
  },
  actionButtonArrow: {
    fontSize: scale(24),
    fontWeight: '300',
  },

  // Progress Ring (Duolingo-inspired)
  progressRing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: scale(18),
    fontWeight: '800',
  },

  // Segmented Control (Revolut-inspired)
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: scale(12),
    padding: scale(4),
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: scale(10),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  segmentText: {
    fontSize: scale(14),
    fontWeight: '700',
  },

  // Lesson Card (Duolingo-inspired)
  lessonCard: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
    marginVertical: scale(8),
    alignItems: 'center',
  },
  lessonEmoji: {
    width: scale(60),
    height: scale(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  lessonEmojiText: {
    fontSize: scale(40),
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: scale(4),
  },
  lessonSubtitle: {
    fontSize: scale(13),
    fontWeight: '500',
    marginBottom: scale(8),
  },
  lessonProgress: {
    height: scale(6),
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: '100%',
    borderRadius: scale(3),
  },

  // Info Card (Revolut-inspired)
  infoCard: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 1,
    marginVertical: scale(8),
  },
  infoIcon: {
    fontSize: scale(24),
    marginRight: scale(12),
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: scale(4),
  },
  infoDescription: {
    fontSize: scale(14),
    fontWeight: '500',
    lineHeight: scale(20),
  },

  // Achievement Badge (Duolingo-inspired)
  achievementBadge: {
    padding: scale(16),
    borderRadius: scale(16),
    borderWidth: 2,
    alignItems: 'center',
    width: scale(100),
    marginHorizontal: scale(8),
  },
  achievementEmoji: {
    fontSize: scale(40),
    marginBottom: scale(8),
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: scale(12),
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default {
  SuccessCard,
  StatCard,
  StreakDisplay,
  ActionButton,
  ProgressRing,
  SegmentedControl,
  LessonCard,
  InfoCard,
  AchievementBadge,
};
