/**
 * AI Command Center - Trainer's AI Autopilot Dashboard
 * The central hub for managing AI-generated suggestions and client insights
 * AI suggests, trainers approve - human-in-the-loop architecture
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const PRIORITY_ICONS = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'check-circle',
};

const TYPE_ICONS = {
  message: 'chat',
  check_in: 'people',
  celebration: 'emoji-events',
  intervention: 'healing',
  workout_change: 'fitness-center',
  program_adjustment: 'trending-up',
  recovery_recommendation: 'self-improvement',
  nutrition_tip: 'restaurant',
};

const AICommandCenter = ({ navigation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [monitoringClients, setMonitoringClients] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('auth_token');
  };

  const loadData = async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [suggestionsRes, statsRes] = await Promise.all([
        axios.get(`${API}/ai/agent/suggestions`, { headers }),
        axios.get(`${API}/ai/agent/stats`, { headers }),
      ]);

      setSuggestions(suggestionsRes.data.suggestions || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading AI data:', error);
      Alert.alert('Error', 'Failed to load AI suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const runAIMonitoring = async () => {
    setMonitoringClients(true);
    try {
      const token = await getAuthToken();
      const response = await axios.post(
        `${API}/ai/agent/monitor-clients`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        'AI Monitoring Complete',
        `Analyzed ${response.data.clients_analyzed} clients\n` +
        `Generated ${response.data.suggestions_generated} suggestions\n` +
        `${response.data.critical_alerts} critical alerts`,
        [{ text: 'OK', onPress: loadData }]
      );
    } catch (error) {
      console.error('Monitoring error:', error);
      if (error.response?.status === 429) {
        Alert.alert('Rate Limited', 'AI monitoring is limited to 10 times per hour');
      } else {
        Alert.alert('Error', 'Failed to run AI monitoring');
      }
    } finally {
      setMonitoringClients(false);
    }
  };

  const openSuggestionModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setEditedMessage(suggestion.ai_generated_content?.message || '');
    setModalVisible(true);
  };

  const approveSuggestion = async () => {
    if (!selectedSuggestion) return;

    try {
      const token = await getAuthToken();
      const modifications = editedMessage !== selectedSuggestion.ai_generated_content?.message
        ? { message: editedMessage }
        : null;

      await axios.post(
        `${API}/ai/agent/suggestions/${selectedSuggestion.id}/approve`,
        { modifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Suggestion approved and executed');
      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Approve error:', error);
      Alert.alert('Error', 'Failed to approve suggestion');
    }
  };

  const rejectSuggestion = async () => {
    if (!selectedSuggestion) return;

    Alert.prompt(
      'Reject Suggestion',
      'Why are you rejecting this? (optional)',
      async (reason) => {
        try {
          const token = await getAuthToken();
          await axios.post(
            `${API}/ai/agent/suggestions/${selectedSuggestion.id}/reject`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setModalVisible(false);
          loadData();
        } catch (error) {
          console.error('Reject error:', error);
          Alert.alert('Error', 'Failed to reject suggestion');
        }
      },
      'plain-text'
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>AI Agent Stats</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.pending_suggestions || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total_suggestions || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.approval_rate || 0}%</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.programs_generated || 0}</Text>
          <Text style={styles.statLabel}>Programs</Text>
        </View>
      </View>
    </View>
  );

  const renderSuggestionCard = (suggestion) => (
    <TouchableOpacity
      key={suggestion.id}
      style={styles.suggestionCard}
      onPress={() => openSuggestionModal(suggestion)}
    >
      <View style={styles.suggestionHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[suggestion.priority] }]}>
          <Icon name={PRIORITY_ICONS[suggestion.priority]} size={14} color="#fff" />
          <Text style={styles.priorityText}>{suggestion.priority}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Icon name={TYPE_ICONS[suggestion.type] || 'lightbulb'} size={14} color="#9ca3af" />
          <Text style={styles.typeText}>{suggestion.type.replace('_', ' ')}</Text>
        </View>
      </View>

      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
      <Text style={styles.suggestionReason}>{suggestion.reason}</Text>

      {suggestion.client_name && (
        <View style={styles.clientInfo}>
          <Icon name="person" size={14} color="#6b7280" />
          <Text style={styles.clientName}>{suggestion.client_name}</Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.timeAgo}>
          {getTimeAgo(suggestion.created_at)}
        </Text>
        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>Tap to review</Text>
          <Icon name="chevron-right" size={16} color="#6b7280" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="psychology" size={64} color="#374151" />
      <Text style={styles.emptyTitle}>No Pending Suggestions</Text>
      <Text style={styles.emptyText}>
        Run AI monitoring to analyze your clients and generate intelligent suggestions.
      </Text>
      <TouchableOpacity
        style={styles.runMonitoringButton}
        onPress={runAIMonitoring}
        disabled={monitoringClients}
      >
        {monitoringClients ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="play-arrow" size={20} color="#fff" />
            <Text style={styles.runMonitoringText}>Run AI Monitoring</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Suggestion</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {selectedSuggestion && (
            <ScrollView style={styles.modalBody}>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[selectedSuggestion.priority], alignSelf: 'flex-start', marginBottom: 12 }]}>
                <Text style={styles.priorityText}>{selectedSuggestion.priority} priority</Text>
              </View>

              <Text style={styles.modalSectionTitle}>AI Recommendation</Text>
              <Text style={styles.modalText}>{selectedSuggestion.title}</Text>
              <Text style={styles.modalReason}>{selectedSuggestion.reason}</Text>

              {selectedSuggestion.ai_generated_content && (
                <>
                  <Text style={styles.modalSectionTitle}>Suggested Message</Text>
                  <Text style={styles.modalSubject}>
                    {selectedSuggestion.ai_generated_content.subject}
                  </Text>
                  <TextInput
                    style={styles.messageInput}
                    value={editedMessage}
                    onChangeText={setEditedMessage}
                    multiline
                    placeholder="Edit message before sending..."
                    placeholderTextColor="#6b7280"
                  />
                  {selectedSuggestion.ai_generated_content.call_to_action && (
                    <Text style={styles.callToAction}>
                      CTA: {selectedSuggestion.ai_generated_content.call_to_action}
                    </Text>
                  )}
                </>
              )}

              <Text style={styles.modalSectionTitle}>Client</Text>
              <Text style={styles.modalText}>{selectedSuggestion.client_name}</Text>
            </ScrollView>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.rejectButton]}
              onPress={rejectSuggestion}
            >
              <Icon name="close" size={18} color="#ef4444" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.approveButton]}
              onPress={approveSuggestion}
            >
              <Icon name="check" size={18} color="#fff" />
              <Text style={styles.approveButtonText}>Approve & Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading AI Command Center...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#f9fafb" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Icon name="psychology" size={24} color="#4f46e5" />
          <Text style={styles.headerText}>AI Command Center</Text>
        </View>
        <TouchableOpacity
          style={styles.monitorButton}
          onPress={runAIMonitoring}
          disabled={monitoringClients}
        >
          {monitoringClients ? (
            <ActivityIndicator size="small" color="#4f46e5" />
          ) : (
            <Icon name="radar" size={24} color="#4f46e5" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
        }
      >
        {stats && renderStatsCard()}

        <View style={styles.suggestionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Suggestions</Text>
            <Text style={styles.sectionCount}>{suggestions.length}</Text>
          </View>

          {suggestions.length === 0 ? (
            renderEmptyState()
          ) : (
            suggestions.map(renderSuggestionCard)
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AIProgramGenerator')}
            >
              <Icon name="auto-awesome" size={28} color="#8b5cf6" />
              <Text style={styles.actionTitle}>Generate Program</Text>
              <Text style={styles.actionDesc}>AI creates workout plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AIClientAnalysis')}
            >
              <Icon name="analytics" size={28} color="#06b6d4" />
              <Text style={styles.actionTitle}>Client Analysis</Text>
              <Text style={styles.actionDesc}>Deep dive on any client</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  monitorButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9ca3af',
  },
  statsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  suggestionsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
  },
  sectionCount: {
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  suggestionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  timeAgo: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionHintText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  runMonitoringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  runMonitoringText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    marginTop: 24,
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f9fafb',
    marginTop: 8,
  },
  actionDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
  },
  modalBody: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#f9fafb',
  },
  modalReason: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  modalSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#f9fafb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  callToAction: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AICommandCenter;
