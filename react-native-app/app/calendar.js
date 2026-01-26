/**
 * Calendar Screen - Futuristic 2050 Design
 * Session booking and scheduling
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FUTURE_COLORS, ParticleField } from '../src/components/FuturisticUI';

// Back Icon
const BackIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 18L9 12L15 6" stroke={FUTURE_COLORS.text} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Calendar Day Component
const CalendarDay = ({ day, isToday, isSelected, hasEvent, onPress }) => (
  <TouchableOpacity
    style={[
      styles.dayCell,
      isToday && styles.dayCellToday,
      isSelected && styles.dayCellSelected,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.dayText,
      isToday && styles.dayTextToday,
      isSelected && styles.dayTextSelected,
    ]}>
      {day}
    </Text>
    {hasEvent && <View style={styles.eventDot} />}
  </TouchableOpacity>
);

export default function CalendarScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  
  // Generate calendar days
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Mock events
  const eventsOnDays = [5, 12, 18, 25];

  return (
    <View style={styles.container}>
      <ParticleField count={6} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Session</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Month Header */}
          <Animated.View entering={FadeInDown} style={styles.monthHeader}>
            <Text style={styles.monthText}>{currentMonth} {currentYear}</Text>
          </Animated.View>

          {/* Week Days Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </Animated.View>

          {/* Calendar Grid */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.calendarGrid}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <CalendarDay
                  key={day}
                  day={day}
                  isToday={day === today.getDate()}
                  isSelected={day === selectedDate}
                  hasEvent={eventsOnDays.includes(day)}
                  onPress={() => setSelectedDate(day)}
                />
              );
            })}
          </Animated.View>

          {/* Selected Date Info */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.selectedInfo}>
            <Text style={styles.selectedTitle}>
              {currentMonth} {selectedDate}, {currentYear}
            </Text>
            
            {eventsOnDays.includes(selectedDate) ? (
              <View style={styles.eventCard}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>10:00 AM</Text>
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>Training Session</Text>
                  <Text style={styles.eventTrainer}>with Sarah Johnson</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noEvents}>
                <Text style={styles.noEventsText}>No sessions scheduled</Text>
                <TouchableOpacity style={styles.bookButton}>
                  <Text style={styles.bookButtonText}>Book a Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUTURE_COLORS.void,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FUTURE_COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: FUTURE_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    padding: 20,
  },
  monthHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  monthText: {
    fontSize: 24,
    fontWeight: '800',
    color: FUTURE_COLORS.text,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: FUTURE_COLORS.textMuted,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
    marginBottom: 24,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellToday: {
    backgroundColor: `${FUTURE_COLORS.primary}20`,
  },
  dayCellSelected: {
    backgroundColor: FUTURE_COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: FUTURE_COLORS.textSecondary,
  },
  dayTextToday: {
    color: FUTURE_COLORS.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: FUTURE_COLORS.void,
    fontWeight: '700',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: FUTURE_COLORS.accent,
    marginTop: 2,
  },
  selectedInfo: {
    backgroundColor: FUTURE_COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: FUTURE_COLORS.border,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FUTURE_COLORS.text,
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: FUTURE_COLORS.elevated,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: FUTURE_COLORS.primary,
  },
  eventTime: {
    marginRight: 14,
  },
  eventTimeText: {
    fontSize: 13,
    fontWeight: '600',
    color: FUTURE_COLORS.primary,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: FUTURE_COLORS.text,
  },
  eventTrainer: {
    fontSize: 13,
    color: FUTURE_COLORS.textSecondary,
    marginTop: 2,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventsText: {
    fontSize: 14,
    color: FUTURE_COLORS.textMuted,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: FUTURE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bookButtonText: {
    color: FUTURE_COLORS.void,
    fontSize: 14,
    fontWeight: '700',
  },
});
