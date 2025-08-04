import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App2 = () => {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#FF8A80" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App2;