import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import { isConnected } from '../utils/networkUtils';

export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const [accountType, setAccountType] = useState('officer'); // 'officer' or 'admin'
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
    if (!formData.id) newErrors.id = 'ID is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    if (formData.password !== formData.confirmPassword) 
      newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
  };

  const handleCreateAccount = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Send registration data to the server
      const response = await authService.register({
        id: formData.id,
        name: formData.name,
        password: formData.password,
        accountType: accountType
      });
      
      setLoading(false);
      
      // Show success message
      Alert.alert(
        'Account Created', 
        `Your ${accountType === 'officer' ? 'Officer' : 'Admin'} account has been created successfully!`,
        [
          { 
            text: 'OK', 
            onPress: () => {
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
            }
          }
        ]
      );
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
        const errorMessage = error.response.data?.message || 'An error occurred during registration. Please try again.';
        Alert.alert('Registration Failed', errorMessage);
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
      
      console.error('Registration error details:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <StatusBar barStyle="dark-content" />
      
      {!networkAvailable && (
        <View style={styles.networkWarning}>
          <Text style={styles.networkWarningText}>
            No internet connection. Account creation may not work properly.
          </Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the DriveMe Police Portal</Text>
      </View>
      
      <View style={styles.accountTypeContainer}>
        <Text style={styles.sectionTitle}>Account Type</Text>
        <View style={styles.accountTypeButtons}>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              accountType === 'officer' && styles.activeAccountType
            ]}
            onPress={() => handleAccountTypeChange('officer')}
          >
            <Text 
              style={[
                styles.accountTypeText,
                accountType === 'officer' && styles.activeAccountTypeText
              ]}
            >
              Officer
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              accountType === 'admin' && styles.activeAccountType
            ]}
            onPress={() => handleAccountTypeChange('admin')}
          >
            <Text 
              style={[
                styles.accountTypeText,
                accountType === 'admin' && styles.activeAccountTypeText
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TextInput
          style={[styles.input, errors.id && styles.inputError]}
          placeholder={`${accountType === 'officer' ? 'Officer' : 'Admin'} ID`}
          value={formData.id}
          onChangeText={(text) => {
            setFormData({...formData, id: text});
            if (errors.id) setErrors({...errors, id: null});
          }}
        />
        {errors.id && <Text style={styles.errorText}>{errors.id}</Text>}
        
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData({...formData, name: text});
            if (errors.name) setErrors({...errors, name: null});
          }}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        
        <Text style={styles.sectionTitle}>Security</Text>
        
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => {
            setFormData({...formData, password: text});
            if (errors.password) setErrors({...errors, password: null});
          }}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm Password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => {
            setFormData({...formData, confirmPassword: text});
            if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
          }}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginTop: 20,
    marginBottom: 10,
  },
  accountTypeContainer: {
    marginBottom: 10,
  },
  accountTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountTypeButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0D9E3',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  activeAccountType: {
    borderColor: '#1A237E',
    backgroundColor: '#E8EAF6',
  },
  accountTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#455A64',
  },
  activeAccountTypeText: {
    color: '#1A237E',
    fontWeight: 'bold',
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
  createButton: {
    backgroundColor: '#1A237E',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },
  loginLinkText: {
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