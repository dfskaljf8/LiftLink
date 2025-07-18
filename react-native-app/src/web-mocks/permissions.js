// Mock for react-native-permissions
const PERMISSIONS = {
  ANDROID: {
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  },
  IOS: {
    CAMERA: 'ios.permission.CAMERA',
    PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
    LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
  },
};

const RESULTS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

const check = (permission) => {
  console.log('Permission check:', permission);
  return Promise.resolve(RESULTS.GRANTED);
};

const request = (permission) => {
  console.log('Permission request:', permission);
  return Promise.resolve(RESULTS.GRANTED);
};

const requestMultiple = (permissions) => {
  console.log('Multiple permissions request:', permissions);
  const result = {};
  permissions.forEach(permission => {
    result[permission] = RESULTS.GRANTED;
  });
  return Promise.resolve(result);
};

export { PERMISSIONS, RESULTS, check, request, requestMultiple };