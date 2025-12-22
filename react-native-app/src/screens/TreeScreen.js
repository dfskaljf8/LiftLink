import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { AppContext } from '../../App';

const TreeScreen = () => {
  const { colors, treeProgress } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Tree</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Current Level: {treeProgress?.current_level?.replace('_', ' ') || 'Seed'}
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Complete sessions to grow your tree!
          </Text>
        </View>
        
        <View style={[styles.treeVisual, { backgroundColor: colors.surface }]}>
          <Text style={styles.treeEmoji}>
            {treeProgress?.current_level === 'mighty_oak' ? '🌳' : 
             treeProgress?.current_level === 'growing_tree' ? '🌲' : 
             treeProgress?.current_level === 'sapling' ? '🌱' : '🪴'}
          </Text>
          <Text style={[styles.treeStage, { color: colors.text }]}>
            {treeProgress?.current_level?.replace('_', ' ')?.toUpperCase() || 'SEED'}
          </Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Growth Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(treeProgress?.progress || 0) * 100}%`, backgroundColor: colors.secondary }]} />
          </View>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {Math.round((treeProgress?.progress || 0) * 100)}% to next level
          </Text>
        </View>
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
  treeVisual: { alignItems: 'center', padding: 40, borderRadius: 16, marginBottom: 16 },
  treeEmoji: { fontSize: 80, marginBottom: 16 },
  treeStage: { fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  statsCard: { padding: 16, borderRadius: 12 },
  statsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#374151', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  statsText: { fontSize: 14 }
});

export default TreeScreen;
