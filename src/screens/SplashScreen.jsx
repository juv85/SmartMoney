import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../utils/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.dollarSign}>$</Text>
      </View>
      <Text style={styles.appName}>SmartMoney</Text>
      <Text style={styles.version}>V 1.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dollarSign: {
    fontSize: 50,
    color: colors.white,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 32,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    fontSize: 16,
    color: colors.white,
    opacity: 0.7,
  },
});

export default SplashScreen;