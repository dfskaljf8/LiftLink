/**
 * Tree Screen - Futuristic 2050 Design
 * Gamification - Holographic progress tree
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, RadialGradient, Stop, G, Ellipse } from 'react-native-svg';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
} from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField } from '../../src/components/FuturisticUI';
import { useApp } from '../../src/context/AppContext';

// Futuristic Tree SVG Component
const HolographicTree = ({ stage, size = 220 }) => {
  const stages = {
    seed: { scale: 0.3, foliageSize: 15 },
    sprout: { scale: 0.5, foliageSize: 25 },
    sapling: { scale: 0.7, foliageSize: 35 },
    young_tree: { scale: 0.85, foliageSize: 45 },
    mature_tree: { scale: 1.0, foliageSize: 55 },
  };

  const currentStage = stages[stage] || stages.seed;
  const foliageSize = currentStage.foliageSize;

  return (
    <View style={[styles.treeContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#4A3728" />
            <Stop offset="50%" stopColor="#6B4423" />
            <Stop offset="100%" stopColor="#4A3728" />
          </LinearGradient>
          <LinearGradient id="foliageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.accent} />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primary} />
          </LinearGradient>
          <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primary} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="energyGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor={FUTURE_COLORS.primary} stopOpacity="0" />
            <Stop offset="50%" stopColor={FUTURE_COLORS.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={FUTURE_COLORS.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Ground glow */}
        <Ellipse cx="60" cy="105" rx="40" ry="8" fill={FUTURE_COLORS.primary} opacity="0.15" />
        <Ellipse cx="60" cy="105" rx="25" ry="5" fill={FUTURE_COLORS.primary} opacity="0.3" />

        {/* Trunk */}
        <Path
          d="M55 100 L55 70 C55 65 50 60 50 50 L50 50 C50 55 55 55 60 55 C65 55 70 55 70 50 L70 50 C70 60 65 65 65 70 L65 100 Z"
          fill="url(#trunkGrad)"
          opacity={currentStage.scale}
        />

        {/* Energy flow line on trunk */}
        <Path
          d="M60 100 L60 55"
          stroke="url(#energyGrad)"
          strokeWidth="2"
          opacity={currentStage.scale * 0.5}
        />

        {/* Foliage layers - holographic style */}
        <G opacity={currentStage.scale}>
          {/* Back layer glow */}
          <Circle cx="60" cy="35" r={foliageSize + 10} fill="url(#glowGrad)" />
          
          {/* Main foliage */}
          <Circle cx="60" cy="35" r={foliageSize} fill="url(#foliageGrad)" />
          <Circle cx="42" cy="50" r={foliageSize * 0.7} fill="url(#foliageGrad)" opacity="0.9" />
          <Circle cx="78" cy="50" r={foliageSize * 0.7} fill="url(#foliageGrad)" opacity="0.9" />
          
          {/* Highlight */}
          <Circle cx="55" cy="28" r={foliageSize * 0.3} fill="#FFFFFF" opacity="0.2" />
        </G>

        {/* Energy particles around tree */}
        {currentStage.scale > 0.5 && (
          <G>
            <Circle cx="35" cy="30" r="2" fill={FUTURE_COLORS.primary} opacity="0.6" />
            <Circle cx="85" cy="35" r="2" fill={FUTURE_COLORS.accent} opacity="0.6" />
            <Circle cx="45" cy="60" r="1.5" fill={FUTURE_COLORS.primary} opacity="0.5" />
            <Circle cx="75" cy="65" r="1.5" fill={FUTURE_COLORS.accent} opacity="0.5" />
          </G>
        )}
      </Svg>
    </View>
  );
};

