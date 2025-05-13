import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService, fineService } from '../services/api';
import PoliceBadge from '../../components/PoliceBadge';

export default function OfficerDashboard() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    id: ''
  });
  const [activityData, setActivityData] = useState({
    totalFines: 0,
    totalAmount: 0,
    uniqueLicenses: 0,
    isMockData: false
  });
  const [timeframe, setTimeframe] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from storage
        const id = await authService.getUserId();
        const name = await authService.getUserName();
        
        setUserData({ id, name });
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Fetch officer activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setActivityLoading(true);
        console.log(`[OfficerDashboard] Fetching activity data for timeframe: ${timeframe}`);
        
        // Get officer ID for debugging
        const officerId = await authService.getUserId();
        console.log(`[OfficerDashboard] Current officer ID: ${officerId}`);
        
        const data = await fineService.getOfficerActivity(timeframe);
        console.log('[OfficerDashboard] Activity data received:', JSON.stringify(data));
        
        if (data && data.success && data.summary) {
          console.log(`[OfficerDashboard] Setting activity data: ${data.summary.totalFines} fines, ${data.summary.totalAmount} amount, ${data.summary.uniqueLicenses} licenses, isMockData: ${data.isMockData}`);
          setActivityData({
            totalFines: data.summary.totalFines || 0,
            totalAmount: data.summary.totalAmount || 0,
            uniqueLicenses: data.summary.uniqueLicenses || 0,
            isMockData: data.isMockData || false
          });
        } else {
          console.warn('[OfficerDashboard] Received unexpected data format:', data);
          // Set default values if data format is unexpected
          setActivityData({
            totalFines: 0,
            totalAmount: 0,
            uniqueLicenses: 0,
            isMockData: false
          });
        }
      } catch (error) {
        console.error('[OfficerDashboard] Error fetching activity data:', error);
        if (error.response) {
          console.error('[OfficerDashboard] Error response:', error.response.data);
          console.error('[OfficerDashboard] Status:', error.response.status);
        }
        // Set default values if there's an error
        setActivityData({
          totalFines: 0,
          totalAmount: 0,
          uniqueLicenses: 0,
          isMockData: false
        });
        
        // Check for connection issues
        try {
          const isLoggedIn = await authService.isLoggedIn();
          console.log(`[OfficerDashboard] User is logged in: ${isLoggedIn}`);
        } catch (authError) {
          console.error('[OfficerDashboard] Auth check error:', authError);
        }
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivityData();
  }, [timeframe]);

  // Format currency for display
  const formatCurrency = (amount) => {
    return `RS ${amount.toFixed(2)}`;
  };

  // Change timeframe and refresh data
  const handleTimeframeChange = (newTimeframe) => {
    if (newTimeframe !== timeframe) {
      setTimeframe(newTimeframe);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <PoliceBadge width={60} height={60} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome, Officer</Text>
          <Text style={styles.nameText}>{userData.name}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddFine')}>
            <Text style={styles.cardIcon}>🚗</Text>
            <Text style={styles.cardTitle}>Issue Traffic Violation</Text>
            <Text style={styles.cardDescription}>Record new traffic violations</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Feature', 'Vehicle Records feature coming soon')}>
            <Text style={styles.cardIcon}>🚘</Text>
            <Text style={styles.cardTitle}>Violation predictor</Text>
            <Text style={styles.cardDescription}>Check violation predictor</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reportContainer}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportTitle}>Daily Activity</Text>
            <View style={styles.timeframeSelector}>
              <TouchableOpacity
                style={[styles.timeframeButton, timeframe === 'daily' && styles.activeTimeframe]}
                onPress={() => handleTimeframeChange('daily')}
              >
                <Text style={[styles.timeframeText, timeframe === 'daily' && styles.activeTimeframeText]}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeframeButton, timeframe === 'weekly' && styles.activeTimeframe]}
                onPress={() => handleTimeframeChange('weekly')}
              >
                <Text style={[styles.timeframeText, timeframe === 'weekly' && styles.activeTimeframeText]}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timeframeButton, timeframe === 'monthly' && styles.activeTimeframe]}
                onPress={() => handleTimeframeChange('monthly')}
              >
                <Text style={[styles.timeframeText, timeframe === 'monthly' && styles.activeTimeframeText]}>Month</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {activityLoading ? (
            <ActivityIndicator size="small" color="#1A237E" style={styles.activityLoader} />
          ) : (
            <>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Violations Issued:</Text>
                <Text style={styles.reportValue}>{activityData.totalFines}</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Licenses Verified:</Text>
                <Text style={styles.reportValue}>{activityData.uniqueLicenses}</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportLabel}>Fines Collected:</Text>
                <Text style={styles.reportValue}>{formatCurrency(activityData.totalAmount)}</Text>
              </View>
              
              {/* Display mock data indicator if present */}
              {activityData.isMockData && (
                <View style={styles.mockDataIndicator}>
                  <Text style={styles.mockDataText}>
                    *Demo data shown due to server connectivity issues
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  headerTextContainer: {
    marginLeft: 15,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
  },
  reportContainer: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
  },
  activeTimeframe: {
    backgroundColor: '#1A237E',
  },
  timeframeText: {
    fontSize: 12,
    color: '#666',
  },
  activeTimeframeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  reportLabel: {
    fontSize: 14,
    color: '#444',
  },
  reportValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  activityLoader: {
    padding: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mockDataIndicator: {
    marginTop: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  mockDataText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 