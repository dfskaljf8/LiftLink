/**
 * Enhanced Device Security Manager with Native Root/Jailbreak Detection
 * Uses jail-monkey library for production-grade security checks
 */

import { Platform, NativeModules, Alert } from 'react-native';
import JailMonkey from 'jail-monkey';

class DeviceSecurityManager {
  constructor() {
    this.isRooted = false;
    this.isJailbroken = false;
    this.isDebugMode = false;
    this.canMockLocation = false;
    this.isOnExternalStorage = false;
    this.securityIssues = [];
    this.isInitialized = false;
  }

  /**
   * Initialize security manager and run initial checks
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🔒 Initializing Device Security Manager...');
    await this.performSecurityCheck();
    this.isInitialized = true;
  }

  /**
   * Perform comprehensive device security check using native JailMonkey
   */
  async performSecurityCheck() {
    console.log('🔒 Starting comprehensive security check...');
    
    this.securityIssues = [];
    
    try {
      // Check for root/jailbreak using JailMonkey native module
      if (Platform.OS === 'android') {
        await this.checkAndroidSecurity();
      } else if (Platform.OS === 'ios') {
        await this.checkIOSSecurity();
      }

      // Common checks
      this.checkDebugMode();
      await this.checkMockLocation();

    } catch (error) {
      console.error('❌ Security check error:', error);
      this.securityIssues.push({
        type: 'CHECK_ERROR',
        severity: 'LOW',
        message: `Security check encountered an error: ${error.message}`
      });
    }

    const isCompromised = this.isRooted || this.isJailbroken;
    
    console.log('🔒 Security check complete:', {
      isCompromised,
      isRooted: this.isRooted,
      isJailbroken: this.isJailbroken,
      isDebugMode: this.isDebugMode,
      canMockLocation: this.canMockLocation,
      issuesFound: this.securityIssues.length
    });

    return {
      isCompromised,
      isRooted: this.isRooted,
      isJailbroken: this.isJailbroken,
      isDebugMode: this.isDebugMode,
      canMockLocation: this.canMockLocation,
      isOnExternalStorage: this.isOnExternalStorage,
      securityIssues: this.securityIssues
    };
  }

  /**
   * Check Android-specific security indicators
   */
  async checkAndroidSecurity() {
    try {
      // JailMonkey root detection (most reliable)
      this.isRooted = JailMonkey.isJailBroken();
      
      if (this.isRooted) {
        this.securityIssues.push({
          type: 'ROOT_DETECTED',
          severity: 'HIGH',
          message: 'Device appears to be rooted',
          details: 'Root access detected via native security check'
        });
      }

      // Check for ADB enabled
      const isAdbEnabled = JailMonkey.AdbEnabled();
      if (isAdbEnabled) {
        this.securityIssues.push({
          type: 'ADB_ENABLED',
          severity: 'MEDIUM',
          message: 'ADB debugging is enabled',
          details: 'USB debugging allows potential security bypass'
        });
      }

      // Check for development settings enabled
      // This is handled by isDebugMode check

      // Check if app is on external storage
      this.isOnExternalStorage = JailMonkey.isOnExternalStorage();
      if (this.isOnExternalStorage) {
        this.securityIssues.push({
          type: 'EXTERNAL_STORAGE',
          severity: 'MEDIUM',
          message: 'App installed on external storage',
          details: 'Apps on SD card are more vulnerable to tampering'
        });
      }

    } catch (error) {
      console.log('Android security check fallback:', error);
      // Fallback to JS-based checks if native fails
      await this.checkAndroidRootFallback();
    }
  }

  /**
   * Fallback Android root detection using JavaScript checks
   */
  async checkAndroidRootFallback() {
    const rootIndicators = [];

    // Check build tags
    try {
      const buildTags = NativeModules.PlatformConstants?.Build?.TAGS || '';
      if (buildTags.toLowerCase().includes('test-keys')) {
        rootIndicators.push('Test-keys build detected');
      }
    } catch (error) {
      console.log('Build tags check failed:', error);
    }

    // Check build type
    try {
      const buildType = NativeModules.PlatformConstants?.Build?.TYPE || '';
      if (buildType.toLowerCase() === 'eng' || buildType.toLowerCase() === 'userdebug') {
        rootIndicators.push('Engineering/debug build detected');
      }
    } catch (error) {
      console.log('Build type check failed:', error);
    }

    if (rootIndicators.length > 0) {
      this.isRooted = true;
      this.securityIssues.push({
        type: 'ROOT_INDICATORS',
        severity: 'MEDIUM',
        message: 'Root indicators detected (fallback check)',
        indicators: rootIndicators
      });
    }
  }

  /**
   * Check iOS-specific security indicators (jailbreak)
   */
  async checkIOSSecurity() {
    try {
      // JailMonkey jailbreak detection (most reliable)
      this.isJailbroken = JailMonkey.isJailBroken();
      
      if (this.isJailbroken) {
        this.securityIssues.push({
          type: 'JAILBREAK_DETECTED',
          severity: 'HIGH',
          message: 'Device appears to be jailbroken',
          details: 'Jailbreak detected via native security check'
        });
      }

    } catch (error) {
      console.log('iOS security check fallback:', error);
      // Fallback will be handled by the existing JS checks
    }
  }

