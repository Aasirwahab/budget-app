import React from 'react';
import AppNavigation from '../components/navigation/appNavigation';


export default function App() {
  return (
    <ExpensesProvider>
      <AppNavigation />
    </ExpensesProvider>
  );
}