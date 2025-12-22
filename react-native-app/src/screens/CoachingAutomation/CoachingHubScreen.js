import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ProgramTemplatesScreen from './ProgramTemplatesScreen';
import ChallengesScreen from './ChallengesScreen';
import AutoMessagesScreen from './AutoMessagesScreen';
import TasksHabitsScreen from './TasksHabitsScreen';
import ClientActivityScreen from './ClientActivityScreen';

const CoachingHubScreen = ({ trainerId, clientId, isTrainer = true }) => {
  const [activeSection, setActiveSection] = useState('programs');

  const trainerSections = [
    { key: 'programs', label: 'Programs', icon: 'fitness-center', color: '#6366F1' },
    { key: 'challenges', label: 'Challenges', icon: 'emoji-events', color: '#F59E0B' },
    { key: 'messages', label: 'Messages', icon: 'mail', color: '#8B5CF6' },
    { key: 'tasks', label: 'Tasks', icon: 'assignment', color: '#10B981' },
    { key: 'activity', label: 'Activity', icon: 'insights', color: '#3B82F6' }
  ];

  const clientSections = [
    { key: 'challenges', label: 'Challenges', icon: 'emoji-events', color: '#F59E0B' },
    { key: 'tasks', label: 'Today', icon: 'today', color: '#10B981' }
  ];

  const sections = isTrainer ? trainerSections : clientSections;

  const renderContent = () => {
    switch (activeSection) {
      case 'programs':
        return <ProgramTemplatesScreen trainerId={trainerId} />;
      case 'challenges':
        return <ChallengesScreen trainerId={trainerId} clientId={clientId} isTrainer={isTrainer} />;
      case 'messages':
        return <AutoMessagesScreen trainerId={trainerId} />;
      case 'tasks':
        return <TasksHabitsScreen trainerId={trainerId} clientId={clientId} isTrainer={isTrainer} />;
      case 'activity':
        return <ClientActivityScreen trainerId={trainerId} clientId={clientId} />;
      default:
        return <ProgramTemplatesScreen trainerId={trainerId} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Section Tabs */}
      <View style={styles.tabContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.tab,
              activeSection === section.key && { borderBottomColor: section.color, borderBottomWidth: 3 }
            ]}
            onPress={() => setActiveSection(section.key)}
          >
            <Icon 
              name={section.icon} 
              size={22} 
              color={activeSection === section.key ? section.color : '#9CA3AF'} 
            />
            <Text style={[
              styles.tabLabel,
              activeSection === section.key && { color: section.color, fontWeight: '600' }
            ]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 8
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  tabLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4
  },
  content: {
    flex: 1
  }
});

export default CoachingHubScreen;
