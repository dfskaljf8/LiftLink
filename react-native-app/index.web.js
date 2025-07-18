import { AppRegistry } from 'react-native';
import App from './App';

// Register the app for React Native Web
AppRegistry.registerComponent('LiftLinkMobile', () => App);

// Run the app in web environment
AppRegistry.runApplication('LiftLinkMobile', {
    initialProps: {},
    rootTag: document.getElementById('root'),
});