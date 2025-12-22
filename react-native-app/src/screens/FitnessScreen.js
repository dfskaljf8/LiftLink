import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { AppContext } from '../../App';
import GoogleFitIntegration from '../components/GoogleFitIntegration';

const FitnessScreen = () => {
  const { colors, user } = useContext(AppContext);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GoogleFitIntegration user={user} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FitnessScreen;
