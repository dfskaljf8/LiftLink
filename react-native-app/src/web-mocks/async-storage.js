// Mock for @react-native-async-storage/async-storage
const AsyncStorage = {
  getItem: (key) => {
    console.log('AsyncStorage.getItem:', key);
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: (key, value) => {
    console.log('AsyncStorage.setItem:', key, value);
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    console.log('AsyncStorage.removeItem:', key);
    localStorage.removeItem(key);
    return Promise.resolve();
  },
  clear: () => {
    console.log('AsyncStorage.clear');
    localStorage.clear();
    return Promise.resolve();
  },
  getAllKeys: () => {
    console.log('AsyncStorage.getAllKeys');
    return Promise.resolve(Object.keys(localStorage));
  },
};

export default AsyncStorage;