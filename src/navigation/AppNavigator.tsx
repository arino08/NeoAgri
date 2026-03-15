import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import SplashScreen from '../screens/SplashScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import CameraHomeScreen from '../screens/CameraHomeScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import DroneServiceScreen from '../screens/DroneServiceScreen';
import DiseaseResultScreen from '../screens/DiseaseResultScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  Language: undefined;
  MainHub: undefined;
  DiseaseResult: { photoUri?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createMaterialTopTabNavigator();

function MainSwipeHub() {
  return (
    <Tab.Navigator
      initialRouteName="CameraHome"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarStyle: { display: 'none' },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Tab.Screen name="CameraHome" component={CameraHomeScreen} />
      <Tab.Screen name="DroneService" component={DroneServiceScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Language" component={LanguageSelectionScreen} />
        <Stack.Screen name="MainHub" component={MainSwipeHub} />
        <Stack.Screen name="DiseaseResult" component={DiseaseResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
