import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { AppContext } from '../../App';

const SessionsScreen = () => {
  const { colors, sessions } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Sessions</Text>
        
        {sessions.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>No sessions yet</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Book your first session to get started!
            </Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <View key={index} style={[styles.sessionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionType, { color: colors.text }]}>
                  {session.session_type}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: session.status === 'completed' ? '#10b981' : '#f59e0b' }]}>
                  <Text style={styles.statusText}>{session.status?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.sessionDuration, { color: colors.textSecondary }]}>
                {session.duration_minutes} minutes
              </Text>
              {session.trainer_name && (
                <Text style={[styles.trainerName, { color: colors.primary }]}>
                  with {session.trainer_name}
                </Text>
              )}
              {session.scheduled_at && (
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                  {new Date(session.scheduled_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  cardDescription: { fontSize: 14 },
  sessionCard: { padding: 16, borderRadius: 12, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionType: { fontSize: 18, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sessionDuration: { fontSize: 14, marginBottom: 4 },
  trainerName: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  sessionDate: { fontSize: 12 }
});

export default SessionsScreen;
