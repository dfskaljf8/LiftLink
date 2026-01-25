/**
 * Tree Screen
 * Gamification - Progress tree visualization
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import Svg, { Circle, Path, G } from 'react-native-svg';

// Simple Tree SVG Component
const TreeSVG = ({ stage, size = 200, colors }) => {
  const stages = {
    seed: { scale: 0.3, color: '#8B4513' },
    sprout: { scale: 0.5, color: '#22c55e' },
    sapling: { scale: 0.7, color: '#16a34a' },
    young_tree: { scale: 0.85, color: '#15803d' },
    mature_tree: { scale: 1.0, color: '#166534' },
  };

  const currentStage = stages[stage] || stages.seed;

  return (
    <View style={[styles.treeContainer, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Trunk */}
        <Path
          d="M45 90 L45 60 L55 60 L55 90 Z"
          fill="#8B4513"
          opacity={currentStage.scale}
        />
        {/* Tree Crown */}
        <Circle
          cx="50"
          cy="40"
          r={30 * currentStage.scale}
          fill={currentStage.color}
        />
        {stage !== 'seed' && (
          <Circle
            cx="35"
            cy="50"
            r={20 * currentStage.scale}
            fill={currentStage.color}
          />
        )}
        {stage !== 'seed' && (
          <Circle
            cx="65"
            cy="50"
            r={20 * currentStage.scale}
            fill={currentStage.color}
          />
        )}
      </Svg>
    </View>
  );
};

export default function TreeScreen() {
  const { colors, treeProgress } = useApp();

  const stages = [
    { id: 'seed', label: 'Seed', sessions: 0 },
    { id: 'sprout', label: 'Sprout', sessions: 5 },
    { id: 'sapling', label: 'Sapling', sessions: 15 },
    { id: 'young_tree', label: 'Young Tree', sessions: 30 },
    { id: 'mature_tree', label: 'Mature Tree', sessions: 50 },
  ];

  const currentLevel = treeProgress?.current_level || 'seed';
  const currentIndex = stages.findIndex((s) => s.id === currentLevel);
  const totalSessions = treeProgress?.total_sessions || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>My Growth Tree 🌳</Text>

        {/* Tree Visualization */}
        <View style={[styles.treeCard, { backgroundColor: colors.surface }]}>
          <TreeSVG stage={currentLevel} size={200} colors={colors} />
          <Text style={[styles.levelText, { color: colors.text }]}>
            {currentLevel.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={[styles.sessionsText, { color: colors.textSecondary }]}>
            {totalSessions} sessions completed
          </Text>
        </View>

        {/* Progress Stages */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Growth Journey</Text>
        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          {stages.map((stage, index) => {
            const isComplete = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <View key={stage.id} style={styles.stageRow}>
                <View
                  style={[
                    styles.stageIndicator,
                    {
                      backgroundColor: isComplete ? colors.accent : colors.border,
                      borderColor: isCurrent ? colors.primary : 'transparent',
                      borderWidth: isCurrent ? 2 : 0,
                    },
                  ]}
                >
                  {isComplete && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <View style={styles.stageInfo}>
                  <Text
                    style={[
                      styles.stageLabel,
                      { color: isComplete ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {stage.label}
                  </Text>
                  <Text style={[styles.stageSessions, { color: colors.textSecondary }]}>
                    {stage.sessions} sessions
                  </Text>
                </View>
                {isCurrent && (
                  <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Tips */}
        <View style={[styles.tipCard, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.text }]}>
            Complete more sessions to grow your tree! Each session helps you level up.
          </Text>
        </View>
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
  treeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  treeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textTransform: 'capitalize',
  },
  sessionsText: {
    fontSize: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  stageIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stageLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  stageSessions: {
    fontSize: 12,
    marginTop: 2,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});
