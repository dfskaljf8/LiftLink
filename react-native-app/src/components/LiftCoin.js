import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LiftCoin = ({ count = 0, size = 'md' }) => {
  const getSizeStyles = (size) => {
    switch(size) {
      case 'sm':
        return { fontSize: 16, iconSize: 20, padding: 8 };
      case 'md':
        return { fontSize: 20, iconSize: 24, padding: 12 };
      case 'lg':
        return { fontSize: 24, iconSize: 28, padding: 16 };
      default:
        return { fontSize: 20, iconSize: 24, padding: 12 };
    }
  };

  const sizeStyles = getSizeStyles(size);

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
    <View style={[styles.container, { padding: sizeStyles.padding }]}>
      <View style={styles.coinContainer}>
        <Text style={[styles.coinIcon, { fontSize: sizeStyles.iconSize }]}>
          🪙
        </Text>
        <Text style={[styles.coinText, { fontSize: sizeStyles.fontSize, color: colors.warning }]}>
          {count}
        </Text>
      </View>
      <Text style={[styles.coinLabel, { color: colors.textSecondary }]}>
        LiftCoins
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coinIcon: {
    marginRight: 4,
  },
  coinText: {
    fontWeight: 'bold',
  },
  coinLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LiftCoin;