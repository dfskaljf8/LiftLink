const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo
 * https://docs.expo.dev/guides/customizing-metro
 */
const config = getDefaultConfig(__dirname);

// Add any custom configurations here
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

module.exports = config;
