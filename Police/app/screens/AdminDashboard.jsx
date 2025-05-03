import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/api';
import PoliceBadge from '../../components/PoliceBadge';

// Mock data for demo purposes
const MOCK_OFFICERS = [
  { id: 'OFF001', name: 'John Smith', status: 'Active', violations: 12 },
  { id: 'OFF002', name: 'Maria Rodriguez', status: 'Active', violations: 8 },
  { id: 'OFF003', name: 'David Johnson', status: 'Inactive', violations: 0 },
];

const MOCK_STATS = {
  totalOfficers: 3,
  activeOfficers: 2,
  totalViolations: 20,
  pendingApprovals: 2
};

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    id: ''
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(MOCK_STATS);
  const [officers, setOfficers] = useState(MOCK_OFFICERS);

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

  const renderOfficerItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.officerItem, 
        { borderLeftColor: item.status === 'Active' ? '#4CAF50' : '#F44336' }
      ]}
      onPress={() => Alert.alert('Officer Details', `Details for ${item.name} coming soon`)}
    >
      <View style={styles.officerInfo}>
        <Text style={styles.officerName}>{item.name}</Text>
        <Text style={styles.officerId}>ID: {item.id}</Text>
      </View>
      <View style={styles.officerStats}>
        <Text style={[
          styles.officerStatus, 
          { color: item.status === 'Active' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.status}
        </Text>
        <Text style={styles.officerViolations}>{item.violations} violations</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <PoliceBadge width={60} height={60} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome, Administrator</Text>
          <Text style={styles.nameText}>{userData.name}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalOfficers}</Text>
            <Text style={styles.statLabel}>Total Officers</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeOfficers}</Text>
            <Text style={styles.statLabel}>Active Officers</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalViolations}</Text>
            <Text style={styles.statLabel}>Total Violations</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingApprovals}</Text>
            <Text style={styles.statLabel}>Pending Approvals</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Officer Management</Text>
          <TouchableOpacity onPress={() => Alert.alert('Feature', 'Add officer feature coming soon')}>
            <Text style={styles.sectionAction}>+ Add Officer</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={officers}
          renderItem={renderOfficerItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={styles.officersList}
        />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>System Administration</Text>
        </View>
        
        <View style={styles.adminActionContainer}>
          <TouchableOpacity 
            style={styles.adminAction}
            onPress={() => Alert.alert('Feature', 'Settings feature coming soon')}  
          >
            <Text style={styles.adminActionIcon}>⚙️</Text>
            <Text style={styles.adminActionText}>System Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.adminAction}
            onPress={() => Alert.alert('Feature', 'Reports feature coming soon')}  
          >
            <Text style={styles.adminActionIcon}>📊</Text>
            <Text style={styles.adminActionText}>Generate Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.adminAction}
            onPress={() => Alert.alert('Feature', 'Backup feature coming soon')}  
          >
            <Text style={styles.adminActionIcon}>💾</Text>
            <Text style={styles.adminActionText}>Backup Database</Text>
          </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  sectionAction: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  officersList: {
    marginBottom: 15,
  },
  officerItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  officerInfo: {
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 5,
  },
  officerId: {
    fontSize: 12,
    color: '#666',
  },
  officerStats: {
    alignItems: 'flex-end',
  },
  officerStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  officerViolations: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  adminActionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adminAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  adminActionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  adminActionText: {
    fontSize: 16,
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