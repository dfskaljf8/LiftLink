import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);

  const WS_BASE_URL = process.env.REACT_APP_BACKEND_URL?.replace('https://', 'wss://') || 'wss://liftlink-ra6t.onrender.com';

  // Connect to WebSocket for live notifications
  const connectWebSocket = () => {
    if (!user || !token) return;

    try {
      const wsUrl = `${WS_BASE_URL}/ws/notifications/${user.id}?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔗 Connected to live notifications');
        setConnected(true);
        
        // Start ping/pong to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Ping every 30 seconds
      };

      wsRef.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          if (notification.type === 'pong') {
            // Pong response - connection is alive
            return;
          }

          if (notification.type === 'notification') {
            // New notification received
            handleNewNotification(notification);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('📱 WebSocket connection closed:', event.code, event.reason);
        setConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && user && token) {
          attemptReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      attemptReconnect();
    }
  };

  const attemptReconnect = () => {
    // Clear existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Attempt reconnection after 5 seconds
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect WebSocket...');
      connectWebSocket();
    }, 5000);
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User logout');
      wsRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setConnected(false);
  };

  // Handle new live notification
  const handleNewNotification = (notification) => {
    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification for immediate feedback
    showToast(notification);

    // Show alert for high-priority notifications
    if (notification.priority === 'high' || notification.data?.type === 'friend_request_received') {
      setTimeout(() => {
        Alert.alert(
          notification.title,
          notification.message,
          [
            { text: 'OK', style: 'default' },
            { text: 'View', onPress: () => handleNotificationPress(notification) }
          ]
        );
      }, 1000); // Delay to show after toast
    }

    console.log('📱 Live notification received:', notification.title);
  };

  const showToast = (notification) => {
    // This would integrate with a global toast system
    // For now, we'll use a callback that can be set from outside
    if (window.showGlobalToast) {
      window.showGlobalToast(notification);
    }
  };

  const handleNotificationPress = (notification) => {
    // Handle notification tap - can navigate to specific screens
    console.log('Notification pressed:', notification);
    
    // Mark as read
    markNotificationAsRead(notification.id);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // API call to mark as read will be handled by the specific notification component
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Connect/disconnect based on auth status
  useEffect(() => {
    if (user && token) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [user, token]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && user && token && !connected) {
        // App came to foreground, reconnect if needed
        connectWebSocket();
      } else if (nextAppState === 'background') {
        // App went to background, keep connection but reduce activity
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [user, token, connected]);

  const value = {
    notifications,
    unreadCount,
    connected,
    handleNotificationPress,
    markNotificationAsRead,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;