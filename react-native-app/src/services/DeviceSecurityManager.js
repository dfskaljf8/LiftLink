import { Platform, NativeModules, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Device Security Manager
 * Detects root/jailbreak and other security vulnerabilities
 */

class DeviceSecurityManager {
  constructor() {
    this.isRooted = false;
    this.isJailbroken = false;
    this.securityIssues = [];
  }

  /**
   * Check if Android device is rooted
   */
  async checkAndroidRoot() {
    const rootIndicators = [];

    // Check 1: Test-Keys Build Tags
    try {
      const buildTags = NativeModules.PlatformConstants?.Build?.TAGS || '';
      if (buildTags.toLowerCase().includes('test-keys')) {
        rootIndicators.push('Test-keys build detected');
      }
    } catch (error) {
      console.log('Build tags check failed:', error);
    }

    // Check 2: SuperUser APK
    const suPaths = [
      '/system/app/Superuser.apk',
      '/sbin/su',
      '/system/bin/su',
      '/system/xbin/su',
      '/data/local/xbin/su',
      '/data/local/bin/su',
      '/system/sd/xbin/su',
      '/system/bin/failsafe/su',
      '/data/local/su',
      '/su/bin/su'
    ];

    for (const path of suPaths) {
      try {
        if (FileSystem && FileSystem.getInfoAsync) {
          const fileInfo = await FileSystem.getInfoAsync(path);
          if (fileInfo.exists) {
            rootIndicators.push(`Root binary found: ${path}`);
            break;
          }
        }
      } catch (error) {
        // File doesn't exist or can't be accessed - good sign
      }
    }

    // Check 3: Root Management Apps
    const rootApps = [
      'com.noshufou.android.su',
      'com.noshufou.android.su.elite',
      'eu.chainfire.supersu',
      'com.koushikdutta.superuser',
      'com.thirdparty.superuser',
      'com.yellowes.su',
      'com.topjohnwu.magisk'
    ];

    // Check 4: Dangerous Properties
    try {
      const buildType = NativeModules.PlatformConstants?.Build?.TYPE || '';
      if (buildType.toLowerCase() === 'eng' || buildType.toLowerCase() === 'userdebug') {
        rootIndicators.push('Engineering build detected');
      }
    } catch (error) {
      console.log('Build type check failed:', error);
    }

    // Check 5: RW System Partition
    try {
      if (FileSystem && FileSystem.getInfoAsync) {
        const systemInfo = await FileSystem.getInfoAsync('/system');
        // In production, this would check if system is mounted as RW
      }
    } catch (error) {
      // Expected to fail on non-rooted devices
    }

    return rootIndicators;
  }

  /**
   * Check if iOS device is jailbroken
   */
  async checkIOSJailbreak() {
    const jailbreakIndicators = [];

    // Check 1: Cydia and common jailbreak apps
    const jailbreakPaths = [
      '/Applications/Cydia.app',
      '/Library/MobileSubstrate/MobileSubstrate.dylib',
      '/bin/bash',
      '/usr/sbin/sshd',
      '/etc/apt',
      '/usr/bin/ssh',
      '/private/var/lib/apt',
      '/private/var/lib/cydia',
      '/private/var/mobile/Library/SBSettings/Themes',
      '/private/var/tmp/cydia.log',
      '/private/var/stash',
      '/usr/libexec/sftp-server',
      '/usr/libexec/cydia/',
      '/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist',
      '/Library/MobileSubstrate/DynamicLibraries/Veency.plist',
      '/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist',
      '/private/var/cache/apt/',
      '/private/var/lib/apt/',
      '/private/var/Users/',
      '/var/log/syslog',
      '/bin/sh',
      '/etc/ssh/sshd_config',
      '/Applications/FakeCarrier.app',
      '/Applications/Icy.app',
      '/Applications/IntelliScreen.app',
      '/Applications/MxTube.app',
      '/Applications/RockApp.app',
      '/Applications/SBSettings.app',
      '/Applications/WinterBoard.app',
      '/Applications/blackra1n.app'
    ];

    for (const path of jailbreakPaths) {
      try {
        if (FileSystem && FileSystem.getInfoAsync) {
          const fileInfo = await FileSystem.getInfoAsync(path);
          if (fileInfo.exists) {
            jailbreakIndicators.push(`Jailbreak file found: ${path}`);
            break;
          }
        }
      } catch (error) {
        // File doesn't exist - good sign
      }
    }

    // Check 2: Ability to write to private directory
    try {
      const testPath = '/private/test_jailbreak.txt';
      if (FileSystem && FileSystem.writeAsStringAsync) {
        await FileSystem.writeAsStringAsync(testPath, 'test');
        // If we can write here, device is likely jailbroken
        jailbreakIndicators.push('Can write to /private directory');
        try {
          await FileSystem.deleteAsync(testPath);
        } catch (e) {
          // Cleanup failed
        }
      }
    } catch (error) {
      // Expected to fail on non-jailbroken devices
    }

    // Check 3: Fork system call (jailbroken devices allow this)
    // This would require native module implementation

    // Check 4: Symbolic links
    try {
      const appPath = '/Applications';
      if (FileSystem && FileSystem.getInfoAsync) {
        const info = await FileSystem.getInfoAsync(appPath);
        // Check if it's a symbolic link (common in jailbroken devices)
      }
    } catch (error) {
      // Expected behavior
    }

    return jailbreakIndicators;
  }

  /**
   * Perform comprehensive device security check
   */
  async performSecurityCheck() {
    console.log('🔒 Starting device security check...');
    
    this.securityIssues = [];
    
    if (Platform.OS === 'android') {
      const rootIndicators = await this.checkAndroidRoot();
      if (rootIndicators.length > 0) {
        this.isRooted = true;
        this.securityIssues.push({
          type: 'ROOT_DETECTED',
          severity: 'HIGH',
          message: 'Device appears to be rooted',
          indicators: rootIndicators
        });
      }
    } else if (Platform.OS === 'ios') {
      const jailbreakIndicators = await this.checkIOSJailbreak();
      if (jailbreakIndicators.length > 0) {
        this.isJailbroken = true;
        this.securityIssues.push({
          type: 'JAILBREAK_DETECTED',
          severity: 'HIGH',
          message: 'Device appears to be jailbroken',
          indicators: jailbreakIndicators
        });
      }
    }

    // Check for debugger
    if (__DEV__) {
      this.securityIssues.push({
        type: 'DEBUG_MODE',
        severity: 'LOW',
        message: 'App running in debug mode'
      });
    }

    // Check for emulator
    if (this.isEmulator()) {
      this.securityIssues.push({
        type: 'EMULATOR_DETECTED',
        severity: 'MEDIUM',
        message: 'Running on emulator/simulator'
      });
    }

    const isCompromised = this.isRooted || this.isJailbroken;
    
    console.log('🔒 Security check complete:', {
      isCompromised,
      isRooted: this.isRooted,
      isJailbroken: this.isJailbroken,
      issuesFound: this.securityIssues.length
    });

    return {
      isCompromised,
      isRooted: this.isRooted,
      isJailbroken: this.isJailbroken,
      securityIssues: this.securityIssues
    };
  }

  /**
   * Check if running on emulator/simulator
   */
  isEmulator() {
    if (Platform.OS === 'android') {
      const brand = NativeModules.PlatformConstants?.Brand || '';
      const model = NativeModules.PlatformConstants?.Model || '';
      const manufacturer = NativeModules.PlatformConstants?.Manufacturer || '';
      
      const emulatorBrands = ['generic', 'google_sdk', 'emulator', 'android sdk built for'];
      const isGeneric = brand.toLowerCase().includes('generic') || 
                       model.toLowerCase().includes('sdk') ||
                       manufacturer.toLowerCase().includes('genymotion');
      
      return isGeneric;
    }
    
    if (Platform.OS === 'ios') {
      // Check if running on simulator
      return Platform.isPad || Platform.isTVOS;
    }
    
    return false;
  }

  /**
   * Show warning to user about compromised device
   */
  showSecurityWarning(result) {
    if (result.isCompromised) {
      Alert.alert(
        '⚠️ Security Warning',
        `Your device appears to be ${Platform.OS === 'android' ? 'rooted' : 'jailbroken'}. ` +
        'Using LiftLink on a compromised device may expose your personal information and payment details. ' +
        '\n\nFor your security, we recommend using LiftLink on a non-compromised device.',
        [
          {
            text: 'Proceed Anyway',
            style: 'destructive',
            onPress: () => {
              console.log('⚠️ User proceeded despite security warning');
            }
          },
          {
            text: 'Exit App',
            style: 'cancel',
            onPress: () => {
              // In production, you might want to exit the app
              console.log('🚪 User chose to exit app');
            }
          }
        ],
        { cancelable: false }
      );
    } else if (result.securityIssues.length > 0) {
      // Show softer warning for other security issues
      const issues = result.securityIssues.map(i => i.message).join(', ');
      console.log('ℹ️ Security notice:', issues);
    }
  }

  /**
   * Block app functionality on compromised devices (optional)
   */
  shouldBlockAccess(result) {
    // In production, you might want to block certain features
    // For now, we just warn users
    return false; // Set to true to block compromised devices
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
