import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoadingScreen from '../screens/LoadingScreen';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        // options={{
        //   headerShown: true,
        //   headerStyle: {
        //     backgroundColor: '##FF9E8C',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitle: 'Téléphone',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //     fontSize: 18,
        //   },
        // }}
      />
      <Stack.Screen 
        name="TransactionDetail" 
        component={TransactionDetailScreen}
        // options={{
        //   headerShown: true,
        //   headerStyle: {
        //     backgroundColor: '##FF9E8C',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitle: 'Téléphone',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //     fontSize: 18,
        //   },
        // }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;