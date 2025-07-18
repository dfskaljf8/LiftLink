const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      'react-native-maps': 'react-native-web-maps',
      '@react-native-google-signin/google-signin': path.resolve(__dirname, 'src/web-mocks/google-signin'),
      'react-native-document-picker': path.resolve(__dirname, 'src/web-mocks/document-picker'),
      'react-native-permissions': path.resolve(__dirname, 'src/web-mocks/permissions'),
      'react-native-image-picker': path.resolve(__dirname, 'src/web-mocks/image-picker'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/web-mocks/async-storage'),
      '@react-native-community/netinfo': path.resolve(__dirname, 'src/web-mocks/netinfo'),
      '@react-native-community/geolocation': path.resolve(__dirname, 'src/web-mocks/geolocation'),
      '@stripe/stripe-react-native': path.resolve(__dirname, 'src/web-mocks/stripe'),
    },
    extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV !== 'production',
    }),
  ],
};