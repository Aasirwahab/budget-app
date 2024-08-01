import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import InputBox from '../components/InputBox';
import SubmitButton from '../components/SubmitButton';
import { useRouter } from 'expo-router';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!name || !email || !password) {
        Alert.alert('Please Fill All Fields');
        setLoading(false);
        return;
      }
      
      const { data } = await axios.post(
        "http://192.168.8.146:8080/api/v1/auth/register",
        { name, email, password }
      );
      
      Alert.alert('Success', data.message || 'Signup successful', [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);

      setLoading(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || "An error occurred");
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Signup</Text>
        <View style={styles.inputContainer}>
          <InputBox inputTitle={"Name"} value={name} setValue={setName} />
          <InputBox
            inputTitle={"Email"}
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            setValue={setEmail}
          />
          <InputBox
            inputTitle={"Password"}
            secureTextEntry={true}
            autoComplete="password"
            value={password}
            setValue={setPassword}
          />
        </View>
        <SubmitButton
          btnTitle="Signup"
          loading={loading}
          handleSubmit={handleSubmit}
          buttonStyle={styles.submitButton}
          textStyle={styles.submitButtonText}
        />
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: "center",
    backgroundColor: 'transparent', // Make the background transparent
    padding: 20,
  },
  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#3a506b", // Dark blue text color
    marginBottom: 20,
  },
  inputContainer: {
    marginHorizontal: 20,
  },
  submitButton: {
    backgroundColor: '#5bc0be', // Teal button color
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff', // White text color on the button
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: "#3a506b", // Dark blue text color
  },
  loginLink: {
    color: '#5bc0be', // Teal text color
    marginLeft: 8,
  },
});

export default Signup;
