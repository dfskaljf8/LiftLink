/**
 * AI Command Center Screen
 * For trainers to manage AI suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://deploy-savior-1.preview.emergentagent.com/api';

export default function AICommandCenterScreen() {
  const router = useRouter();
  const { colors, user } = useApp();
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, suggestionsRes] = await Promise.all([
        axios.get(`${API_URL}/ai/agent/stats`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }).catch(() => ({ data: {} })),
        axios.get(`${API_URL}/ai/agent/suggestions`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        }).catch(() => ({ data: { suggestions: [] } })),
      ]);

      setStats(statsRes.data);
      setSuggestions(suggestionsRes.data?.suggestions || []);
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Command Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Suggestions"
            value={stats?.total_suggestions || 0}
            icon="bulb-outline"
            color="#f59e0b"
          />
          <StatCard
            label="Pending"
            value={stats?.pending_suggestions || 0}
            icon="time-outline"
            color="#8b5cf6"
          />
          <StatCard
            label="Approved"
            value={stats?.approved_suggestions || 0}
            icon="checkmark-circle-outline"
            color="#10b981"
          />
          <StatCard
            label="Programs"
            value={stats?.programs_generated || 0}
            icon="document-text-outline"
            color="#4f46e5"
          />
        </View>

        {/* Approval Rate */}
        <View style={[styles.approvalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.approvalLabel, { color: colors.textSecondary }]}>Approval Rate</Text>
          <Text style={[styles.approvalValue, { color: colors.text }]}>
            {stats?.approval_rate || 0}%
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${stats?.approval_rate || 0}%`, backgroundColor: colors.accent },
              ]}
            />
          </View>
        </View>

        {/* Pending Suggestions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pending Suggestions</Text>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <View key={index} style={[styles.suggestionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.suggestionHeader}>
                <Ionicons name="bulb" size={20} color="#f59e0b" />
                <Text style={[styles.suggestionType, { color: colors.text }]}>
                  {suggestion.type || 'Program Suggestion'}
                </Text>
              </View>
              <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                {suggestion.content || 'AI-generated suggestion for your client'}
              </Text>
              <View style={styles.suggestionActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]}>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pending suggestions!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  approvalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  approvalLabel: {
    fontSize: 14,
  },
  approvalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});
