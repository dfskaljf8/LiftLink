import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Platform,
  PermissionsAndroid,
  BackHandler,
  ToastAndroid,
  Vibration,
  Linking,
  AppState,
  StatusBar,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Note: These would be actual dependencies in a real app
// import PushNotification, { Importance } from 'react-native-push-notification';
// import DeviceInfo from 'react-native-device-info';

// Mock implementations for now
const PushNotification = {
  configure: () => {},
  createChannel: () => {},
  localNotification: () => {},
};

const DeviceInfo = {
  getUniqueId: () => Promise.resolve('android-device-id'),
  getSystemName: () => 'Android',
  getSystemVersion: () => Platform.Version.toString(),
  getModel: () => 'Android Device',
  getBrand: () => 'Android',
  getBuildNumber: () => '1.0.0',
  getBundleId: () => 'com.liftlink',
  getReadableVersion: () => '1.0.0',
  hasNotch: () => false,
  getBatteryLevel: () => Promise.resolve(0.8),
  isTablet: () => false,
};

const Importance = {
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
};

const AndroidContext = createContext();

export const useAndroid = () => {
  const context = useContext(AndroidContext);
  if (!context) {
    throw new Error('useAndroid must be used within an AndroidProvider');
  }
  return context;
};

export const AndroidProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [deviceInfo, setDeviceInfo] = useState({});
  const [backPressCount, setBackPressCount] = useState(0);

  // Initialize Android-specific features
  useEffect(() => {
    if (Platform.OS === 'android') {
      initializeAndroidFeatures();
      setupBackHandler();
      setupPushNotifications();
      getDeviceInfo();
    }
  }, []);

  const initializeAndroidFeatures = async () => {
    console.log('🤖 Initializing Android-specific features');
    
    // Request essential permissions
    await requestPermissions();
    
    // Configure status bar for Android
    StatusBar.setBackgroundColor('#4A90E2', true);
    StatusBar.setBarStyle('light-content', true);
    StatusBar.setTranslucent(false);
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const permissionResults = {};

      // Camera permission for document verification
      const cameraPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'LiftLink Camera Permission',
          message: 'LiftLink needs camera access for document verification and profile photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      permissionResults.camera = cameraPermission;

      // Location permission for trainer map
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'LiftLink Location Permission',
          message: 'LiftLink needs location access to find trainers near you',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      permissionResults.location = locationPermission;

      // Storage permission for file uploads
      const storagePermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'LiftLink Storage Permission',
          message: 'LiftLink needs storage access to save and upload documents',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      permissionResults.storage = storagePermission;

      // Notification permission (Android 13+)
      if (Platform.Version >= 33) {
        const notificationPermission = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS',
          {
            title: 'LiftLink Notification Permission',
            message: 'Allow LiftLink to send you important notifications about bookings, payments, and messages',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionResults.notifications = notificationPermission;
      }

      setPermissions(permissionResults);
      console.log('🔐 Android permissions requested:', permissionResults);
      
    } catch (err) {
      console.warn('❌ Permission request error:', err);
    }
  };

  const setupBackHandler = () => {
    if (Platform.OS !== 'android') return;

    const backAction = () => {
      if (backPressCount === 0) {
        setBackPressCount(1);
        showToast('Press back again to exit LiftLink');
        setTimeout(() => setBackPressCount(0), 2000);
        return true; // Prevent default behavior
      } else {
        // Exit app on second back press
        BackHandler.exitApp();
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  };

  const setupPushNotifications = () => {
    if (Platform.OS !== 'android') return;

    // Configure push notifications for Android
    PushNotification.configure({
      onRegister: function (token) {
        console.log('📱 Android Push Notification Token:', token);
        // Store token for backend
        AsyncStorage.setItem('fcm_token', token.token);
      },

      onNotification: function (notification) {
        console.log('📱 Android Push Notification:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          handleNotificationTap(notification);
        }
      },

      onAction: function (notification) {
        console.log('📱 Notification action:', notification.action);
      },

      onRegistrationError: function (err) {
        console.error('❌ Push notification registration error:', err.message);
      },

      // Android specific settings
      senderID: "YOUR_FCM_SENDER_ID", // Replace with your FCM sender ID
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels for Android
    createNotificationChannels();
  };

  const createNotificationChannels = () => {
    if (Platform.OS !== 'android') return;

    // High priority channel for friend requests and bookings
    PushNotification.createChannel({
      channelId: 'liftlink-high',
      channelName: 'LiftLink Important',
      channelDescription: 'Important notifications like friend requests and bookings',
      importance: Importance.HIGH,
      vibrate: true,
      soundName: 'default',
    });

    // Normal priority for general notifications
    PushNotification.createChannel({
      channelId: 'liftlink-normal',
      channelName: 'LiftLink General',
      channelDescription: 'General app notifications',
      importance: Importance.DEFAULT,
      vibrate: false,
    });

    // Low priority for background sync
    PushNotification.createChannel({
      channelId: 'liftlink-low',
      channelName: 'LiftLink Background',
      channelDescription: 'Background sync notifications',
      importance: Importance.LOW,
      vibrate: false,
    });
  };

  const showLocalNotification = (notification) => {
    if (Platform.OS !== 'android') return;

    const channelId = notification.priority === 'high' ? 'liftlink-high' : 'liftlink-normal';

    PushNotification.localNotification({
      channelId,
      title: notification.title,
      message: notification.message,
      bigText: notification.message,
      subText: 'LiftLink',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: '#4A90E2',
      vibrate: notification.priority === 'high',
      ongoing: false,
      userInfo: notification.data || {},
      actions: notification.actions || [],
    });
  };

  const handleNotificationTap = (notification) => {
    // Handle different notification types
    const notificationData = notification.data || {};
    
    switch (notificationData.type) {
      case 'friend_request_received':
        // Navigate to friend requests
        break;
      case 'session_booked':
        // Navigate to schedule
        break;
      case 'payment_received':
        // Navigate to earnings
        break;
      default:
        // Navigate to notifications
        break;
    }
  };

  const showToast = (message, duration = 'SHORT') => {
    if (Platform.OS !== 'android') return;
    
    const toastDuration = duration === 'LONG' ? ToastAndroid.LONG : ToastAndroid.SHORT;
    ToastAndroid.show(message, toastDuration);
  };

  const hapticFeedback = (type = 'selection') => {
    if (Platform.OS !== 'android') return;
    
    switch (type) {
      case 'light':
        Vibration.vibrate(25);
        break;
      case 'medium':
        Vibration.vibrate(50);
        break;
      case 'heavy':
        Vibration.vibrate(100);
        break;
      case 'success':
        Vibration.vibrate([0, 50, 50, 50]);
        break;
      case 'error':
        Vibration.vibrate([0, 100, 100, 100, 100, 100]);
        break;
      default:
        Vibration.vibrate(25);
    }
  };

  const getDeviceInfo = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const info = {
        deviceId: await DeviceInfo.getUniqueId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        model: DeviceInfo.getModel(),
        brand: DeviceInfo.getBrand(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundle: DeviceInfo.getBundleId(),
        readableVersion: DeviceInfo.getReadableVersion(),
        hasNotch: DeviceInfo.hasNotch(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
        isTablet: DeviceInfo.isTablet(),
      };

      setDeviceInfo(info);
      console.log('📱 Android Device Info:', info);
    } catch (error) {
      console.error('❌ Error getting device info:', error);
    }
  };

  const openAppSettings = () => {
    if (Platform.OS !== 'android') return;
    Linking.openSettings();
  };

  const shareApp = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const result = await Share.share({
        message: 'Check out LiftLink - Connect with fitness trainers and reach your goals! Download now: https://play.google.com/store/apps/details?id=com.liftlink',
        url: 'https://play.google.com/store/apps/details?id=com.liftlink',
        title: 'Share LiftLink App',
      });
    } catch (error) {
      console.error('❌ Error sharing app:', error);
    }
  };

  const checkPermission = async (permission) => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.check(permission);
      return granted;
    } catch (error) {
      console.error('❌ Error checking permission:', error);
      return false;
    }
  };

  const value = {
    permissions,
    deviceInfo,
    isAndroid: Platform.OS === 'android',
    
    // Functions
    requestPermissions,
    showLocalNotification,
    showToast,
    hapticFeedback,
    openAppSettings,
    shareApp,
    checkPermission,
    
    // Device info
    androidVersion: Platform.Version,
  };

  return (
    <AndroidContext.Provider value={value}>
      {children}
    </AndroidContext.Provider>
  );
};

export default AndroidProvider;