import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';

const API = 'https://06aabe0a-6581-4a14-8d92-05c893af6d99.preview.emergentagent.com/api';

const CalendarScheduling = ({ user, visible, onClose, trainer }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionType, setSessionType] = useState('Personal Training');
  const [notes, setNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(0);

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

  const sessionTypes = [
    'Personal Training',
    'Group Training',
    'Strength Training',
    'Cardio Session',
    'HIIT Training',
    'Yoga Session',
    'Consultation'
  ];

  useEffect(() => {
    if (visible && trainer) {
      fetchAvailableSlots();
    }
  }, [visible, trainer, selectedDate]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/trainer/${trainer.id}/available-slots`);
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Mock available slots
      setAvailableSlots([
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: false },
        { time: '17:00', available: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (currentWeek * 7));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !selectedDate) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        start_time: `${selectedDate.toISOString().split('T')[0]}T${selectedSlot.time}:00Z`,
        end_time: `${selectedDate.toISOString().split('T')[0]}T${getEndTime(selectedSlot.time)}:00Z`,
        session_type: sessionType,
        client_id: user.id,
        notes: notes
      };

      const response = await axios.post(`${API}/trainer/${trainer.id}/schedule`, appointmentData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Session booked successfully!', [
          { text: 'OK', onPress: onClose }
        ]);
      } else {
        Alert.alert('Error', 'Failed to book session. Please try again.');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      Alert.alert('Error', 'Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':');
    const endHours = parseInt(hours) + 1;
    return `${endHours.toString().padStart(2, '0')}:${minutes}`;
  };

  const renderWeekNavigation = () => (
    <View style={styles.weekNavigation}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.surface }]}
        onPress={() => setCurrentWeek(currentWeek - 1)}
      >
        <Text style={[styles.navButtonText, { color: colors.text }]}>←</Text>
      </TouchableOpacity>
      
      <Text style={[styles.weekTitle, { color: colors.text }]}>
        {currentWeek === 0 ? 'This Week' : `Week ${currentWeek + 1}`}
      </Text>
      
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: colors.surface }]}
        onPress={() => setCurrentWeek(currentWeek + 1)}
      >
        <Text style={[styles.navButtonText, { color: colors.text }]}>→</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.daysContainer}>
          {getWeekDays().map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, {
                backgroundColor: selectedDate.toDateString() === date.toDateString() 
                  ? colors.primary 
                  : colors.surface
              }]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[styles.dayText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderTimeSlots = () => (
    <View style={styles.slotsContainer}>
      <Text style={[styles.slotsTitle, { color: colors.text }]}>
        Available Time Slots
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.slotsGrid}>
          {availableSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.slotButton, {
                backgroundColor: selectedSlot?.time === slot.time 
                  ? colors.primary 
                  : slot.available 
                  ? colors.surface 
                  : colors.textSecondary,
                opacity: slot.available ? 1 : 0.5
              }]}
              onPress={() => handleSlotSelect(slot)}
              disabled={!slot.available}
            >
              <Text style={[styles.slotText, { color: colors.text }]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderSessionDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        Session Details
      </Text>
      
      <View style={styles.sessionTypeContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          Session Type
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.sessionTypeOptions}>
            {sessionTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.sessionTypeButton, {
                  backgroundColor: sessionType === type ? colors.primary : colors.surface
                }]}
                onPress={() => setSessionType(type)}
              >
                <Text style={[styles.sessionTypeText, { color: colors.text }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.notesContainer}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
          Notes (Optional)
        </Text>
        <TextInput
          style={[styles.notesInput, { 
            backgroundColor: colors.surface, 
            color: colors.text,
            borderColor: colors.textSecondary
          }]}
          placeholder="Any special requests or notes..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Book Session with {trainer?.name}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderWeekNavigation()}
          {renderCalendar()}
          {renderTimeSlots()}
          {renderSessionDetails()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.bookButton, { 
              backgroundColor: (selectedSlot && selectedDate) ? colors.primary : colors.textSecondary 
            }]}
            onPress={handleBookSession}
            disabled={!selectedSlot || !selectedDate || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.bookButtonText, { color: colors.text }]}>
                Book Session
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    marginBottom: 24,
  },
  daysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dayButton: {
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotsContainer: {
    marginBottom: 24,
  },
  slotsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotButton: {
    width: '30%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sessionTypeContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionTypeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  sessionTypeButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  sessionTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  bookButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScheduling;