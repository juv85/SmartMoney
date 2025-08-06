import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { colors } from '../utils/colors';
import { imgWelcome } from '../utils/images';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Loading');
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image style={styles.image} source={imgWelcome} />
      </View>

      <Text style={styles.title}>
        Gardez le contrôle sur votre argent mobile en un clic
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={handleGetStarted}>
        <Text style={styles.startButtonText}>COMMENCER</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        En continuant, vous reconnaissez avoir lu et acceptez nos{' '}
        <Text style={styles.linkText}>Conditions générales d'utilisation</Text> et notre{' '}
        <Text style={styles.linkText}>Politique de confidentialité</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.88,
    height: width * 0.75,
    // aspectRatio: 1
  },
  illustrationContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 32,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginBottom: 15,
    width: "85%",
  },
  startButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: "center",
  },
  termsText: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;