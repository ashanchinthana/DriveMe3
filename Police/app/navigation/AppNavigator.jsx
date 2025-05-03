import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import LandingPage from '../screens/LandingPage';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import SplashScreen from '../screens/SplashScreen';
import OfficerDashboard from '../screens/OfficerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import AddFineScreen from '../screens/AddFineScreen';

const Stack = createStackNavigator();

// Fallback component if navigation fails
const FallbackScreen = () => (
  <View style={styles.fallbackContainer}>
    <ActivityIndicator size="large" color="#1A237E" />
    <Text style={styles.fallbackText}>Loading...</Text>
  </View>
);

export default function AppNavigator() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Make sure navigation is ready
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <FallbackScreen />;
  }

  return (
    <NavigationContainer
      fallback={<FallbackScreen />}
      onReady={() => setIsReady(true)}
    >
      <Stack.Navigator 
        initialRouteName="Splash" 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F5F7FA' },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="OfficerDashboard" component={OfficerDashboard} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AddFine" component={AddFineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  fallbackText: {
    marginTop: 20,
    fontSize: 16,
    color: '#1A237E',
  },
}); 