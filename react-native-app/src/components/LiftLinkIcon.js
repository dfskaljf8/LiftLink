import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Temporary icon component for demonstration
// Replace with your actual LiftLink logo image
const LiftLinkIcon = ({ size = 120 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Text style={[styles.iconText, { fontSize: size * 0.4 }]}>🏋️</Text>
      <Text style={[styles.iconTitle, { fontSize: size * 0.15 }]}>LiftLink</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  iconText: {
    color: '#f59e0b',
    textAlign: 'center',
  },
  iconTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default LiftLinkIcon;