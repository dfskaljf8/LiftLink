// Mock for @react-native-community/geolocation
const Geolocation = {
  getCurrentPosition: (success, error, options) => {
    console.log('Geolocation.getCurrentPosition called');
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 10,
        altitudeAccuracy: 10,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    };
    if (success) success(mockPosition);
  },
  watchPosition: (success, error, options) => {
    console.log('Geolocation.watchPosition called');
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 10,
        altitudeAccuracy: 10,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    };
    if (success) success(mockPosition);
    return 1; // mock watch ID
  },
  clearWatch: (watchId) => {
    console.log('Geolocation.clearWatch called with:', watchId);
  },
};

export default Geolocation;