import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image, TouchableOpacity, TextInput, ScrollView, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        router.replace('/login');
        return;
      }

      try {
        const { data } = await axios.get('http://192.168.8.146:8080/api/v1/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data.user);
        setName(data.user.name);
        setEmail(data.user.email);
        setProfileImage(data.user.profileImage); // assuming the user object contains a profileImage field
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('@auth');
    Alert.alert('Logout', 'Logout successfully', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (profileImage) {
          const uriParts = profileImage.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('profileImage', {
            uri: profileImage,
            name: `profile.${fileType}`,
            type: `image/${fileType}`,
          });
        }

        await axios.put('http://192.168.8.146:8080/api/v1/auth/user', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        setUser((prevUser) => ({ ...prevUser, name, email, profileImage }));
        Alert.alert('Success', 'Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile');
      }
    }
    setIsEditing(!isEditing);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity onPress={pickImage}>
          <Image 
            source={profileImage ? { uri: profileImage } : require('../assets/images/aas.png')} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
        {isEditing ? (
          <>
            <TextInput 
              style={styles.input} 
              value={name} 
              onChangeText={setName} 
            />
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </>
        )}
        <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
          <Text style={styles.buttonText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { /* Handle change password */ }}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
        <Button title="Logout" onPress={handleLogout} color={styles.logoutButton.color} />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensure the background image covers the entire screen
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent', // Make the background transparent
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3a506b', // dark blue
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a506b', // dark blue
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: '#3a506b', // dark blue
    marginBottom: 10,
  },
  input: {
    width: '80%',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3a506b', // dark blue
    borderBottomWidth: 1,
    borderBottomColor: '#3a506b', // dark blue
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#5bc0be', // teal
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  logoutButton: {
    color: '#5bc0be', // teal
  },
});

export default ProfileScreen;
