module.exports = {
  name: 'LiftLink',
  slug: 'liftlink',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './react-native-app/assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './react-native-app/assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#111827'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.liftlinkapp',
    buildNumber: '1'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './react-native-app/assets/adaptive-icon.png',
      backgroundColor: '#111827'
    },
    package: 'com.liftlinkapp',
    versionCode: 1
  },
  web: {
    favicon: './react-native-app/assets/favicon.png'
  },
  extra: {
    eas: {
      projectId: 'liftlink'
    }
  }
};
