import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { imgBubbles } from '../utils/images'

const LoadingScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View>
      <Image source={imgBubbles} style={styles.loader} />
      <Text>Display loading animation</Text>
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
  loader: {
    width: 300,
    height: 300
  }
})