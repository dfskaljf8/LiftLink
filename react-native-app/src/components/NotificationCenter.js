import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationManager';
import { useSecurity } from './SecurityProvider';
import { LoadingOverlay, ErrorOverlay, SuccessOverlay } from './LoadingOverlay';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const NotificationCenter = ({ visible, onClose }) => {
  const { user, token } = useAuth();
  const { notifications, unreadCount, connected, markNotificationAsRead } = useNotifications();
  const { validatePermission, updateActivity } = useSecurity();
  
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

if (!API_BASE_URL) {
  console.error('❌ REACT_APP_BACKEND_URL is not set!');
}

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Load notifications from API
  const loadNotifications = async (showLoader = true) => {
    if (!user || !token) return;

    // Validate permission to access notifications
    const permission = validatePermission('access_notifications', user.id);
    if (!permission.allowed) {
      setError(permission.reason);
      return;
    }

    if (showLoader) setLoading(true);
    setError(null);

    try {
      updateActivity();

      const response = await axios.get(
        `${API_BASE_URL}/api/users/${user.id}/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 }
        }
      );

      if (response.data && response.data.notifications) {
        setLocalNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You can only view your own notifications.');
      } else {
        setError('Failed to load notifications. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!user || !token) return;

    try {
      updateActivity();

      await axios.put(
        `${API_BASE_URL}/api/users/${user.id}/notifications/${notificationId}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setLocalNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );

      // Update global notification manager
      markNotificationAsRead(notificationId);

      setShowSuccess(true);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Handle notification press
  const handleNotificationPress = (notification) => {
    updateActivity();

    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.data?.type) {
      case 'friend_request_received':
        // Navigate to friend requests screen
        Alert.alert('Friend Request', notification.message, [
          { text: 'Later', style: 'cancel' },
          { text: 'View Requests', onPress: () => handleViewFriendRequests() }
        ]);
        break;
        
      case 'friend_request_accepted':
        Alert.alert('Great News!', notification.message);
        break;
        
      case 'payment_received':
        Alert.alert('Payment Received', notification.message);
        break;
        
      case 'session_booked':
        Alert.alert('Session Booked', notification.message);
        break;
        
      case 'session_cancelled':
        Alert.alert('Session Update', notification.message);
        break;
        
      default:
        Alert.alert(notification.title, notification.message);
    }
  };

  const handleViewFriendRequests = () => {
    // This would navigate to friend requests screen
    console.log('Navigate to friend requests');
    onClose();
  };

  // Refresh notifications
  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  // Load notifications when component mounts or user changes
  useEffect(() => {
    if (visible && user) {
      loadNotifications();
    }
  }, [visible, user]);

  // Merge live notifications with loaded notifications
  const allNotifications = React.useMemo(() => {
    const combined = [...notifications, ...localNotifications];
    const uniqueNotifications = combined.reduce((acc, current) => {
      const exists = acc.find(item => item.id === current.id);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueNotifications.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }, [notifications, localNotifications]);

  // Render notification item
  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationTime}>
          {formatNotificationTime(item.created_at)}
        </Text>
      </View>
      
      <Text style={styles.notificationMessage} numberOfLines={3}>
        {item.message}
      </Text>
      
      {!item.read && <View style={styles.unreadIndicator} />}
      
      {item.data?.type && (
        <View style={[styles.typeIndicator, getTypeStyle(item.data.type)]}>
          <Text style={styles.typeText}>{getTypeLabel(item.data.type)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'friend_request_received': return styles.friendRequestType;
      case 'friend_request_accepted': return styles.friendAcceptedType;
      case 'payment_received': return styles.paymentType;
      case 'session_booked': return styles.sessionType;
      case 'session_cancelled': return styles.cancelType;
      default: return styles.defaultType;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'friend_request_received': return 'Friend Request';
      case 'friend_request_accepted': return 'Friend Accepted';
      case 'payment_received': return 'Payment';
      case 'session_booked': return 'Booking';
      case 'session_cancelled': return 'Cancelled';
      default: return 'Notification';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight}>
            <View style={[styles.connectionStatus, connected && styles.connected]}>
              <Text style={styles.connectionText}>
                {connected ? '🟢 Live' : '🔴 Offline'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unread count */}
        {unreadCount > 0 && (
          <View style={styles.unreadCountContainer}>
            <Text style={styles.unreadCountText}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Notifications List */}
        <FlatList
          data={allNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4A90E2']}
              tintColor="#4A90E2"
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No notifications yet</Text>
              <Text style={styles.emptyStateSubtext}>
                You'll see friend requests, payments, and booking updates here
              </Text>
            </View>
          )}
        />
      </Animated.View>

      {/* Loading and Error Overlays */}
      <LoadingOverlay visible={loading} message="Loading notifications..." />
      <ErrorOverlay 
        visible={!!error} 
        message={error} 
        onClose={() => setError(null)}
        onRetry={() => loadNotifications()}
      />
      <SuccessOverlay
        visible={showSuccess}
        message="Notification marked as read"
        onHide={() => setShowSuccess(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.8,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFE6E6',
  },
  connected: {
    backgroundColor: '#E6F7E6',
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  unreadCountContainer: {
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  unreadCountText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingVertical: 10,
  },
  notificationItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  unreadNotification: {
    borderColor: '#4A90E2',
    backgroundColor: '#F9FCFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  typeIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  friendRequestType: { backgroundColor: '#9B59B6' },
  friendAcceptedType: { backgroundColor: '#27AE60' },
  paymentType: { backgroundColor: '#F39C12' },
  sessionType: { backgroundColor: '#3498DB' },
  cancelType: { backgroundColor: '#E74C3C' },
  defaultType: { backgroundColor: '#95A5A6' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default NotificationCenter;