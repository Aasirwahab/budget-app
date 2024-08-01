import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>
        Budget Tracker Pro 
        </Text>
        <View style={styles.imagePlaceholder}>
          <Image 
            source={require('../assets/images/ps1.png')} 
            style={styles.imageBox}
            resizeMode="cover"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={() => router.push('/Signup')}
            style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensure the background image covers the entire screen
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Make the background transparent
  },
  heading: {
    color: '#3a506b', // Dark blue for text
    fontWeight: 'bold',
    fontSize: 32,
    textAlign: 'center',
    marginTop: 32,
  },
  imagePlaceholder: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 32,
  },
  imageBox: {
    width: 256,
    height: 256,
    borderRadius: 10,
  },
  buttonContainer: {
    marginHorizontal: 28,
    marginTop: 16,
    marginBottom: 16,
  },
  signupButton: {
    paddingVertical: 12,
    backgroundColor: '#5bc0be', // Teal color for button
    borderRadius: 10,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff', // White text
  },
});

export default HomeScreen;
