import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// It ensures the app works in both Expo Go and native builds
registerRootComponent(App);
