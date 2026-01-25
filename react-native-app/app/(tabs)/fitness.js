/**
 * Fitness Screen
 * Health data and fitness tracking
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';

export default function FitnessScreen() {
  const { colors, user } = useApp();

  const FitnessCard = ({ icon, title, value, unit, color }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.cardUnit, { color: colors.textSecondary }]}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Fitness Tracking</Text>

        {/* Today's Stats */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Today's Activity</Text>
        <View style={styles.cardGrid}>
          <FitnessCard icon="footsteps" title="Steps" value="8,432" unit="steps" color="#10b981" />
          <FitnessCard icon="flame" title="Calories" value="420" unit="kcal" color="#f59e0b" />
          <FitnessCard icon="heart" title="Heart Rate" value="72" unit="bpm" color="#ef4444" />
          <FitnessCard icon="time" title="Active" value="45" unit="min" color="#8b5cf6" />
        </View>

        {/* Connect Fitness Apps */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Connected Apps</Text>
        <View style={[styles.connectCard, { backgroundColor: colors.surface }]}>
          <View style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: '#4285F420' }]}>
              <Text style={styles.appIconText}>📱</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: colors.text }]}>Google Fit</Text>
              <Text style={[styles.appStatus, { color: colors.accent }]}>Connected</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.appRow}>
            <View style={[styles.appIcon, { backgroundColor: '#FF2D5520' }]}>
              <Text style={styles.appIconText}>❤️</Text>
            </View>
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: colors.text }]}>Apple Health</Text>
              <Text style={[styles.appStatus, { color: colors.textSecondary }]}>Tap to connect</Text>
            </View>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Weekly Summary */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>This Week</Text>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Workouts</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>5</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active Minutes</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>320 min</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Calories Burned</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>2,450 kcal</Text>
          </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  connectCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 24,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
  },
  appStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
