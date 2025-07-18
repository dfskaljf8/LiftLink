// Mock for @react-native-google-signin/google-signin
const GoogleSignin = {
  configure: (config) => {
    console.log('GoogleSignin.configure called with:', config);
  },
  hasPlayServices: () => Promise.resolve(true),
  signIn: () => Promise.resolve({
    user: {
      id: 'mock_user_id',
      name: 'Mock User',
      email: 'mock@example.com',
      photo: null,
    },
  }),
  signOut: () => Promise.resolve(),
  isSignedIn: () => Promise.resolve(false),
  getCurrentUser: () => Promise.resolve(null),
  getTokens: () => Promise.resolve({
    accessToken: 'mock_access_token',
    idToken: 'mock_id_token',
  }),
};

const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
  IN_PROGRESS: 'IN_PROGRESS',
  PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export { GoogleSignin, statusCodes };
export default GoogleSignin;