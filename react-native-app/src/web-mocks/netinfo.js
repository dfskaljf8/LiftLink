// Mock for @react-native-community/netinfo
const NetInfo = {
  fetch: () => Promise.resolve({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
    details: {
      isConnectionExpensive: false,
      ssid: 'MockWiFi',
      bssid: 'mock:bssid',
      strength: 100,
      ipAddress: '192.168.1.1',
      subnet: '255.255.255.0',
    },
  }),
  addEventListener: (listener) => {
    console.log('NetInfo.addEventListener called');
    return () => console.log('NetInfo listener cleanup');
  },
  useNetInfo: () => ({
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  }),
};

export default NetInfo;