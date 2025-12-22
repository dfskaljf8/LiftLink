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

const TasksHabitsScreen = ({ trainerId, clientId, isTrainer = true }) => {
  const [taskTemplates, setTaskTemplates] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(isTrainer ? 'templates' : 'today');
  const [modalVisible, setModalVisible] = useState(false);
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    task_type: 'weigh_in',
    frequency: 'daily',
    preferred_time: '08:00',
    xp_reward: '10'
  });
  const [newHabit, setNewHabit] = useState({
    habit_name: '',
    description: '',
    target_frequency: '7',
    xp_per_completion: '5'
  });

  const taskTypes = [
    { value: 'weigh_in', label: 'Weigh-in', icon: 'monitor-weight' },
    { value: 'progress_photo', label: 'Progress Photo', icon: 'camera-alt' },
    { value: 'weekly_form', label: 'Weekly Form', icon: 'assignment' },
    { value: 'measurement', label: 'Measurement', icon: 'straighten' },
    { value: 'custom', label: 'Custom', icon: 'edit' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const fetchData = useCallback(async () => {
    try {
      const requests = [];
      if (isTrainer) {
        requests.push(axios.get(`${API}/coaching/task-templates/${trainerId}`));
      }
      if (clientId) {
        requests.push(axios.get(`${API}/coaching/habits/${clientId}`));
        requests.push(axios.get(`${API}/coaching/today-tasks/${clientId}`));
      }
      
      const responses = await Promise.all(requests);
      
      let idx = 0;
      if (isTrainer) {
        setTaskTemplates(responses[idx].data.templates || []);
        idx++;
      }
      if (clientId) {
        setHabits(responses[idx].data.habits || []);
        idx++;
        setTodayTasks(responses[idx].data.tasks || responses[idx].data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId, clientId, isTrainer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTaskTemplate = async () => {
    try {
      await axios.post(
        `${API}/coaching/task-templates?trainer_id=${trainerId}`,
        {
          ...newTask,
          xp_reward: parseInt(newTask.xp_reward)
        }
      );
      setModalVisible(false);
      setNewTask({ name: '', description: '', task_type: 'weigh_in', frequency: 'daily', preferred_time: '08:00', xp_reward: '10' });
      fetchData();
      Alert.alert('Success', 'Task template created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create task template');
    }
  };

  const createHabit = async () => {
    try {
      const params = new URLSearchParams({
        trainer_id: trainerId,
        client_id: clientId,
        habit_name: newHabit.habit_name,
        description: newHabit.description || '',
        target_frequency: newHabit.target_frequency,
        xp_per_completion: newHabit.xp_per_completion
      });
      await axios.post(`${API}/coaching/habits?${params.toString()}`);
      setHabitModalVisible(false);
      setNewHabit({ habit_name: '', description: '', target_frequency: '7', xp_per_completion: '5' });
      fetchData();
      Alert.alert('Success', 'Habit created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create habit');
    }
  };

  const completeHabit = async (habitId) => {
    try {
      const response = await axios.post(`${API}/coaching/habits/${habitId}/complete?client_id=${clientId}`);
      if (response.data.success) {
        Alert.alert('🔥 Habit Complete!', `+${response.data.xp_earned} XP | Streak: ${response.data.current_streak} days`);
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete habit');
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await axios.post(`${API}/coaching/complete-task/${taskId}?client_id=${clientId}`);
      if (response.data.success) {
        Alert.alert('✅ Task Complete!', `+${response.data.xp_earned} XP`);
        fetchData();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to complete task');
    }
  };

  const getTaskIcon = (type) => {
    const task = taskTypes.find(t => t.value === type);
    return task?.icon || 'task';
  };

  const renderTaskTemplateCard = (template) => (
    <View key={template.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name={getTaskIcon(template.task_type)} size={24} color="#10B981" />
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{template.xp_reward} XP</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{template.name}</Text>
      <Text style={styles.cardDescription}>{template.description || 'No description'}</Text>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Icon name="repeat" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{template.frequency}</Text>
        </View>
        {template.preferred_time && (
          <View style={styles.stat}>
            <Icon name="schedule" size={16} color="#9CA3AF" />
            <Text style={styles.statText}>{template.preferred_time}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.assignButton}>
        <Text style={styles.assignButtonText}>Assign to Client</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHabitCard = (habit) => (
    <View key={habit.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.streakBadge}>
          <Icon name="local-fire-department" size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{habit.current_streak} day streak</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{habit.xp_per_completion} XP</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{habit.habit_name}</Text>
      {habit.description && <Text style={styles.cardDescription}>{habit.description}</Text>}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min((habit.current_streak / habit.target_frequency) * 100, 100)}%` }]} />
      </View>
      <Text style={styles.progressText}>{habit.current_streak}/{habit.target_frequency} this week</Text>
      {!isTrainer && (
        <TouchableOpacity style={styles.completeButton} onPress={() => completeHabit(habit.id)}>
          <Icon name="check" size={20} color="#FFF" />
          <Text style={styles.completeButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTodayTask = (task) => (
    <View key={task.id} style={[styles.card, task.status === 'completed' && styles.completedCard]}>
      <View style={styles.cardHeader}>
        <Icon name={getTaskIcon(task.task_type)} size={24} color={task.status === 'completed' ? '#9CA3AF' : '#10B981'} />
        <View style={[styles.statusBadge, task.status === 'completed' ? styles.completedBadge : styles.pendingBadge]}>
          <Text style={styles.statusText}>{task.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.cardTitle, task.status === 'completed' && styles.completedText]}>{task.task_name}</Text>
      <Text style={styles.dueText}>Due: {task.due_date} {task.due_time ? `at ${task.due_time}` : ''}</Text>
      {task.status !== 'completed' && (
        <TouchableOpacity style={styles.completeButton} onPress={() => completeTask(task.id)}>
          <Icon name="check" size={20} color="#FFF" />
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const tabs = isTrainer 
    ? [{ key: 'templates', label: 'Task Templates', icon: 'assignment' }, { key: 'habits', label: 'Client Habits', icon: 'loop' }]
    : [{ key: 'today', label: 'Today', icon: 'today' }, { key: 'habits', label: 'My Habits', icon: 'loop' }];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks & Habits</Text>
        {isTrainer && (
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.addButton} onPress={() => setHabitModalVisible(true)}>
              <Icon name="loop" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { marginLeft: 8 }]} onPress={() => setModalVisible(true)}>
              <Icon name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity 
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon name={tab.icon} size={20} color={activeTab === tab.key ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        {activeTab === 'templates' && taskTemplates.map(renderTaskTemplateCard)}
        {activeTab === 'habits' && habits.map(renderHabitCard)}
        {activeTab === 'today' && (
          todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="check-circle" size={64} color="#10B981" />
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySubtext}>No tasks due today</Text>
            </View>
          ) : (
            todayTasks.map(renderTodayTask)
          )
        )}
        {activeTab === 'templates' && taskTemplates.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="assignment" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No task templates</Text>
            <Text style={styles.emptySubtext}>Create templates to assign to clients</Text>
          </View>
        )}
        {activeTab === 'habits' && habits.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="loop" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No habits tracked</Text>
            <Text style={styles.emptySubtext}>{isTrainer ? 'Create habits for your clients' : 'Ask your coach to set up habits'}</Text>
          </View>
        )}
      </ScrollView>

      {/* Task Template Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Task Template</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Task Name"
                value={newTask.name}
                onChangeText={(text) => setNewTask({ ...newTask, name: text })}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                multiline
                value={newTask.description}
                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              />

              <Text style={styles.label}>Task Type</Text>
              <View style={styles.typeRow}>
                {taskTypes.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.typeButton, newTask.task_type === t.value && styles.typeButtonActive]}
                    onPress={() => setNewTask({ ...newTask, task_type: t.value })}
                  >
                    <Icon name={t.icon} size={18} color={newTask.task_type === t.value ? '#FFF' : '#6B7280'} />
                    <Text style={[styles.typeText, newTask.task_type === t.value && styles.typeTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Frequency</Text>
                  <View style={styles.pickerContainer}>
                    {frequencies.map((f) => (
                      <TouchableOpacity
                        key={f.value}
                        style={[styles.freqButton, newTask.frequency === f.value && styles.freqButtonActive]}
                        onPress={() => setNewTask({ ...newTask, frequency: f.value })}
                      >
                        <Text style={[styles.freqText, newTask.frequency === f.value && styles.freqTextActive]}>{f.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>XP Reward</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newTask.xp_reward}
                    onChangeText={(text) => setNewTask({ ...newTask, xp_reward: text })}
                  />
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={createTaskTemplate}>
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Habit Modal */}
      <Modal visible={habitModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Habit</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Habit Name"
              value={newHabit.habit_name}
              onChangeText={(text) => setNewHabit({ ...newHabit, habit_name: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              multiline
              value={newHabit.description}
              onChangeText={(text) => setNewHabit({ ...newHabit, description: text })}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Target/Week</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newHabit.target_frequency}
                  onChangeText={(text) => setNewHabit({ ...newHabit, target_frequency: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>XP per Complete</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newHabit.xp_per_completion}
                  onChangeText={(text) => setNewHabit({ ...newHabit, xp_per_completion: text })}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setHabitModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createHabit}>
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
  headerButtons: { flexDirection: 'row' },
  addButton: { backgroundColor: '#10B981', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  tabText: { fontSize: 14, color: '#9CA3AF', marginLeft: 6 },
  activeTabText: { color: '#10B981', fontWeight: '600' },
  scrollView: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  completedCard: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  xpBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  xpText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  streakText: { fontSize: 12, color: '#F59E0B', marginLeft: 4, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  completedBadge: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  completedText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  cardDescription: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  cardStats: { flexDirection: 'row', marginBottom: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  dueText: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  assignButton: { backgroundColor: '#ECFDF5', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  assignButtonText: { color: '#10B981', fontWeight: '600' },
  completeButton: { flexDirection: 'row', backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  completeButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalScrollView: { maxHeight: '90%' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  typeButton: { flexDirection: 'row', alignItems: 'center', padding: 10, marginRight: 8, marginBottom: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  typeButtonActive: { backgroundColor: '#10B981' },
  typeText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  typeTextActive: { color: '#FFF' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  freqButton: { paddingHorizontal: 12, paddingVertical: 8, marginRight: 4, marginBottom: 4, borderRadius: 6, backgroundColor: '#F3F4F6' },
  freqButtonActive: { backgroundColor: '#10B981' },
  freqText: { fontSize: 12, color: '#6B7280' },
  freqTextActive: { color: '#FFF' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, marginRight: 8, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelButtonText: { color: '#6B7280', fontWeight: '600' },
  createButton: { flex: 1, padding: 14, marginLeft: 8, borderRadius: 8, backgroundColor: '#10B981', alignItems: 'center' },
  createButtonText: { color: '#FFF', fontWeight: '600' }
});

export default TasksHabitsScreen;
