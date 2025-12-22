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

const ProgramTemplatesScreen = ({ trainerId }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    duration_weeks: '4',
    workouts_per_week: '3',
    delivery_type: 'immediate'
  });

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/coaching/program-templates/${trainerId}`);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async () => {
    try {
      await axios.post(
        `${API}/coaching/program-templates?trainer_id=${trainerId}`,
        {
          ...newTemplate,
          duration_weeks: parseInt(newTemplate.duration_weeks),
          workouts_per_week: parseInt(newTemplate.workouts_per_week),
          workouts: []
        }
      );
      setModalVisible(false);
      setNewTemplate({ name: '', description: '', duration_weeks: '4', workouts_per_week: '3', delivery_type: 'immediate' });
      fetchTemplates();
      Alert.alert('Success', 'Program template created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const renderTemplateCard = (template) => (
    <View key={template.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="fitness-center" size={24} color="#6366F1" />
        <Text style={styles.cardTitle}>{template.name}</Text>
      </View>
      <Text style={styles.cardDescription}>{template.description || 'No description'}</Text>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Icon name="calendar-today" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{template.duration_weeks} weeks</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="repeat" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{template.workouts_per_week}x/week</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="flash-on" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{template.delivery_type}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.assignButton}>
        <Text style={styles.assignButtonText}>Assign to Client</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Program Templates</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTemplates(); }} />}
      >
        {templates.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No program templates yet</Text>
            <Text style={styles.emptySubtext}>Create your first template to get started</Text>
          </View>
        ) : (
          templates.map(renderTemplateCard)
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Program Template</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Program Name"
              value={newTemplate.name}
              onChangeText={(text) => setNewTemplate({ ...newTemplate, name: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={newTemplate.description}
              onChangeText={(text) => setNewTemplate({ ...newTemplate, description: text })}
            />
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Duration (weeks)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newTemplate.duration_weeks}
                  onChangeText={(text) => setNewTemplate({ ...newTemplate, duration_weeks: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Workouts/Week</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newTemplate.workouts_per_week}
                  onChangeText={(text) => setNewTemplate({ ...newTemplate, workouts_per_week: text })}
                />
              </View>
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
  addButton: { backgroundColor: '#6366F1', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginLeft: 12 },
  cardDescription: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  cardStats: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  statText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  assignButton: { backgroundColor: '#EEF2FF', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  assignButtonText: { color: '#6366F1', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, marginRight: 8, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelButtonText: { color: '#6B7280', fontWeight: '600' },
  createButton: { flex: 1, padding: 14, marginLeft: 8, borderRadius: 8, backgroundColor: '#6366F1', alignItems: 'center' },
  createButtonText: { color: '#FFF', fontWeight: '600' }
});

export default ProgramTemplatesScreen;
