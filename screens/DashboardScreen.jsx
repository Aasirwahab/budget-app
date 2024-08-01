import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, Button, ImageBackground } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import InputBox from '../components/InputBox';  // Ensure you have this component
import { useRouter } from 'expo-router';

const DashboardScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [filter, setFilter] = useState('month');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [token, setToken] = useState('');
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [currentIncome, setCurrentIncome] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          Alert.alert('Error', 'No auth token found. Please log in again.');
          return;
        }

        let expenseUrl = `http://192.168.8.146:8080/api/v1/expenses/${filter}`;
        let incomeUrl = `http://192.168.8.146:8080/api/v1/incomes/${filter}`;

        if (filter === 'day' || filter === 'week') {
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth() + 1;
          const day = selectedDate.getDate();
          expenseUrl += `?year=${year}&month=${month}&day=${day}`;
          incomeUrl += `?year=${year}&month=${month}&day=${day}`;
        } else if (filter === 'month') {
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth() + 1;
          expenseUrl += `?year=${year}&month=${month}`;
          incomeUrl += `?year=${year}&month=${month}`;
        }

        const expenseResponse = await axios.get(expenseUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const expenses = expenseResponse.data.expenses;
        setExpenses(expenses);
        setExpenseTotal(expenses.reduce((acc, expense) => acc + expense.amount, 0));

        const incomeResponse = await axios.get(incomeUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const incomes = incomeResponse.data.incomes;
        setIncomes(incomes);
        setIncomeTotal(incomes.reduce((acc, income) => acc + income.amount, 0));
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data');
      }
    };

    if (token) {
      fetchData();
    }
  }, [filter, selectedDate, token]);

  const renderExpenses = () => {
    return expenses.map((expense, index) => (
      <View key={index} style={styles.card}>
        <View style={styles.cardLeft}>
          <Icon name="cart-outline" size={24} color="#3a506b" />
        </View>
        <View style={styles.cardRight}>
          <View style={styles.cardRightTop}>
            <Text style={styles.cardCategory}>{expense.category}</Text>
            <Text style={styles.cardAmount}>LKR {expense.amount}</Text>
          </View>
          <Text style={styles.cardDate}>{new Date(expense.date).toLocaleDateString()}</Text>
          <Text style={styles.cardNotes}>{expense.notes}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleUpdateExpense(expense)}>
              <Text style={styles.updateButton}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteExpense(expense._id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const renderIncomes = () => {
    return incomes.map((income, index) => (
      <View key={index} style={styles.card}>
        <View style={styles.cardLeft}>
          <Icon name="wallet-outline" size={24} color="#3a506b" />
        </View>
        <View style={styles.cardRight}>
          <View style={styles.cardRightTop}>
            <Text style={styles.cardCategory}>{income.category}</Text>
            <Text style={styles.cardAmount}>LKR {income.amount}</Text>
          </View>
          <Text style={styles.cardDate}>{new Date(income.date).toLocaleDateString()}</Text>
          <Text style={styles.cardNotes}>{income.notes}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleUpdateIncome(income)}>
              <Text style={styles.updateButton}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteIncome(income._id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ));
  };

  const handleUpdateExpense = (expense) => {
    setCurrentExpense(expense);
    setExpenseModalVisible(true);
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`http://192.168.8.146:8080/api/v1/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenses(expenses.filter(expense => expense._id !== id));
      Alert.alert('Success', 'Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense');
    }
  };

  const handleSubmitUpdateExpense = async () => {
    try {
      const updatedExpense = {
        amount: parseFloat(currentExpense.amount),
        category: currentExpense.category,
        date: currentExpense.date,
        notes: currentExpense.notes,
      };
      const response = await axios.put(
        `http://192.168.8.146:8080/api/v1/expenses/${currentExpense._id}`,
        updatedExpense,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setExpenses(expenses.map(expense => (expense._id === currentExpense._id ? response.data : expense)));
      setExpenseModalVisible(false);
      Alert.alert('Success', 'Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const handleUpdateIncome = (income) => {
    setCurrentIncome(income);
    setIncomeModalVisible(true);
  };

  const handleDeleteIncome = async (id) => {
    try {
      await axios.delete(`http://192.168.8.146:8080/api/v1/incomes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIncomes(incomes.filter(income => income._id !== id));
      Alert.alert('Success', 'Income deleted successfully');
    } catch (error) {
      console.error('Error deleting income:', error);
      Alert.alert('Error', 'Failed to delete income');
    }
  };

  const handleSubmitUpdateIncome = async () => {
    try {
      const updatedIncome = {
        amount: parseFloat(currentIncome.amount),
        category: currentIncome.category,
        date: currentIncome.date,
        notes: currentIncome.notes,
      };
      const response = await axios.put(
        `http://192.168.8.146:8080/api/v1/incomes/${currentIncome._id}`,
        updatedIncome,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIncomes(incomes.map(income => (income._id === currentIncome._id ? response.data : income)));
      setIncomeModalVisible(false);
      Alert.alert('Success', 'Income updated successfully');
    } catch (error) {
      console.error('Error updating income:', error);
      Alert.alert('Error', 'Failed to update income');
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    setFilterModalVisible(false);
  };

  const changeDate = (increment) => {
    if (filter === 'day') {
      setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + increment)));
    } else if (filter === 'week') {
      setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7 * increment)));
    } else if (filter === 'month') {
      setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + increment)));
    }
  };

  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // get the first day of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // get the last day of the week (Saturday)
    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Icon name="menu" size={30} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}> Budget Tracker Pro </Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
            <Icon name="filter" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => changeDate(-1)}>
            <Icon name="chevron-back" size={30} color="#3a506b" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {filter === 'day' && selectedDate.toLocaleDateString()}
            {filter === 'week' && getWeekRange(selectedDate)}
            {filter === 'month' && `${selectedDate.toLocaleString('default', { month: 'long' })}, ${selectedDate.getFullYear()}`}
          </Text>
          <TouchableOpacity onPress={() => changeDate(1)}>
            <Icon name="chevron-forward" size={30} color="#3a506b" />
          </TouchableOpacity>
        </View>
        <View style={styles.summary}>
          <View style={[styles.summaryItem, styles.incomeSummary]}>
            <Text style={styles.summaryTitle}>Income</Text>
            <Text style={styles.summaryAmount}>Rs {incomeTotal}</Text>
          </View>
          <View style={[styles.summaryItem, styles.expenseSummary]}>
            <Text style={styles.summaryTitle}>Expense</Text>
            <Text style={styles.summaryAmount}>Rs {expenseTotal}</Text>
          </View>
          <View style={[styles.summaryItem, styles.balanceSummary]}>
            <Text style={styles.summaryTitle}>Balance</Text>
            <Text style={styles.summaryAmount}>Rs {incomeTotal - expenseTotal}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          {renderExpenses()}
          <Text style={styles.sectionTitle}>Income</Text>
          {renderIncomes()}
        </ScrollView>
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.push('/dashboard')}>
            <Icon name="home" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.push('/income')}>
            <Icon name="add-circle" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.push('/Viewreport')}>
            <Icon name="analytics" size={20} color="#3a506b" />
            <Text style={styles.iconText}>View Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.push('/Budget')}>
            <Icon name="calculator" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Budget</Text>
          </TouchableOpacity>
         
        </View>
        <Modal visible={filterModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Display Options</Text>
              <RNPickerSelect
                onValueChange={(value) => handleFilterChange(value)}
                items={[
                  { label: 'Daily', value: 'day' },
                  { label: 'Weekly', value: 'week' },
                  { label: 'Monthly', value: 'month' },
                ]}
                value={filter}
                style={pickerSelectStyles}
                placeholder={{ label: 'Select a filter...', value: null }}
              />
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              <Button title="Apply" onPress={() => setFilterModalVisible(false)} />
            </View>
          </View>
        </Modal>
        <Modal visible={expenseModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Expense</Text>
              <InputBox
                inputTitle={"Amount"}
                value={currentExpense?.amount?.toString() || ''}
                setValue={(value) => setCurrentExpense({ ...currentExpense, amount: parseFloat(value) || '' })}
                keyboardType="numeric"
                placeholder="Enter amount"
              />
              <InputBox
                inputTitle={"Category"}
                value={currentExpense?.category || ''}
                setValue={(value) => setCurrentExpense({ ...currentExpense, category: value })}
                placeholder="Enter category"
              />
              <InputBox
                inputTitle={"Date"}
                value={currentExpense?.date || ''}
                setValue={(value) => setCurrentExpense({ ...currentExpense, date: value })}
                placeholder="Enter date"
              />
              <InputBox
                inputTitle={"Notes"}
                value={currentExpense?.notes || ''}
                setValue={(value) => setCurrentExpense({ ...currentExpense, notes: value })}
                placeholder="Enter notes"
              />
              <Button title="Update" onPress={handleSubmitUpdateExpense} />
              <Button title="Cancel" onPress={() => setExpenseModalVisible(false)} />
            </View>
          </View>
        </Modal>
        <Modal visible={incomeModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update Income</Text>
              <InputBox
                inputTitle={"Amount"}
                value={currentIncome?.amount?.toString() || ''}
                setValue={(value) => setCurrentIncome({ ...currentIncome, amount: parseFloat(value) || '' })}
                keyboardType="numeric"
                placeholder="Enter amount"
              />
              <InputBox
                inputTitle={"Category"}
                value={currentIncome?.category || ''}
                setValue={(value) => setCurrentIncome({ ...currentIncome, category: value })}
                placeholder="Enter category"
              />
              <InputBox
                inputTitle={"Date"}
                value={currentIncome?.date || ''}
                setValue={(value) => setCurrentIncome({ ...currentIncome, date: value })}
                placeholder="Enter date"
              />
              <InputBox
                inputTitle={"Notes"}
                value={currentIncome?.notes || ''}
                setValue={(value) => setCurrentIncome({ ...currentIncome, notes: value })}
                placeholder="Enter notes"
              />
              <Button title="Update" onPress={handleSubmitUpdateIncome} />
              <Button title="Cancel" onPress={() => setIncomeModalVisible(false)} />
            </View>
          </View>
        </Modal>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3a506b', // Dark blue background
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // White text color
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the date text
    padding: 10,
    backgroundColor: '#f0f4f8', // Light blue-gray background
  },
  dateText: {
    fontSize: 18,
    color: '#3a506b', // Dark blue text color
    marginHorizontal: 10,
  },
  filterButton: {
    marginTop: 10,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  summaryItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White text color for summary titles
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff', // White text color for summary amounts
  },
  incomeSummary: {
    backgroundColor: '#76ab78', // Green background for income
  },
  expenseSummary: {
    backgroundColor: '#c95b5b', // Red background for expense
  },
  balanceSummary: {
    backgroundColor: '#8eacbd', // Gray background for balance
  },
  scrollViewContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3a506b', // Dark blue text color
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff', // White card background
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  cardRight: {
    flex: 1,
    paddingLeft: 10,
  },
  cardRightTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a506b', // Dark blue text color
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a506b', // Dark blue text color
  },
  cardDate: {
    fontSize: 14,
    color: '#555',
  },
  cardNotes: {
    fontSize: 14,
    color: '#555',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  updateButton: {
    color: '#3a506b', // Dark blue color for update button
  },
  deleteButton: {
    color: '#ff4d4d', // Red color for delete button
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#ffffff', // White background for navigation
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    marginTop: 5,
    color: '#3a506b', // Dark blue color for icon text
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff', // White background for modal
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3a506b', // Dark blue color for modal title
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    backgroundColor: '#5bc0be', // Teal color for iOS picker
    borderRadius: 10,
    padding: 10,
    color: '#ffffff', // White text color
    borderWidth: 1,
    borderColor: '#3a506b', // Dark blue border color
  },
  inputAndroid: {
    backgroundColor: '#5bc0be', // Teal color for Android picker
    borderRadius: 10,
    padding: 10,
    color: '#ffffff', // White text color
    borderWidth: 1,
    borderColor: '#3a506b', // Dark blue border color
  },
  placeholder: {
    color: '#999999',
  },
});

export default DashboardScreen;
