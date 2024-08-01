import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TextInput, Button, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

const BudgetScreen = () => {
  const [expectedTotalCost, setExpectedTotalCost] = useState('');
  const [categoryCosts, setCategoryCosts] = useState({
    food: '',
    transportation: '',
    education: '',
    utilities: '',
    household: '',
    rent: '',
    healthcare: '',
    others: '',
  });
  const [token, setToken] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseData, setExpenseData] = useState({});
  const [budgetData, setBudgetData] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchBudgetData();
      fetchExpenseData();
    }
  }, [selectedDate, token]);

  const fetchBudgetData = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const budgetUrl = `http://192.168.8.146:8080/api/v1/budget/month?year=${year}&month=${month}`;

      const budgetResponse = await axios.get(budgetUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (budgetResponse.data.budget) {
        const budget = budgetResponse.data.budget;
        setBudgetData(budget.categoryCosts);
        setExpectedTotalCost(budget.expectedTotalCost.toString());
      } else {
        setBudgetData({});
        setExpectedTotalCost('');
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      Alert.alert('Error', 'Failed to fetch budget data');
      setBudgetData({});
      setExpectedTotalCost('');
    }
  };

  const fetchExpenseData = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const expenseUrl = `http://192.168.8.146:8080/api/v1/expenses/month?year=${year}&month=${month}`;

      const expenseResponse = await axios.get(expenseUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const expenses = expenseResponse.data.expenses;
      const expenseSummary = expenses.reduce((acc, expense) => {
        const category = expense.category.toLowerCase();
        if (!acc[category]) acc[category] = 0;
        acc[category] += expense.amount;
        return acc;
      }, {});

      setExpenseData(expenseSummary);
    } catch (error) {
      console.error('Error fetching expense data:', error);
      Alert.alert('Error', 'Failed to fetch expense data');
      setExpenseData({});
    }
  };

  const handleExpectedTotalCostChange = (value) => {
    setExpectedTotalCost(value);
  };

  const handleCategoryCostChange = (category, value) => {
    const newCategoryCosts = { ...categoryCosts, [category]: value };
    const totalCategoryCosts = Object.values(newCategoryCosts).reduce((acc, cost) => acc + (parseFloat(cost) || 0), 0);

    if (totalCategoryCosts > parseFloat(expectedTotalCost)) {
      Alert.alert('Error', 'Total category costs exceed the expected total cost');
    } else {
      setCategoryCosts(newCategoryCosts);
    }
  };

  const calculateBudget = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      if (!expectedTotalCost || Object.values(categoryCosts).every(cost => cost === '')) {
        Alert.alert('Error', 'Expected total cost and at least one category cost are required');
        return;
      }

      const parsedCategoryCosts = Object.keys(categoryCosts).reduce((acc, key) => {
        acc[key] = parseFloat(categoryCosts[key]) || 0;
        return acc;
      }, {});

      console.log({
        year,
        month,
        expectedTotalCost: parseFloat(expectedTotalCost),
        categoryCosts: parsedCategoryCosts,
      });

      await axios.post('http://192.168.8.146:8080/api/v1/budget/add', {
        year,
        month,
        expectedTotalCost: parseFloat(expectedTotalCost),
        categoryCosts: parsedCategoryCosts,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Success', 'Budget planned successfully');
      fetchBudgetData();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  const renderBudgetItem = (category, limit) => {
    const spent = expenseData[category.toLowerCase()] || 0;
    const remaining = limit - spent;
    const remainingColor = remaining >= 0 ? 'green' : 'red';

    return (
      <View key={category} style={styles.budgetItemContainer}>
        <Text style={styles.categoryTitle}>{category}</Text>
        <Text style={styles.budgetDetail}>Limit: LKR {limit.toFixed(2)}</Text>
        <Text style={styles.budgetDetail}>Spent: LKR {spent.toFixed(2)}</Text>
        <Text style={[styles.budgetDetail, { color: remainingColor }]}>Remaining: LKR {remaining.toFixed(2)}</Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(spent / limit) * 100}%`, backgroundColor: remainingColor },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('dashboard')}>
            <Icon name="home" size={24} color="#3a506b" />
          </TouchableOpacity>
          <Text style={styles.header}>Budget Planning</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subHeader}>Enter Expected Total Cost</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Expected Total Cost"
            value={expectedTotalCost}
            onChangeText={handleExpectedTotalCostChange}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subHeader}>Enter Category Costs</Text>
          {Object.keys(categoryCosts).map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Cost"
                value={categoryCosts[category]}
                onChangeText={(value) => handleCategoryCostChange(category, value)}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.datePickerButton} onPress={showDatePickerModal}>
          <Text style={styles.datePickerText}>
            {`${selectedDate.toLocaleString('default', { month: 'long' })}, ${selectedDate.getFullYear()}`}
          </Text>
          <Icon name="calendar" size={30} color="#3a506b" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity style={styles.calculateButton} onPress={calculateBudget}>
          <Text style={styles.calculateButtonText}>Calculate Budget</Text>
        </TouchableOpacity>

        <View style={styles.budgetContainer}>
          <Text style={styles.subHeader}>Budgeted Categories: {selectedDate.toLocaleString('default', { month: 'long' })}, {selectedDate.getFullYear()}</Text>
          {Object.keys(budgetData).map((category) => {
            const limit = parseFloat(budgetData[category]) || 0;
            return limit > 0 ? renderBudgetItem(category, limit) : null;
          })}
        </View>

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
    flex: 1,
    backgroundColor: 'transparent', // Make the background transparent
    padding: 25,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#3a506b',
  },
  inputContainer: {
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3a506b',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '30%',
  },
  budgetContainer: {
    marginBottom: 20,
  },
  budgetItemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3a506b',
  },
  budgetDetail: {
    fontSize: 16,
    color: '#3a506b',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 20,
    marginRight: 10,
    color: '#3a506b',
  },
  calculateButton: {
    backgroundColor: '#3a506b',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
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

export default BudgetScreen;
