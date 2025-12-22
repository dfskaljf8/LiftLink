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

const ChallengesScreen = ({ trainerId, clientId, isTrainer = true }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    metric: 'steps',
    target_value: '10000'
  });

  const metrics = [
    { value: 'steps', label: 'Steps', icon: 'directions-walk' },
    { value: 'workout_count', label: 'Workouts', icon: 'fitness-center' },
    { value: 'total_weight_lifted', label: 'Weight Lifted', icon: 'fitness-center' },
    { value: 'streak_days', label: 'Streak Days', icon: 'local-fire-department' }
  ];

  const fetchChallenges = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/coaching/challenges/${trainerId}`);
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const createChallenge = async () => {
    try {
      await axios.post(
        `${API}/coaching/challenges?trainer_id=${trainerId}`,
        {
          ...newChallenge,
          target_value: parseFloat(newChallenge.target_value)
        }
      );
      setModalVisible(false);
      setNewChallenge({ name: '', description: '', start_date: '', end_date: '', metric: 'steps', target_value: '10000' });
      fetchChallenges();
      Alert.alert('Success', 'Challenge created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      await axios.post(`${API}/coaching/challenges/${challengeId}/join?client_id=${clientId}`);
      Alert.alert('Success', 'You joined the challenge!');
      fetchChallenges();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to join challenge');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'upcoming': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderChallengeCard = (challenge) => (
    <TouchableOpacity 
      key={challenge.id} 
      style={styles.card}
      onPress={() => setSelectedChallenge(challenge)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(challenge.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(challenge.status) }]}>
            {challenge.status.toUpperCase()}
          </Text>
        </View>
        <Icon name="emoji-events" size={24} color="#F59E0B" />
      </View>
      
      <Text style={styles.cardTitle}>{challenge.name}</Text>
      <Text style={styles.cardDescription}>{challenge.description || 'No description'}</Text>
      
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Icon name="people" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{challenge.participant_ids?.length || 0} participants</Text>
        </View>
        <View style={styles.stat}>
          <Icon name="flag" size={16} color="#9CA3AF" />
          <Text style={styles.statText}>{challenge.target_value?.toLocaleString()} {challenge.metric}</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{challenge.start_date} - {challenge.end_date}</Text>
      </View>

      {!isTrainer && !challenge.participant_ids?.includes(clientId) && (
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => joinChallenge(challenge.id)}
        >
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      )}

      {challenge.leaderboard?.length > 0 && (
        <View style={styles.leaderboardPreview}>
          <Text style={styles.leaderboardTitle}>Top 3</Text>
          {challenge.leaderboard.slice(0, 3).map((entry, index) => (
            <View key={index} style={styles.leaderboardEntry}>
              <Text style={styles.rank}>#{entry.rank}</Text>
              <Text style={styles.leaderName}>{entry.client_name}</Text>
              <Text style={styles.leaderValue}>{entry.value}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fitness Challenges</Text>
        {isTrainer && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchChallenges(); }} />}
      >
        {challenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="emoji-events" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No challenges yet</Text>
            <Text style={styles.emptySubtext}>{isTrainer ? 'Create your first challenge' : 'Check back soon!'}</Text>
          </View>
        ) : (
          challenges.map(renderChallengeCard)
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Challenge Name"
              value={newChallenge.name}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, name: text })}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              multiline
              value={newChallenge.description}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, description: text })}
            />

            <Text style={styles.label}>Metric</Text>
            <View style={styles.metricRow}>
              {metrics.map((m) => (
                <TouchableOpacity
                  key={m.value}
                  style={[styles.metricButton, newChallenge.metric === m.value && styles.metricButtonActive]}
                  onPress={() => setNewChallenge({ ...newChallenge, metric: m.value })}
                >
                  <Icon name={m.icon} size={20} color={newChallenge.metric === m.value ? '#FFF' : '#6B7280'} />
                  <Text style={[styles.metricText, newChallenge.metric === m.value && styles.metricTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Target Value"
              keyboardType="numeric"
              value={newChallenge.target_value}
              onChangeText={(text) => setNewChallenge({ ...newChallenge, target_value: text })}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newChallenge.start_date}
                  onChangeText={(text) => setNewChallenge({ ...newChallenge, start_date: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>End Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={newChallenge.end_date}
                  onChangeText={(text) => setNewChallenge({ ...newChallenge, end_date: text })}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createChallenge}>
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
  addButton: { backgroundColor: '#F59E0B', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  cardStats: { flexDirection: 'row', marginBottom: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  dateRow: { marginBottom: 12 },
  dateText: { fontSize: 12, color: '#6B7280' },
  joinButton: { backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  joinButtonText: { color: '#FFF', fontWeight: '600' },
  leaderboardPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  leaderboardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  leaderboardEntry: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rank: { width: 30, fontWeight: '700', color: '#F59E0B' },
  leaderName: { flex: 1, color: '#374151' },
  leaderValue: { fontWeight: '600', color: '#111827' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  metricButton: { flexDirection: 'row', alignItems: 'center', padding: 8, marginRight: 8, marginBottom: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  metricButtonActive: { backgroundColor: '#F59E0B' },
  metricText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  metricTextActive: { color: '#FFF' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { flex: 1, padding: 14, marginRight: 8, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelButtonText: { color: '#6B7280', fontWeight: '600' },
  createButton: { flex: 1, padding: 14, marginLeft: 8, borderRadius: 8, backgroundColor: '#F59E0B', alignItems: 'center' },
  createButtonText: { color: '#FFF', fontWeight: '600' }
});

export default ChallengesScreen;