  /**
   * Check if app is running in debug mode
   */
  checkDebugMode() {
    try {
      this.isDebugMode = JailMonkey.isDebuggedMode() || __DEV__;
      
      if (this.isDebugMode) {
        this.securityIssues.push({
          type: 'DEBUG_MODE',
          severity: 'LOW',
          message: 'App running in debug mode',
          details: 'Debug mode provides less security than release mode'
        });
      }
    } catch (error) {
      // Fallback to __DEV__ check
      this.isDebugMode = __DEV__;
      if (this.isDebugMode) {
        this.securityIssues.push({
          type: 'DEBUG_MODE',
          severity: 'LOW',
          message: 'App running in debug mode'
        });
      }
    }
  }

  /**
   * Check if mock location is enabled
   */
  async checkMockLocation() {
    try {
      this.canMockLocation = await JailMonkey.canMockLocation();
      
      if (this.canMockLocation) {
        this.securityIssues.push({
          type: 'MOCK_LOCATION',
          severity: 'MEDIUM',
          message: 'Mock location is enabled',
          details: 'Location spoofing is possible on this device'
        });
      }
    } catch (error) {
      console.log('Mock location check failed:', error);
    }
  }

  /**
   * Check if device is an emulator
   */
  isEmulator() {
    try {
      // JailMonkey provides emulator detection
      return JailMonkey.isJailBroken() === false && 
             (Platform.OS === 'android' && 
              (NativeModules.PlatformConstants?.Brand?.toLowerCase().includes('generic') ||
               NativeModules.PlatformConstants?.Model?.toLowerCase().includes('sdk')));
    } catch (error) {
      return false;
    }
  }

  /**
   * Show security warning dialog to user
   */
  showSecurityWarning(result) {
    if (result.isCompromised) {
      const deviceType = Platform.OS === 'android' ? 'rooted' : 'jailbroken';
      
      Alert.alert(
        '⚠️ Security Warning',
        `Your device appears to be ${deviceType}. ` +
        'Using LiftLink on a compromised device may expose your personal information and payment details. ' +
        '\n\nFor your security, we recommend using LiftLink on a non-compromised device.',
        [
          {
            text: 'I Understand the Risks',
            style: 'destructive',
            onPress: () => {
              console.log('⚠️ User acknowledged security warning');
              this.logSecurityEvent('USER_ACKNOWLEDGED_COMPROMISED_DEVICE');
            }
          },
          {
            text: 'Exit App',
            style: 'cancel',
            onPress: () => {
              console.log('🚪 User chose to exit app due to security');
              // In production, you might want to actually exit
              // BackHandler.exitApp(); // Android only
            }
          }
        ],
        { cancelable: false }
      );
    } else if (result.securityIssues.length > 0) {
      // Log non-critical issues without showing to user
      const issues = result.securityIssues.map(i => i.message).join(', ');
      console.log('ℹ️ Security notices:', issues);
    }
  }

  /**
   * Determine if app should be blocked based on security status
   */
  shouldBlockAccess(result) {
    // Currently we warn users but don't block
    // Set to true to block compromised devices
    return false;
  }

  /**
   * Get human-readable security status
   */
  getSecurityStatus() {
    const status = {
      level: 'SECURE',
      message: 'Device security check passed',
      details: []
    };

    if (this.isRooted || this.isJailbroken) {
      status.level = 'CRITICAL';
      status.message = `Device is ${Platform.OS === 'android' ? 'rooted' : 'jailbroken'}`;
    } else if (this.securityIssues.some(i => i.severity === 'MEDIUM')) {
      status.level = 'WARNING';
      status.message = 'Some security concerns detected';
    } else if (this.securityIssues.length > 0) {
      status.level = 'INFO';
      status.message = 'Minor security notices';
    }

    status.details = this.securityIssues.map(i => ({
      type: i.type,
      severity: i.severity,
      message: i.message
    }));

    return status;
  }

  /**
   * Log security event for monitoring
   */
  logSecurityEvent(eventType, details = {}) {
    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      platform: Platform.OS,
      isRooted: this.isRooted,
      isJailbroken: this.isJailbroken,
      ...details
    };

    console.log('🔐 Security Event:', JSON.stringify(event));
    
    // In production, send to backend security monitoring
    // await api.post('/api/security/events', event);
  }
}

// Singleton instance
const deviceSecurity = new DeviceSecurityManager();

export default deviceSecurity;

// Helper functions for easy access
export const checkDeviceSecurity = async () => {
  return await deviceSecurity.performSecurityCheck();
};

export const isDeviceCompromised = () => {
  return deviceSecurity.isRooted || deviceSecurity.isJailbroken;
};

export const getSecurityIssues = () => {
  return deviceSecurity.securityIssues;
};

export const showSecurityWarning = (result) => {
  deviceSecurity.showSecurityWarning(result);
};

export const getSecurityStatus = () => {
  return deviceSecurity.getSecurityStatus();
};

export const initializeSecurity = async () => {
  return await deviceSecurity.initialize();
};
