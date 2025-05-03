import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { isConnected } from '../utils/networkUtils';
import { fineService } from '../services/api';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [credentials, setCredentials] = useState({
    id: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [networkAvailable, setNetworkAvailable] = useState(true);

  // Check network on component mount
  useEffect(() => {
    const checkNetwork = async () => {
      const connected = await isConnected();
      setNetworkAvailable(connected);
    };
    
    checkNetwork();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!credentials.id) newErrors.id = 'ID is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      console.log('Attempting login with ID:', credentials.id);
      
      // Make API call to login
      const response = await authService.login({
        id: credentials.id,
        password: credentials.password
      });
      
      console.log('Login response received:', response);
      
      if (!response.token) {
        console.error('Login successful but no token received');
        Alert.alert('Login Error', 'Authentication token not received. Please try again.');
        setLoading(false);
        return;
      }
      
      // Explicitly log and store the token
      console.log('Token received:', response.token.substring(0, 15) + '...');
      await AsyncStorage.setItem('token', response.token);
      
      // Verify token was stored correctly
      const storedToken = await AsyncStorage.getItem('token');
      console.log('Token stored successfully:', !!storedToken);
      
      // Double-check auth status
      try {
        const authStatus = await fineService.checkAuthStatus();
        console.log('Auth status check after login:', authStatus.success);
      } catch (authCheckError) {
        console.error('Auth status check failed:', authCheckError);
      }
      
      setLoading(false);
      
      // Get account type
      const accountType = await authService.getAccountType();
      console.log('Account type:', accountType);
      
      // Navigate to the appropriate dashboard based on account type
      if (accountType === 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminDashboard' }],
        });
      } else {
        // Default to officer dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'OfficerDashboard' }],
        });
      }
    } catch (error) {
      setLoading(false);
      
      // Handle different types of errors
      if (error.message && error.message.includes('Network Error')) {
        Alert.alert(
          'Connection Error', 
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (error.response) {
        // The server responded with a status code outside the 2xx range
        const errorMessage = error.response.data?.message || 'An error occurred during login. Please try again.';
        Alert.alert('Login Failed', errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert(
          'Server Error', 
          'No response received from server. Please try again later.'
        );
      } else {
        // Something else happened while setting up the request
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
      
      console.error('Login error details:', error);
    }
  };

  const navigateToCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {!networkAvailable && (
        <View style={styles.networkWarning}>
          <Text style={styles.networkWarningText}>
            No internet connection. Login may not work properly.
          </Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>Officer Login</Text>
        <Text style={styles.subtitle}>Access your DriveMe Police Portal</Text>
      </View>
      
      <View style={styles.form}>
        <TextInput
          style={[styles.input, errors.id && styles.inputError]}
          placeholder="Officer ID"
          value={credentials.id}
          onChangeText={(text) => {
            setCredentials({...credentials, id: text});
            if (errors.id) setErrors({...errors, id: null});
          }}
        />
        {errors.id && <Text style={styles.errorText}>{errors.id}</Text>}
        
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          secureTextEntry
          value={credentials.password}
          onChangeText={(text) => {
            setCredentials({...credentials, password: text});
            if (errors.password) setErrors({...errors, password: null});
          }}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={navigateToCreateAccount}
        >
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 16,
    color: '#455A64',
    marginTop: 10,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D0D9E3',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  loginButton: {
    backgroundColor: '#1A237E',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  createAccountText: {
    color: '#1A237E',
    fontSize: 16,
    fontWeight: '500',
  },
  networkWarning: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  networkWarningText: {
    color: '#856404',
    fontSize: 12,
  },
}); 