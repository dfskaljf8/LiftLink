import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import axios from 'axios';

const API = 'https://8fe21dd2-35a9-4730-97e3-93ae042411a9.preview.emergentagent.com/api';

const TrainerDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [loading, setLoading] = useState(true);

  const colors = {
    primary: '#4f46e5',
    secondary: '#10b981',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    try {
      // Mock trainer data
      const mockClients = [
        {
          id: 'client_001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          fitnessGoals: ['Weight Loss', 'Muscle Building'],
          notes: 'Prefers morning sessions'
        },
        {
          id: 'client_002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '(555) 987-6543',
          fitnessGoals: ['Cardio', 'Flexibility'],
          notes: 'Recovering from injury'
        }
      ];

      const mockSchedule = [
        {
          id: 'session_001',
          client_name: 'John Doe',
          start_time: '2024-01-15T09:00:00Z',
          end_time: '2024-01-15T10:00:00Z',
          session_type: 'Personal Training',
          status: 'confirmed'
        },
        {
          id: 'session_002',
          client_name: 'Jane Smith',
          start_time: '2024-01-15T14:00:00Z',
          end_time: '2024-01-15T15:00:00Z',
          session_type: 'Recovery Session',
          status: 'pending'
        }
      ];

      const mockEarnings = {
        total_earnings: 180000, // $1800 in cents
        pending_earnings: 45000, // $450 in cents
        this_month: 75000, // $750 in cents
        last_payout: '2024-01-01T00:00:00Z'
      };

      setClients(mockClients);
      setSchedule(mockSchedule);
      setEarnings(mockEarnings);
    } catch (error) {
      console.error('Error fetching trainer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderClientItem = ({ item }) => (
    <View style={[styles.clientCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>{item.email}</Text>
      <Text style={[styles.clientPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
      <Text style={[styles.clientGoals, { color: colors.secondary }]}>
        Goals: {item.fitnessGoals?.join(', ') || 'Not specified'}
      </Text>
      <Text style={[styles.clientNotes, { color: colors.textSecondary }]}>{item.notes}</Text>
      
      <View style={styles.clientActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('View Details', `Details for ${item.name}`)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={() => Alert.alert('Schedule Session', `Schedule with ${item.name}`)}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScheduleItem = ({ item }) => (
    <View style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.scheduleClient, { color: colors.text }]}>{item.client_name}</Text>
      <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>
        {new Date(item.start_time).toLocaleString()}
      </Text>
      <Text style={[styles.scheduleType, { color: colors.secondary }]}>{item.session_type}</Text>
      <View style={[styles.statusBadge, { 
        backgroundColor: item.status === 'confirmed' ? colors.success : colors.warning 
      }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
      </View>
    </View>
  );

  const renderClientsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>Client Management</Text>
      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderScheduleTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>Schedule</Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert('New Appointment', 'Schedule a new session')}
      >
        <Text style={[styles.addButtonText, { color: colors.text }]}>+ New Appointment</Text>
      </TouchableOpacity>
      <FlatList
        data={schedule}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderEarningsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: colors.text }]}>Earnings</Text>
      
      <View style={styles.earningsContainer}>
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
          <Text style={[styles.earningsValue, { color: colors.success }]}>
            ${(earnings.total_earnings / 100).toFixed(2)}
          </Text>
        </View>
        
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>Pending</Text>
          <Text style={[styles.earningsValue, { color: colors.warning }]}>
            ${(earnings.pending_earnings / 100).toFixed(2)}
          </Text>
        </View>
        
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>This Month</Text>
          <Text style={[styles.earningsValue, { color: colors.primary }]}>
            ${(earnings.this_month / 100).toFixed(2)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.payoutButton, { backgroundColor: colors.secondary }]}
        onPress={() => Alert.alert('Request Payout', 'Payout requested successfully')}
      >
        <Text style={[styles.payoutButtonText, { color: colors.text }]}>Request Payout</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trainer Dashboard</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, { 
            backgroundColor: activeTab === 'clients' ? colors.primary : colors.surface 
          }]}
          onPress={() => setActiveTab('clients')}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Clients</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, { 
            backgroundColor: activeTab === 'schedule' ? colors.primary : colors.surface 
          }]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, { 
            backgroundColor: activeTab === 'earnings' ? colors.primary : colors.surface 
          }]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, { color: colors.text }]}>Earnings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'clients' && renderClientsTab()}
        {activeTab === 'schedule' && renderScheduleTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  clientCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    marginBottom: 8,
  },
  clientGoals: {
    fontSize: 14,
    marginBottom: 4,
  },
  clientNotes: {
    fontSize: 14,
    marginBottom: 12,
  },
  clientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  scheduleClient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  scheduleType: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  earningsContainer: {
    marginBottom: 24,
  },
  earningsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  payoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainerDashboard;