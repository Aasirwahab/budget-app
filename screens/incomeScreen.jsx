import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Button, Modal, FlatList, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const IncomeScreen = () => {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [category, setCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();

  const incomeCategories = ['Salary', 'Sales', 'Rental', 'Gifts', 'Grants'];

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  const showDatepicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const saveRecord = async () => {
    if (!amount || !category || !notes) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    const record = {
      type: 'Income',
      category,
      amount: parseFloat(amount),
      notes,
      date,
    };

    try {
      if (!token) {
        Alert.alert('Error', 'No auth token found. Please log in again.');
        return;
      }

      console.log('Record to be saved:', record);
      console.log('Auth Token:', token);

      const response = await axios.post('http://192.168.8.146:8080/api/v1/incomes/add', record, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log('Record saved:', response.data);
      Alert.alert('Success', 'Record saved successfully');
      setAmount('');
      setCategory('');
      setNotes('');
      setDate(new Date());
    } catch (error) {
      console.error('Error saving record:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to save record');
    }
  };

  const renderForm = () => {
    return (
      <View style={styles.formContainer}>
        <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={styles.categoryButton}>
          <Text style={styles.categoryButtonText}>{category || 'Select Category'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Add notes"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <TouchableOpacity onPress={saveRecord} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
        <Modal
          visible={categoryModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={incomeCategories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setCategory(item);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text style={styles.categoryText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button title="Close" onPress={() => setCategoryModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.pageTitle}>Income</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expense')}>
              <Icon name="swap-horizontal" size={30} color="#3a506b" />
            </TouchableOpacity>
          </View>
          {renderForm()}
        </ScrollView>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('dashboard')}>
            <Icon name="home" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('income')}>
            <Icon name="add-circle" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Add Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Viewreport')}>
            <Icon name="analytics" size={20} color="#3a506b" />
            <Text style={styles.iconText}>View Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Budget')}>
            <Icon name="calculator" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Budget</Text>
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
    backgroundColor: 'transparent', // Make the background transparent
    padding: 20,
  },
  scrollViewContainer: {
    paddingBottom: 80,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3a506b',
  },
  expenseButton: {
    backgroundColor: '#5bc0be',
    padding: 10,
    borderRadius: 10,
  },
  expenseButtonText: {
    color: '#ffffff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  dateButton: {
    backgroundColor: '#5bc0be',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  dateButtonText: {
    color: '#ffffff',
  },
  categoryButton: {
    backgroundColor: '#5bc0be',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  categoryButtonText: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#3a506b',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#5bc0be',
  },
  categoryText: {
    fontSize: 18,
    color: '#3a506b',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconText: {
    color: '#3a506b',
    marginTop: 5,
  },
});

export default IncomeScreen;
