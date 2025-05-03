import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PoliceBadge from '../../components/PoliceBadge';
import { authService } from '../services/api';
import { isConnected } from '../utils/networkUtils';

export default function SplashScreen() {
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      try {
        // Wait 1.5 seconds to show splash screen
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check for internet connectivity
        const connected = await isConnected();
        // Even if there's no connection, we'll proceed to the login page
        // Just show a warning if needed
        if (!connected) {
          console.warn('No internet connection detected');
        }
        
        // Proceed to login screen regardless of connectivity
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        console.error('Auth check error:', error);
        // If error, default to login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    if (checking) {
      checkAuth();
    }
  }, [navigation, checking]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <PoliceBadge width={150} height={150} />
        
        <Text style={styles.title}>DriveMe Police Portal</Text>
        
        <ActivityIndicator 
          size="large" 
          color="#1A237E" 
          style={styles.loader}
        />
      </View>
      
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginTop: 20,
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  retryText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#666',
  },
}); 