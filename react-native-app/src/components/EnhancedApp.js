import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import enhanced context providers
import AuthProvider, { useAuth } from './AuthContext';
import NotificationProvider, { useNotifications } from './NotificationManager';
import SecurityProvider, { useSecurity } from './SecurityProvider';

// Import enhanced UI components
import { LoadingOverlay, ErrorOverlay, SuccessOverlay } from './LoadingOverlay';
import NotificationCenter from './NotificationCenter';

// Import existing screens
import DocumentVerification from './DocumentVerification';
import TrainerDashboard from './TrainerDashboard';
import GoogleFitIntegration from './GoogleFitIntegration';
import TrainerMapView from './TrainerMapView';
import { DynamicIslandStatusBar, DynamicIslandSafeWrapper } from './DynamicIslandUtils';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');

// Enhanced Main App Component with Live Notifications
const MainAppContent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, connected } = useNotifications();
  const { securityStatus, updateActivity } = useSecurity();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Update activity on any user interaction
  const handleUserActivity = () => {
    updateActivity();
  };

  // Enhanced notification badge
  const NotificationBadge = () => (
    <View style={styles.notificationBadgeContainer}>
      <TouchableOpacity
        style={[
          styles.notificationButton,
          !connected && styles.notificationButtonOffline
        ]}
        onPress={() => {
          handleUserActivity();
          setShowNotifications(true);
        }}
        activeOpacity={0.7}
      >
        <Icon 
          name="notifications" 
          size={24} 
          color={connected ? '#4A90E2' : '#999'} 
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={[styles.connectionIndicator, connected && styles.connected]}>
        <Text style={styles.connectionText}>
          {connected ? '🟢' : '🔴'}
        </Text>
      </View>
    </View>
  );

  // Enhanced Dashboard Screen
  const DashboardScreen = () => (
    <DynamicIslandSafeWrapper>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.name || 'User'}!
            </Text>
            <Text style={styles.roleText}>{user?.role || 'Member'}</Text>
          </View>
          <NotificationBadge />
        </View>
        
        {/* Security Status Indicator */}
        <View style={[
          styles.securityStatus,
          securityStatus.sessionValid ? styles.securityValid : styles.securityInvalid
        ]}>
          <Text style={styles.securityText}>
            {securityStatus.sessionValid ? '🔒 Session Secure' : '⚠️ Session Issue'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              handleUserActivity();
              setSuccessMessage('Feature coming soon!');
              setShowSuccess(true);
            }}
          >
            <Icon name="fitness-center" size={32} color="#4A90E2" />
            <Text style={styles.quickActionText}>Workouts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              handleUserActivity();
              setShowNotifications(true);
            }}
          >
            <Icon name="people" size={32} color="#27AE60" />
            <Text style={styles.quickActionText}>Friends</Text>
            {unreadCount > 0 && (
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleUserActivity}
          >
            <Icon name="schedule" size={32} color="#F39C12" />
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {/* Live Connection Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Live Features</Text>
          <View style={styles.statusRow}>
            <Icon 
              name={connected ? 'wifi' : 'wifi-off'} 
              size={20} 
              color={connected ? '#27AE60' : '#E74C3C'} 
            />
            <Text style={[
              styles.statusText,
              { color: connected ? '#27AE60' : '#E74C3C' }
            ]}>
              {connected ? 'Live notifications active' : 'Reconnecting...'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: logout, style: 'destructive' }
              ]
            );
          }}
        >
          <Icon name="logout" size={20} color="#E74C3C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DynamicIslandSafeWrapper>
  );

  // Enhanced Trainers Screen
  const TrainersScreen = () => (
    <DynamicIslandSafeWrapper>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {user?.role === 'trainer' ? 'My Clients' : 'Find Trainers'}
          </Text>
          <NotificationBadge />
        </View>
        
        {user?.role === 'trainer' ? (
          <TrainerDashboard onActivity={handleUserActivity} />
        ) : (
          <TrainerMapView onActivity={handleUserActivity} />
        )}
      </View>
    </DynamicIslandSafeWrapper>
  );

  // Enhanced Fitness Screen
  const FitnessScreen = () => (
    <DynamicIslandSafeWrapper>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness Data</Text>
          <NotificationBadge />
        </View>
        <GoogleFitIntegration onActivity={handleUserActivity} />
      </View>
    </DynamicIslandSafeWrapper>
  );

  // Tab Navigator
  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Trainers') iconName = user?.role === 'trainer' ? 'group' : 'search';
          else if (route.name === 'Fitness') iconName = 'fitness-center';
          
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen 
        name="Trainers" 
        component={TrainersScreen}
        options={{
          title: user?.role === 'trainer' ? 'Clients' : 'Trainers'
        }}
      />
      <Tab.Screen name="Fitness" component={FitnessScreen} />
    </Tab.Navigator>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
      
      {/* Live Notification Center */}
      <NotificationCenter
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      
      {/* Success Overlay */}
      <SuccessOverlay
        visible={showSuccess}
        message={successMessage}
        onHide={() => setShowSuccess(false)}
      />
    </>
  );
};

// Main App with All Providers
const EnhancedApp = () => {
  return (
    <AuthProvider>
      <SecurityProvider>
        <NotificationProvider>
          <MainAppContent />
        </NotificationProvider>
      </SecurityProvider>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBadgeContainer: {
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
  },
  notificationButtonOffline: {
    backgroundColor: '#F5F5F5',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  connectionIndicator: {
    marginTop: 2,
  },
  connected: {
    // Additional styling for connected state
  },
  connectionText: {
    fontSize: 8,
  },
  securityStatus: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  securityValid: {
    backgroundColor: '#E8F5E8',
  },
  securityInvalid: {
    backgroundColor: '#FFF0F0',
  },
  securityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickAction: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  quickActionBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 85 : 65,
  },
});

export default EnhancedApp;