// Check Icon
const CheckIcon = ({ size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 12L10 17L20 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
  </Svg>
);

// Bulb Icon
const BulbIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 21H15M12 3C8.69 3 6 5.69 6 9C6 11.22 7.21 13.15 9 14.19V17C9 17.55 9.45 18 10 18H14C14.55 18 15 17.55 15 17V14.19C16.79 13.15 18 11.22 18 9C18 5.69 15.31 3 12 3Z"
      stroke={FUTURE_COLORS.gold}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

export default function TreeScreen() {
  const { treeProgress } = useApp();

  const stages = [
    { id: 'seed', label: 'Seed', sessions: 0, icon: '🌱' },
    { id: 'sprout', label: 'Sprout', sessions: 5, icon: '🌿' },
    { id: 'sapling', label: 'Sapling', sessions: 15, icon: '🌳' },
    { id: 'young_tree', label: 'Young Tree', sessions: 30, icon: '🌲' },
    { id: 'mature_tree', label: 'Mature Tree', sessions: 50, icon: '🏆' },
  ];

  const currentLevel = treeProgress?.current_level || 'seed';
  const currentIndex = stages.findIndex((s) => s.id === currentLevel);
  const totalSessions = treeProgress?.total_sessions || 0;

  return (
    <View style={styles.container}>
      <ParticleField count={10} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown}>
            <Text style={styles.title}>Growth Journey</Text>
          </Animated.View>

          {/* Tree Visualization */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.treeCard}>
            <View style={styles.treeGlow} />
            <HolographicTree stage={currentLevel} size={220} />
            <Text style={styles.levelText}>
              {currentLevel.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.sessionsText}>
              {totalSessions} sessions completed
            </Text>
            
            {/* Progress to next level */}
            {currentIndex < stages.length - 1 && (
              <View style={styles.nextLevelContainer}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${Math.min(100, (totalSessions / stages[currentIndex + 1].sessions) * 100)}%` 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.nextLevelText}>
                  {stages[currentIndex + 1].sessions - totalSessions} sessions to {stages[currentIndex + 1].label}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Progress Stages */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.sectionTitle}>Evolution Path</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300)} style={styles.progressCard}>
            {stages.map((stage, index) => {
              const isComplete = index <= currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <View key={stage.id} style={styles.stageRow}>
                  <View style={styles.stageIndicatorContainer}>
                    <View
                      style={[
                        styles.stageIndicator,
                        isComplete && styles.stageIndicatorComplete,
                        isCurrent && styles.stageIndicatorCurrent,
                      ]}
                    >
                      {isComplete ? <CheckIcon /> : <Text style={styles.stageNumber}>{index + 1}</Text>}
                    </View>
                    {index < stages.length - 1 && (
                      <View style={[styles.stageLine, isComplete && styles.stageLineComplete]} />
                    )}
                  </View>
                  <View style={styles.stageInfo}>
                    <View style={styles.stageHeader}>
                      <Text style={styles.stageIcon}>{stage.icon}</Text>
                      <Text style={[styles.stageLabel, isComplete && styles.stageLabelComplete]}>
                        {stage.label}
                      </Text>
                    </View>
                    <Text style={styles.stageSessions}>
                      {stage.sessions} sessions required
                    </Text>
                  </View>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Now</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </Animated.View>

          {/* Tips */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <BulbIcon />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Keep Growing!</Text>
              <Text style={styles.tipText}>
                Complete more sessions to evolve your tree. Each workout brings you closer to the next level!
              </Text>
            </View>
          </Animated.View>

          {/* Bottom padding */}
          <View style={{ height: 100 }} />
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginBottom: 24,
  },
  treeCard: {
    backgroundColor: FUTURE_COLORS.surface,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  treeGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
    borderRadius: 100,
    backgroundColor: FUTURE_COLORS.primary,
    opacity: 0.05,
  },
  treeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 22,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
    marginTop: 16,
    textTransform: 'capitalize',
    letterSpacing: 1,
  },
  sessionsText: {
    fontSize: 14,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 6,
  },
  nextLevelContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '80%',
    height: 6,
    backgroundColor: FUTURE_COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: FUTURE_COLORS.primary,
    borderRadius: 3,
  },
  nextLevelText: {
    fontSize: 12,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: FUTURE_COLORS.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  stageIndicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stageIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FUTURE_COLORS.elevated,
    borderWidth: 2,
    borderColor: FUTURE_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageIndicatorComplete: {
    backgroundColor: FUTURE_COLORS.accent,
    borderColor: FUTURE_COLORS.accent,
  },
  stageIndicatorCurrent: {
    borderColor: FUTURE_COLORS.primary,
    borderWidth: 3,
    shadowColor: FUTURE_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  stageNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: FUTURE_COLORS.textMuted,
  },
  stageLine: {
    width: 2,
    height: 28,
    backgroundColor: FUTURE_COLORS.border,
    marginTop: 4,
  },
  stageLineComplete: {
    backgroundColor: FUTURE_COLORS.accent,
  },
  stageInfo: {
    flex: 1,
    paddingTop: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  stageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: FUTURE_COLORS.textSecondary,
  },
  stageLabelComplete: {
    color: FUTURE_COLORS.text,
  },
  stageSessions: {
    fontSize: 12,
    color: FUTURE_COLORS.textMuted,
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: FUTURE_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  currentBadgeText: {
    color: FUTURE_COLORS.void,
    fontSize: 11,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: `${FUTURE_COLORS.gold}15`,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${FUTURE_COLORS.gold}30`,
  },
  tipIcon: {
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: FUTURE_COLORS.gold,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    lineHeight: 18,
  },
});
