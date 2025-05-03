import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import PoliceBadge from '../../components/PoliceBadge';

export default function OfficerDashboard() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    id: ''
  });
  const [loading, setLoading] = useState(true);

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
          
          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Feature', 'License Verification feature coming soon')}>
            <Text style={styles.cardIcon}>📄</Text>
            <Text style={styles.cardTitle}>License Verification</Text>
            <Text style={styles.cardDescription}>Verify driver licenses</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Feature', 'View Open Fines feature coming soon')}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardTitle}>View Open Fines</Text>
            <Text style={styles.cardDescription}>Check outstanding fines</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Feature', 'Vehicle Records feature coming soon')}>
            <Text style={styles.cardIcon}>🚘</Text>
            <Text style={styles.cardTitle}>Violation predictor</Text>
            <Text style={styles.cardDescription}>Check vViolation predictor</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.reportContainer}>
          <Text style={styles.reportTitle}>Daily Activity</Text>
          <View style={styles.reportItem}>
            <Text style={styles.reportLabel}>Violations Issued:</Text>
            <Text style={styles.reportValue}>0</Text>
          </View>
          <View style={styles.reportItem}>
            <Text style={styles.reportLabel}>Licenses Verified:</Text>
            <Text style={styles.reportValue}>0</Text>
          </View>
          <View style={styles.reportItem}>
            <Text style={styles.reportLabel}>Fines Collected:</Text>
            <Text style={styles.reportValue}>$0.00</Text>
          </View>
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
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 15,
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
}); 