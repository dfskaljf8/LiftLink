import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  PanGestureHandler,
  State
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const NotificationToast = ({ 
  visible, 
  notification, 
  onPress, 
  onDismiss, 
  duration = 4000,
  position = 'top' // 'top' or 'bottom'
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);

  // Auto-dismiss timer
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible && notification) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, notification]);

  const showToast = () => {
    setIsVisible(true);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after duration
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -200 : 200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss && onDismiss();
    });
  };

  const handlePress = () => {
    hideToast();
    onPress && onPress(notification);
  };

  const handleSwipe = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (Math.abs(nativeEvent.translationX) > 50) {
        hideToast();
      }
    }
  };

  const getToastStyle = () => {
    const baseStyle = [
      styles.toastContainer,
      position === 'top' ? styles.toastTop : styles.toastBottom
    ];

    if (notification?.data?.type) {
      switch (notification.data.type) {
        case 'friend_request_received':
          return [...baseStyle, styles.friendRequestToast];
        case 'friend_request_accepted':
          return [...baseStyle, styles.friendAcceptedToast];
        case 'payment_received':
          return [...baseStyle, styles.paymentToast];
        case 'session_booked':
          return [...baseStyle, styles.sessionToast];
        case 'session_cancelled':
          return [...baseStyle, styles.cancelToast];
        default:
          return [...baseStyle, styles.defaultToast];
      }
    }

    return [...baseStyle, styles.defaultToast];
  };

  const getIcon = () => {
    if (!notification?.data?.type) return 'notifications';
    
    switch (notification.data.type) {
      case 'friend_request_received': return 'person-add';
      case 'friend_request_accepted': return 'check-circle';
      case 'payment_received': return 'payment';
      case 'session_booked': return 'event';
      case 'session_cancelled': return 'event-busy';
      default: return 'notifications';
    }
  };

  if (!isVisible || !notification) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <PanGestureHandler onHandlerStateChange={handleSwipe}>
        <TouchableOpacity
          style={getToastStyle()}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <View style={styles.toastContent}>
            <View style={styles.iconContainer}>
              <Icon 
                name={getIcon()} 
                size={24} 
                color="white" 
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.toastTitle} numberOfLines={1}>
                {notification.title || 'Notification'}
              </Text>
              <Text style={styles.toastMessage} numberOfLines={2}>
                {notification.message || 'You have a new notification'}
              </Text>
              <Text style={styles.toastTime}>
                Just now
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={hideToast}
            >
              <Icon name="close" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          
          {/* Progress indicator */}
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                width: Animated.timing(slideAnim, {
                  toValue: width - 40,
                  duration: duration,
                  useNativeDriver: false,
                })
              }
            ]} 
          />
        </TouchableOpacity>
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 20,
  },
  toastTop: {
    top: Platform.OS === 'ios' ? 50 : 30,
  },
  toastBottom: {
    bottom: Platform.OS === 'ios' ? 100 : 80,
  },
  toastContainer: {
    borderRadius: 12,
    marginHorizontal: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    minHeight: 70,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: 2,
  },
  toastTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  dismissButton: {
    padding: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  // Type-specific styles
  friendRequestToast: {
    backgroundColor: '#9B59B6',
  },
  friendAcceptedToast: {
    backgroundColor: '#27AE60',
  },
  paymentToast: {
    backgroundColor: '#F39C12',
  },
  sessionToast: {
    backgroundColor: '#3498DB',
  },
  cancelToast: {
    backgroundColor: '#E74C3C',
  },
  defaultToast: {
    backgroundColor: '#4A90E2',
  },
});

export default NotificationToast;