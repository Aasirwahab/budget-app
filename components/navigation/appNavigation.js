import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import LoginScreen from '../../screens/LoginScreen';
import SignUpScreen from '../../screens/SignUpScreen';
import DashboardScreen from '../../screens/DashboardScreen';
import viewreportScreen from '../../screens/viewreportScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import incomeScreen from '../../screens/incomeScreen';
import BudgetScreen from '../../screens/BudgetScreen';
import SideMenu from '../../screens/SideMenu';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
        <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} component={SignUpScreen} />
        <Stack.Screen name="Dashboard" options={{ headerShown: false }} component={DashboardScreen} />    
        <Stack.Screen name="ViewReport" options={{ headerShown: false }} component={viewreportScreen} />
        <Stack.Screen name="Profile" options={{ headerShown: false }} component={ProfileScreen} />
        <Stack.Screen name="Budget" options={{ headerShown: false }} component={BudgetScreen} />
        <Stack.Screen name="income" options={{ headerShown: false }} component={incomeScreen} />
        <Stack.Screen name="Expense" options={{ headerShown: false }} component={incomeScreen} />
        <Stack.Screen name="sidemenu" options={{ headerShown: false }} component={SideMenu} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
