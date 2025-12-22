import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AutoMessagesScreen = ({ trainerId }) => {
  const [templates, setTemplates] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    trigger: 'after_workout',
    send_as: 'push'
  });
  const [newScheduled, setNewScheduled] = useState({
    body: '',
    scheduled_datetime: '',
    recipient_ids: []
  });

  const triggers = [
    { value: 'after_workout', label: 'After Workout', icon: 'fitness-center' },
    { value: 'missed_workout', label: 'Missed Workout', icon: 'warning' },
    { value: 'weekly_checkin', label: 'Weekly Check-in', icon: 'event' },
    { value: 'streak_milestone', label: 'Streak Milestone', icon: 'local-fire-department' },
    { value: 'signup', label: 'On Signup', icon: 'person-add' }
  ];

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, scheduledRes] = await Promise.all([
        axios.get(`${API}/coaching/message-templates/${trainerId}`),
        axios.get(`${API}/coaching/scheduled-messages/${trainerId}`)
      ]);
      setTemplates(templatesRes.data.templates || []);
      setScheduled(scheduledRes.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTemplate = async () => {
    try {
      await axios.post(
        `${API}/coaching/message-templates?trainer_id=${trainerId}`,
        newTemplate
      );
      setModalVisible(false);
      setNewTemplate({ name: '', subject: '', body: '', trigger: 'after_workout', send_as: 'push' });
      fetchData();
      Alert.alert('Success', 'Message template created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const scheduleMessage = async () => {
    try {
      await axios.post(
        `${API}/coaching/schedule-message?trainer_id=${trainerId}`,
        newScheduled
      );
      setScheduleModalVisible(false);
      setNewScheduled({ body: '', scheduled_datetime: '', recipient_ids: [] });
      fetchData();
      Alert.alert('Success', 'Message scheduled!');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule message');
    }
  };

  const getTriggerInfo = (trigger) => {
    return triggers.find(t => t.value === trigger) || { label: trigger, icon: 'message' };
  };

  const renderTemplateCard = (template) => {
    const triggerInfo = getTriggerInfo(template.trigger);
    return (
      <View key={template.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.triggerBadge}>
            <Icon name={triggerInfo.icon} size={16} color="#8B5CF6" />
            <Text style={styles.triggerText}>{triggerInfo.label}</Text>
          </View>
          <View style={[styles.sendBadge, template.send_as === 'push' ? styles.pushBadge : styles.dmBadge]}>
            <Text style={styles.sendText}>{template.send_as.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{template.name}</Text>
        {template.subject && <Text style={styles.subject}>{template.subject}</Text>}
        <Text style={styles.bodyPreview} numberOfLines={3}>{template.body}</Text>
        <View style={styles.variableHint}>
          <Icon name="info" size={14} color="#9CA3AF" />
          <Text style={styles.variableText}>Variables: {'{name}'}, {'{streak}'}, {'{goals}'}</Text>
        </View>
      </View>
    );
  };

  const renderScheduledCard = (message) => (
    <View key={message.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.scheduledBadge}>
          <Icon name="schedule" size={16} color="#10B981" />
          <Text style={styles.scheduledText}>{message.status}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(message.scheduled_datetime).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.bodyPreview}>{message.body}</Text>
      <Text style={styles.recipientText}>
        <Icon name="people" size={14} color="#9CA3AF" /> {message.recipient_ids?.length || 0} recipients
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auto Messages</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => activeTab === 'templates' ? setModalVisible(true) : setScheduleModalVisible(true)}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Icon name="description" size={20} color={activeTab === 'templates' ? '#8B5CF6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Icon name="schedule" size={20} color={activeTab === 'scheduled' ? '#8B5CF6' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>Scheduled</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {activeTab === 'templates' ? (
          templates.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="mail" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No message templates</Text>
              <Text style={styles.emptySubtext}>Create automated messages for your clients</Text>
            </View>
          ) : (
            templates.map(renderTemplateCard)
          )
        ) : (
          scheduled.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="schedule" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No scheduled messages</Text>
              <Text style={styles.emptySubtext}>Schedule messages to send later</Text>
            </View>
          ) : (
            scheduled.map(renderScheduledCard)
          )
        )}
      </ScrollView>

      {/* Template Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Message Template</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Template Name"
                value={newTemplate.name}
                onChangeText={(text) => setNewTemplate({ ...newTemplate, name: text })}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Subject (optional)"
                value={newTemplate.subject}
                onChangeText={(text) => setNewTemplate({ ...newTemplate, subject: text })}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Message body... Use {name}, {streak}, {goals} for personalization"
                multiline
                value={newTemplate.body}
                onChangeText={(text) => setNewTemplate({ ...newTemplate, body: text })}
              />

              <Text style={styles.label}>Trigger</Text>
              <View style={styles.triggerRow}>
                {triggers.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.triggerButton, newTemplate.trigger === t.value && styles.triggerButtonActive]}
                    onPress={() => setNewTemplate({ ...newTemplate, trigger: t.value })}
                  >
                    <Icon name={t.icon} size={18} color={newTemplate.trigger === t.value ? '#FFF' : '#6B7280'} />
                    <Text style={[styles.triggerBtnText, newTemplate.trigger === t.value && styles.triggerBtnTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={createTemplate}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={scheduleModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Message</Text>
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Message content..."
              multiline
              value={newScheduled.body}
              onChangeText={(text) => setNewScheduled({ ...newScheduled, body: text })}
            />
            
            <Text style={styles.label}>Schedule Date/Time (ISO format)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-01-15T10:00:00Z"
              value={newScheduled.scheduled_datetime}
              onChangeText={(text) => setNewScheduled({ ...newScheduled, scheduled_datetime: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setScheduleModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={scheduleMessage}>
                <Text style={styles.createButtonText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  addButton: { backgroundColor: '#8B5CF6', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#8B5CF6' },
  tabText: { fontSize: 14, color: '#9CA3AF', marginLeft: 6 },
  activeTabText: { color: '#8B5CF6', fontWeight: '600' },
  scrollView: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  triggerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  triggerText: { fontSize: 12, color: '#8B5CF6', marginLeft: 4, fontWeight: '500' },
  sendBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pushBadge: { backgroundColor: '#DBEAFE' },
  dmBadge: { backgroundColor: '#FEF3C7' },
  sendText: { fontSize: 10, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  subject: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  bodyPreview: { fontSize: 14, color: '#374151', marginBottom: 8 },
  variableHint: { flexDirection: 'row', alignItems: 'center' },
  variableText: { fontSize: 11, color: '#9CA3AF', marginLeft: 4 },
  scheduledBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  scheduledText: { fontSize: 12, color: '#10B981', marginLeft: 4, fontWeight: '500' },
  dateText: { fontSize: 12, color: '#6B7280' },
  recipientText: { fontSize: 12, color: '#9CA3AF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalScrollView: { maxHeight: '90%' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  triggerRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  triggerButton: { flexDirection: 'row', alignItems: 'center', padding: 10, marginRight: 8, marginBottom: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  triggerButtonActive: { backgroundColor: '#8B5CF6' },
  triggerBtnText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  triggerBtnTextActive: { color: '#FFF' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, marginRight: 8, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelButtonText: { color: '#6B7280', fontWeight: '600' },
  createButton: { flex: 1, padding: 14, marginLeft: 8, borderRadius: 8, backgroundColor: '#8B5CF6', alignItems: 'center' },
  createButtonText: { color: '#FFF', fontWeight: '600' }
});

export default AutoMessagesScreen;
