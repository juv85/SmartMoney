import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/models';

const App2 = () => {

  useEffect(() => {
    initDatabase().then(() => {
      console.log('Database ready!');
    });
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#FF8A80" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App2;