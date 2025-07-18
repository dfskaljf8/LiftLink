const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Configure aliases for React Native Web
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'react-native$': 'react-native-web',
        'react-native-vector-icons': 'react-native-vector-icons/dist',
        '@react-native-google-signin/google-signin': path.resolve(__dirname, 'src/web-mocks/google-signin'),
        'react-native-document-picker': path.resolve(__dirname, 'src/web-mocks/document-picker'),
        'react-native-permissions': path.resolve(__dirname, 'src/web-mocks/permissions'),
        'react-native-image-picker': path.resolve(__dirname, 'src/web-mocks/image-picker'),
        '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/web-mocks/async-storage'),
        '@react-native-community/netinfo': path.resolve(__dirname, 'src/web-mocks/netinfo'),
        '@react-native-community/geolocation': path.resolve(__dirname, 'src/web-mocks/geolocation'),
        '@stripe/stripe-react-native': path.resolve(__dirname, 'src/web-mocks/stripe'),
        'react-native-maps': 'react-native-web',
        'react-native-gesture-handler': 'react-native-web',
        'react-native-reanimated': 'react-native-web',
        'react-native-screens': 'react-native-web',
        'react-native-safe-area-context': 'react-native-web',
      };

      // Add extensions for React Native Web
      webpackConfig.resolve.extensions = [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        ...webpackConfig.resolve.extensions,
      ];

      // Add rule for TTF fonts
      webpackConfig.module.rules.push({
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      });

      // Add DefinePlugin for React Native compatibility
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
        })
      );

      return webpackConfig;
    },
  },
  babel: {
    plugins: [
      'babel-plugin-react-native-web',
    ],
  },
};