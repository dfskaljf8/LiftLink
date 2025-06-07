// Native iOS Health Integration Service
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Contacts } from '@capacitor-community/contacts';

// Health Kit Integration (iOS)
class NativeHealthService {
  constructor() {
    this.isAvailable = false;
  }

  async initialize() {
    try {
      // Check if running on iOS and HealthKit is available
      if (window.Capacitor?.platform === 'ios') {
        // Dynamic import for iOS-specific plugin
        const { CapacitorHealthKit } = await import('capacitor-healthkit');
        this.isAvailable = await CapacitorHealthKit.isAvailable();
        return this.isAvailable;
      }
      return false;
    } catch (error) {
      console.error('HealthKit initialization failed:', error);
      return false;
    }
  }

  async requestPermissions() {
    if (!this.isAvailable) return false;

    try {
      const { CapacitorHealthKit } = await import('capacitor-healthkit');
      
      const permissions = [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKCategoryTypeIdentifierSleepAnalysis',
        'HKQuantityTypeIdentifierBodyMass',
        'HKWorkoutTypeIdentifier'
      ];

      const result = await CapacitorHealthKit.requestAuthorization({
        read: permissions,
        write: []
      });

      return result.granted;
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      return false;
    }
  }

  async getStepsToday() {
    if (!this.isAvailable) return 0;

    try {
      const { CapacitorHealthKit } = await import('capacitor-healthkit');
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'HKQuantityTypeIdentifierStepCount',
        startDate: startOfDay.toISOString(),
        endDate: today.toISOString(),
        limit: 1000
      });

      const totalSteps = result.resultData.reduce((sum, sample) => {
        return sum + (sample.quantity || 0);
      }, 0);

      return Math.round(totalSteps);
    } catch (error) {
      console.error('Failed to get steps:', error);
      return 0;
    }
  }

  async getHeartRateToday() {
    if (!this.isAvailable) return 0;

    try {
      const { CapacitorHealthKit } = await import('capacitor-healthkit');
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'HKQuantityTypeIdentifierHeartRate',
        startDate: startOfDay.toISOString(),
        endDate: today.toISOString(),
        limit: 100
      });

      if (result.resultData.length === 0) return 0;

      const avgHeartRate = result.resultData.reduce((sum, sample) => {
        return sum + (sample.quantity || 0);
      }, 0) / result.resultData.length;

      return Math.round(avgHeartRate);
    } catch (error) {
      console.error('Failed to get heart rate:', error);
      return 0;
    }
  }

  async getActiveEnergyToday() {
    if (!this.isAvailable) return 0;

    try {
      const { CapacitorHealthKit } = await import('capacitor-healthkit');
      
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'HKQuantityTypeIdentifierActiveEnergyBurned',
        startDate: startOfDay.toISOString(),
        endDate: today.toISOString(),
        limit: 1000
      });

      const totalCalories = result.resultData.reduce((sum, sample) => {
        return sum + (sample.quantity || 0);
      }, 0);

      return Math.round(totalCalories);
    } catch (error) {
      console.error('Failed to get active energy:', error);
      return 0;
    }
  }
}

// GPS Location Service
class NativeLocationService {
  async getCurrentPosition() {
    try {
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location === 'granted') {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      }
      
      throw new Error('Location permission not granted');
    } catch (error) {
      console.error('Failed to get location:', error);
      throw error;
    }
  }

  async watchPosition(callback) {
    try {
      const watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000
      }, callback);
      
      return watchId;
    } catch (error) {
      console.error('Failed to watch position:', error);
      throw error;
    }
  }
}

// Camera Service for ID Verification
class NativeCameraService {
  async takePhoto() {
    try {
      const permissions = await Camera.requestPermissions();
      
      if (permissions.camera === 'granted') {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });
        
        return image.dataUrl;
      }
      
      throw new Error('Camera permission not granted');
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  async pickFromGallery() {
    try {
      const permissions = await Camera.requestPermissions();
      
      if (permissions.photos === 'granted') {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos
        });
        
        return image.dataUrl;
      }
      
      throw new Error('Photo library permission not granted');
    } catch (error) {
      console.error('Failed to pick from gallery:', error);
      throw error;
    }
  }
}

// Contacts Service for Find Friends
class NativeContactsService {
  async getContacts() {
    try {
      const permissions = await Contacts.requestPermissions();
      
      if (permissions.contacts === 'granted') {
        const result = await Contacts.getContacts();
        
        return result.contacts.map((contact) => ({
          name: contact.name?.display || 'Unknown',
          email: contact.emails?.[0]?.email || '',
          phone: contact.phoneNumbers?.[0]?.number || ''
        }));
      }
      
      throw new Error('Contacts permission not granted');
    } catch (error) {
      console.error('Failed to get contacts:', error);
      throw error;
    }
  }
}

// Export native services
export const nativeHealthService = new NativeHealthService();
export const nativeLocationService = new NativeLocationService();
export const nativeCameraService = new NativeCameraService();
export const nativeContactsService = new NativeContactsService();

// Initialize health service on app start
nativeHealthService.initialize();