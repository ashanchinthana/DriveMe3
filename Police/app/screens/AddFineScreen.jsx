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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import { fineService } from '../services/api';

export default function AddFineScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [userFound, setUserFound] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  const [officerId, setOfficerId] = useState('');
  
  const [fineData, setFineData] = useState({
    description: '',
    amount: '',
    location: ''
  });
  
  const [errors, setErrors] = useState({});

  // Load all users on mount for debugging
  useEffect(() => {
    const loadTestData = async () => {
      try {
        // Try to get all users
        const usersData = await fineService.getAllUsers();
        console.log(`Loaded ${usersData.count} users for reference`);
        
        // If there are users, show a debug message
        if (usersData.count > 0) {
          Alert.alert(
            'Debug Info', 
            `Found ${usersData.count} users in database.\nUse one of these license numbers for testing.`, 
            [
              {
                text: 'OK',
                onPress: () => {
                  // If there are users, set the first user's license as the search query
                  if (usersData.data && usersData.data.length > 0) {
                    const firstUser = usersData.data[0];
                    setSearchQuery(firstUser.dlNumber);
                  }
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error loading test data:', error);
      }
    };
    
    loadTestData();
  }, []);

  // Get officer ID on component mount
  useEffect(() => {
    const getOfficerInfo = async () => {
      try {
        const id = await authService.getUserId();
        if (id) {
          setOfficerId(id);
          console.log('Officer ID set:', id);
        } else {
          console.warn('No officer ID found in storage');
        }
      } catch (error) {
        console.error('Error getting officer ID:', error);
      }
    };
    
    getOfficerInfo();
  }, []);

  const handleSearch = async () => {
    console.log('-------------- SEARCH PROCESS START --------------');
    
    // Reset states
    setErrors({});
    
    // Basic validation
    const cleanSearchQuery = searchQuery ? searchQuery.trim() : '';
    if (!cleanSearchQuery) {
      Alert.alert('Error', 'Please enter a valid license number');
      return;
    }
    
    // UI updates before search
    setSearchLoading(true);
    setUserFound(null);
    
    try {
      console.log(`Searching for license: "${cleanSearchQuery}"`);
      
      // First try the test endpoint
      try {
        console.log('Using test endpoint first...');
        const testResult = await fineService.testFindByLicense(cleanSearchQuery);
        
        if (testResult && testResult.success) {
          const userData = testResult.data;
          console.log(`User found via test endpoint: ${userData.name}`);
          
          setUserFound(userData);
          setSearchQuery(userData.dlNumber); // Update input with formatted license number
          setSearchLoading(false);
          
          Alert.alert('Driver Found', `Name: ${userData.name}\nLicense: ${userData.dlNumber}`);
          return;
        }
      } catch (testError) {
        console.warn('Test endpoint failed, trying regular search:', testError.message);
      }
      
      // If test endpoint failed, try the regular search
      const result = await fineService.searchUserByLicense(cleanSearchQuery);
      
      if (!result.data || !result.data.data) {
        throw new Error('Invalid response from server');
      }
      
      const userData = result.data.data;
      console.log(`User found via regular search: ${userData.name}`);
      
      setUserFound(userData);
      setSearchQuery(userData.dlNumber);
      setSearchLoading(false);
      
      Alert.alert('Driver Found', `Name: ${userData.name}\nID: ${userData.idNumber}\nLicense: ${userData.dlNumber}`);
    } catch (error) {
      console.error('Search error:', error);
      setSearchLoading(false);
      
      // Format user-friendly error message
      let errorMessage = 'An unexpected error occurred.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = `No driver found with license number "${cleanSearchQuery}"`;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Search Failed', errorMessage);
    }
  };

  const validateFineData = () => {
    const newErrors = {};
    
    if (!fineData.description) {
      newErrors.description = 'Description is required';
    }
    
    if (!fineData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(fineData.amount)) || Number(fineData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!fineData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (!officerId) {
      newErrors.officerId = 'Officer ID not available. Please log in again.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIssueFine = async () => {
    if (!userFound) {
      Alert.alert('Error', 'Please search for a user first');
      return;
    }
    
    if (!validateFineData()) {
      return;
    }
    
    setIssueLoading(true);
    
    try {
      const fineRequestData = {
        idNumber: userFound.idNumber,
        dlNumber: userFound.dlNumber,
        description: fineData.description,
        amount: Number(fineData.amount),
        location: fineData.location,
        officerId: officerId // Add officer ID to the request
      };
      
      console.log('Issuing fine with data:', fineRequestData);
      
      const response = await fineService.issueFine(fineRequestData);
      
      console.log('Fine issued successfully:', response.data);
      setIssueLoading(false);
      
      Alert.alert(
        'Success', 
        'Fine has been issued successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to dashboard
              setUserFound(null);
              setSearchQuery('');
              setFineData({
                description: '',
                amount: '',
                location: ''
              });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Issue fine error details:', error);
      setIssueLoading(false);
      
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          Alert.alert('Authorization Error', 'You are not authorized to issue fines. Please log in again.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'User information could not be verified. Please try searching again.');
        } else {
          Alert.alert('Server Error', 
            `Failed to issue fine. ${error.response.data?.message || 'Please try again later.'}`);
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred while issuing the fine. Please try again.');
      }
      
      console.error('Full issue fine error:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Issue Traffic Fine</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Search by License Number</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter driving license number"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {userFound && (
          <>
            <View style={styles.userCard}>
              <Text style={styles.userCardTitle}>Driver Information</Text>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Name:</Text>
                <Text style={styles.userInfoValue}>{userFound.name}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>ID Number:</Text>
                <Text style={styles.userInfoValue}>{userFound.idNumber}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>License Number:</Text>
                <Text style={styles.userInfoValue}>{userFound.dlNumber}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>License Expires:</Text>
                <Text style={styles.userInfoValue}>{formatDate(userFound.dlExpireDate)}</Text>
              </View>
            </View>
            
            <View style={styles.fineSection}>
              <Text style={styles.sectionTitle}>Fine Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, errors.description && styles.inputError]}
                  placeholder="Describe the traffic violation"
                  value={fineData.description}
                  onChangeText={(text) => {
                    setFineData({...fineData, description: text});
                    if (errors.description) setErrors({...errors, description: null});
                  }}
                  multiline
                />
                {errors.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (RS)</Text>
                <TextInput
                  style={[styles.input, errors.amount && styles.inputError]}
                  placeholder="Enter fine amount"
                  value={fineData.amount}
                  onChangeText={(text) => {
                    setFineData({...fineData, amount: text});
                    if (errors.amount) setErrors({...errors, amount: null});
                  }}
                  keyboardType="numeric"
                />
                {errors.amount && (
                  <Text style={styles.errorText}>{errors.amount}</Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="Enter location of violation"
                  value={fineData.location}
                  onChangeText={(text) => {
                    setFineData({...fineData, location: text});
                    if (errors.location) setErrors({...errors, location: null});
                  }}
                />
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.issueButton}
                onPress={handleIssueFine}
                disabled={issueLoading}
              >
                {issueLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.issueButtonText}>Issue Fine</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#1A237E',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0D9E3',
  },
  searchButton: {
    backgroundColor: '#1A237E',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 15,
  },
  userInfoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userInfoLabel: {
    width: 120,
    fontSize: 14,
    color: '#666',
  },
  userInfoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFC',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D9E3',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  issueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  issueButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 