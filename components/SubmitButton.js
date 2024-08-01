import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

const SubmitButton = ({ handleSubmit, btnTitle, loading }) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={handleSubmit}
    >
      <Text style={styles.buttonText}>
        {loading ? "Please wait..." : btnTitle}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#5bc0be', // Teal button color
    height: 48, // equivalent to h-12
    marginHorizontal: 24, // equivalent to mx-6
    borderRadius: 25, // equivalent to rounded-full
    justifyContent: 'center',
    marginBottom: 20, // equivalent to mb-5
  },
  buttonText: {
    color: '#ffffff', // White text color
    textAlign: 'center',
    fontSize: 18, // equivalent to text-xl
    fontWeight: 'normal', // equivalent to font-normal
  },
});

export default SubmitButton;
