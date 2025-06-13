import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.liftlink.app',
  appName: 'LiftLink',
  webDir: 'build',
  server: {
    url: 'https://fd415076-40f8-4e16-bde7-e9903ea200b3.preview.emergentagent.com',
    cleartext: true
  },
  plugins: {
    CapacitorHealthKit: {
      permissions: [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKCategoryTypeIdentifierSleepAnalysis',
        'HKQuantityTypeIdentifierBodyMass',
        'HKWorkoutTypeIdentifier'
      ]
    },
    Geolocation: {
      permissions: [
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION'
      ]
    },
    Camera: {
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE'
      ]
    },
    Contacts: {
      permissions: [
        'READ_CONTACTS'
      ]
    }
  },
  ios: {
    backgroundColor: '#000000',
    scheme: 'LiftLink',
    allowsLinkPreview: false,
    toolbarStyle: 'dark',
    statusBarStyle: 'dark',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    webContentsDebuggingEnabled: true
  },
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;