import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const InputBox = ({ inputTitle, value, setValue, keyboardType, secureTextEntry, autoComplete, multiline, numberOfLines, placeholder }) => {
  return (
    <View style={styles.inputBoxContainer}>
      <Text style={styles.inputLabel}>{inputTitle}</Text>
      <TextInput
        style={[styles.input, multiline && { height: numberOfLines * 40 }]}
        value={value}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoComplete={autoComplete}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor="#999999" // Gray placeholder color for better visibility
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputBoxContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#000000', // Black text color
    fontSize: 16, // Increased font size for better visibility
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF', // Input field background color
    borderRadius: 10,
    padding: 10,
    color: '#000000', // Input text color
    borderColor: '#000000', // Black border color for better visibility
    borderWidth: 1,
  },
});

export default InputBox;
