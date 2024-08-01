import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SideMenu = (props) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    Alert.alert('Logout', 'Logout successfully', [
      { text: 'OK', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <View style={styles.menuItem}>
          <Icon name="home" size={24} color="#3a506b" />
          <Text style={styles.menuText}>Dashboard</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <View style={styles.menuItem}>
          <Icon name="person" size={24} color="#3a506b" />
          <Text style={styles.menuText}>Profile</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
        <View style={styles.menuItem}>
          <Icon name="calculator" size={24} color="#3a506b" />
          <Text style={styles.menuText}>Budget</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Income')}>
        <View style={styles.menuItem}>
          <Icon name="add-circle" size={24} color="#3a506b" />
          <Text style={styles.menuText}>Income</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ViewReport')}>
        <View style={styles.menuItem}>
          <Icon name="analytics" size={24} color="#3a506b" />
          <Text style={styles.menuText}>View Report</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <View style={styles.menuItem}>
          <Icon name="log-out" size={24} color="#3a506b" />
          <Text style={styles.menuText}>Logout</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f0f4f8',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 18,
    color: '#3a506b',
    marginLeft: 10,
  },
});

export default SideMenu;
