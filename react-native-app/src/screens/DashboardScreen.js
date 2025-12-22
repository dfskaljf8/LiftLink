import React, { useContext } from 'react';
import { AppContext } from '../../App';
import TrainerDashboard from '../components/TrainerDashboard';
import TraineeDashboard from '../components/TraineeDashboard';

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AppContext);
  
  if (user.role === 'trainer') {
    return <TrainerDashboard trainerId={user.id} navigation={navigation} />;
  } else {
    return <TraineeDashboard user={user} navigation={navigation} />;
  }
};

export default DashboardScreen;
