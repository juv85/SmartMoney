import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const LoadingScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View>
      <Text>Display loading animation</Text>
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({})