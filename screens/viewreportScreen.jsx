import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Button, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

const ViewreportScreen = () => {
  const router = useRouter();
  const [filter, setFilter] = useState('month');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [token, setToken] = useState('');
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [viewOption, setViewOption] = useState('expenseOverview');
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);

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

        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;

        const expenseUrl = `http://192.168.8.146:8080/api/v1/expenses/${filter}?year=${year}&month=${month}`;
        const incomeUrl = `http://192.168.8.146:8080/api/v1/incomes/${filter}?year=${year}&month=${month}`;

        const [expenseResponse, incomeResponse] = await Promise.all([
          axios.get(expenseUrl, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(incomeUrl, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const expenses = expenseResponse.data.expenses;
        const incomes = incomeResponse.data.incomes;

        setExpenseTotal(expenses.reduce((acc, expense) => acc + expense.amount, 0));
        setIncomeTotal(incomes.reduce((acc, income) => acc + income.amount, 0));
        setExpenseData(expenses);
        setIncomeData(incomes);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to fetch data');
      }
    };

    if (token) {
      fetchData();
    }
  }, [filter, selectedDate, token]);

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === 'day' || value === 'week' || value === 'month') {
      setShowDatePicker(true);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    setFilterModalVisible(false);
  };

  const renderExpenseOverview = () => {
    const expenseCategories = expenseData.reduce((acc, expense) => {
      acc[expense.category] = acc[expense.category] || 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    const chartData = Object.keys(expenseCategories).map((category) => ({
      name: category,
      amount: expenseCategories[category],
      color: getRandomColor(),
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    }));

    return (
      <View>
        <Text style={styles.sectionHeader}>Expense Overview</Text>
        <PieChart
          data={chartData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
        {chartData.map((item, index) => (
          <Text key={index} style={styles.categoryText}>
            {item.name}: LKR {item.amount.toFixed(2)} ({((item.amount / expenseTotal) * 100).toFixed(2)}%)
          </Text>
        ))}
      </View>
    );
  };

  const renderIncomeOverview = () => {
    const incomeCategories = incomeData.reduce((acc, income) => {
      acc[income.category] = acc[income.category] || 0;
      acc[income.category] += income.amount;
      return acc;
    }, {});

    const chartData = Object.keys(incomeCategories).map((category) => ({
      name: category,
      amount: incomeCategories[category],
      color: getRandomColor(),
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    }));

    return (
      <View>
        <Text style={styles.sectionHeader}>Income Overview</Text>
        <PieChart
          data={chartData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
        {chartData.map((item, index) => (
          <Text key={index} style={styles.categoryText}>
            {item.name}: LKR {item.amount.toFixed(2)} ({((item.amount / incomeTotal) * 100).toFixed(2)}%)
          </Text>
        ))}
      </View>
    );
  };

  const renderAnalysisOverview = () => {
    const chartData = [
      {
        name: "Expense",
        amount: expenseTotal,
        color: "red",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Income",
        amount: incomeTotal,
        color: "green",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];

    return (
      <View>
        <Text style={styles.sectionHeader}>Analysis Overview</Text>
        <PieChart
          data={chartData}
          width={350}
          height={220}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    );
  };

  const changeMonth = (increment) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate.setMonth(prevDate.getMonth() + increment));
      return newDate;
    });
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ada.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Icon name="menu" size={30} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Budget Tracker Pro</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
              <Icon name="filter" size={30} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.dateNavigation}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Icon name="chevron-back" size={30} color="#3a506b" />
            </TouchableOpacity>
            <Text style={styles.dateText}>
              {filter === 'day' && selectedDate.toLocaleDateString()}
              {filter === 'week' && `${selectedDate.toLocaleDateString()} - ${new Date(selectedDate.setDate(selectedDate.getDate() + 6)).toLocaleDateString()}`}
              {filter === 'month' && `${selectedDate.toLocaleString('default', { month: 'long' })}, ${selectedDate.getFullYear()}`}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
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
          <Modal
            animationType="slide"
            transparent={true}
            visible={filterModalVisible}
            onRequestClose={() => setFilterModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Filter</Text>
                <TouchableOpacity onPress={() => { setViewOption('incomeOverview'); setFilterModalVisible(false); }}>
                  <Text style={styles.modalOption}>Income Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setViewOption('analysisOverview'); setFilterModalVisible(false); }}>
                  <Text style={styles.modalOption}>Analyze Overview</Text>
                </TouchableOpacity>
                <Button title="Close" onPress={() => setFilterModalVisible(false)} />
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={viewModalVisible}
            onRequestClose={() => setViewModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Overview</Text>
                <TouchableOpacity onPress={() => { setViewOption('expenseOverview'); setViewModalVisible(false); }}>
                  <Text style={styles.modalOption}>Expense Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setViewOption('incomeOverview'); setViewModalVisible(false); }}>
                  <Text style={styles.modalOption}>Income Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setViewOption('analysisOverview'); setViewModalVisible(false); }}>
                  <Text style={styles.modalOption}>Analysis Overview</Text>
                </TouchableOpacity>
                <Button title="Close" onPress={() => setViewModalVisible(false)} />
              </View>
            </View>
          </Modal>
          {viewOption === 'expenseOverview' && renderExpenseOverview()}
          {viewOption === 'incomeOverview' && renderIncomeOverview()}
          {viewOption === 'analysisOverview' && renderAnalysisOverview()}
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
          <TouchableOpacity style={styles.iconContainer} onPress={() => router.push('/profile')}>
            <Icon name="person" size={20} color="#3a506b" />
            <Text style={styles.iconText}>Profile</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f0f4f8', // Light blue-gray background
  },
  summaryItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White text color for summary titles
    marginBottom: 5,
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#3a506b',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    fontSize: 16,
    paddingVertical: 10,
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
});

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default ViewreportScreen;
