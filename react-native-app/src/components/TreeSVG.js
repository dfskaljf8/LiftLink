import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TreeSVG = ({ level = 'seed', size = 80 }) => {
  const getTreeEmoji = (level) => {
    switch(level) {
      case 'seed': return '🌱';
      case 'sprout': return '🌿';
      case 'sapling': return '🌳';
      case 'young_tree': return '🌲';
      case 'mature_tree': return '🌴';
      case 'strong_tree': return '🌲';
      case 'mighty_tree': return '🌳';
      case 'ancient_tree': return '🌴';
      case 'legendary_tree': return '🌲';
      case 'mythical_tree': return '🌳';
      default: return '🌱';
    }
  };

  const getTreeColor = (level) => {
    switch(level) {
      case 'seed': return '#22c55e';
      case 'sprout': return '#16a34a';
      case 'sapling': return '#15803d';
      case 'young_tree': return '#166534';
      case 'mature_tree': return '#14532d';
      case 'strong_tree': return '#365314';
      case 'mighty_tree': return '#422006';
      case 'ancient_tree': return '#451a03';
      case 'legendary_tree': return '#fbbf24';
      case 'mythical_tree': return '#f59e0b';
      default: return '#22c55e';
    }
  };

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

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.treeContainer, { 
        backgroundColor: colors.surface,
        borderRadius: size * 0.1,
        width: size,
        height: size
      }]}>
        <Text style={[styles.treeEmoji, { fontSize: size * 0.6 }]}>
          {getTreeEmoji(level)}
        </Text>
      </View>
      <View style={[styles.levelBadge, { backgroundColor: getTreeColor(level) }]}>
        <Text style={[styles.levelText, { fontSize: size * 0.15 }]}>
          {level.replace('_', ' ').toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  treeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  treeEmoji: {
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  levelText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TreeSVG;