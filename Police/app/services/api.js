import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Choose the right base URL based on platform and environment
const getBaseUrl = () => {
  // For non-production environments, try to access the server on commonly used ports
  const SERVER_PORT = '5002'; // Default port for your server
  
  if (Platform.OS === 'android') {
    // Android uses 10.0.2.2 to access the localhost of the machine
    return `http://10.0.2.2:${SERVER_PORT}/api/police`;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return `http://localhost:${SERVER_PORT}/api/police`;
  } else {
    // Web or other platforms - allow access to localhost directly
    return `http://localhost:${SERVER_PORT}/api/police`;
  }
};

// Base URL
const API_URL = getBaseUrl();

// Set longer timeout for potentially slow connections
const TIMEOUT = 15000; // 15 seconds

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: TIMEOUT,
});

// Add request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      // For debugging
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
      
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('API interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add debug logging interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add retry logic for network failures
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Don't retry if we've already retried or if it's a 4xx error (client error)
    if (
      originalRequest._retry || 
      (error.response && error.response.status >= 400 && error.response.status < 500)
    ) {
      return Promise.reject(error);
    }
    
    // Check if it's a network error or 5xx (server error)
    if (error.message.includes('Network Error') || 
        (error.response && error.response.status >= 500)) {
      originalRequest._retry = true;
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check network connectivity before retrying
      try {
        const netInfo = await NetInfo.fetch();
        if (!netInfo.isConnected) {
          return Promise.reject(new Error('No internet connection'));
        }
      } catch (e) {
        // Continue anyway if we can't check connectivity
      }
      
      // Retry the request
      console.log('Retrying request after network error:', originalRequest.url);
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Register new police officer or admin
  register: async (userData) => {
    console.log('Registering with data:', userData);
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('accountType', response.data.accountType);
      await AsyncStorage.setItem('userId', response.data.id);
      await AsyncStorage.setItem('userName', response.data.name);
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    console.log('Logging in with:', credentials);
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('accountType', response.data.accountType);
      await AsyncStorage.setItem('userId', response.data.id);
      await AsyncStorage.setItem('userName', response.data.name);
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('accountType');
    await AsyncStorage.removeItem('userId');
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
  
  // Get user account type
  getAccountType: async () => {
    return await AsyncStorage.getItem('accountType');
  },

  // Get user ID
  getUserId: async () => {
    return await AsyncStorage.getItem('userId');
  },
  
  // Get user name
  getUserName: async () => {
    return await AsyncStorage.getItem('userName');
  }
};

// Fine service
export const fineService = {
  // Debugging methods to check users
  getAllUsers: async () => {
    try {
      console.log('Fetching all users for debugging...');
      const response = await api.get('/fines/test/all-users');
      console.log(`Found ${response.data.count} users`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },
  
  testFindByLicense: async (dlNumber) => {
    try {
      console.log(`Testing license search for: ${dlNumber}`);
      const encodedDlNumber = encodeURIComponent(dlNumber.trim());
      const response = await api.get(`/fines/test/find-license/${encodedDlNumber}`);
      console.log('License search test result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing license search:', error);
      throw error;
    }
  },

  // Debug method to check authentication status
  checkAuthStatus: async () => {
    try {
      console.log('Checking authentication status...');
      const token = await AsyncStorage.getItem('token');
      console.log(`Token in storage: ${token ? 'Present' : 'Missing'}`);
      if (token) {
        console.log(`Token value: ${token.substring(0, 15)}...`);
      }
      
      const response = await api.get('/fines/debug/auth-status');
      console.log('Auth status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }
  },

  searchUserByLicense: async (dlNumber) => {
    console.log('-------------- LICENSE SEARCH REQUEST START --------------');
    try {
      // Request validation and preparation
      console.log(`Original license input: "${dlNumber}"`);
      
      if (!dlNumber || typeof dlNumber !== 'string' || !dlNumber.trim()) {
        throw new Error('Valid license number is required');
      }
      
      const cleanDlNumber = dlNumber.trim();
      const encodedDlNumber = encodeURIComponent(cleanDlNumber);
      
      // IMPORTANT: Try multiple approaches
      console.log('First trying the test endpoint...');
      try {
        const testResult = await api.get(`/fines/test/find-license/${encodedDlNumber}`);
        if (testResult.data && testResult.data.success) {
          console.log('Test endpoint successful!');
          return testResult;
        }
      } catch (testError) {
        console.warn('Test endpoint failed, falling back to public search...');
      }
      
      // Fall back to public search if test endpoint fails
      console.log('Using public search endpoint...');
      const searchUrl = `/fines/public-search/${encodedDlNumber}`;
      
      const response = await api.get(searchUrl);
      
      // Response handling
      const requestEnd = new Date();
      console.log(`Request completed at: ${requestEnd.toISOString()}`);
      console.log(`Request duration: ${requestEnd - requestStart}ms`);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response status text: ${response.statusText}`);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      
      // Validate response structure
      if (!response.data) {
        console.error('Response missing data property');
        throw new Error('Invalid response format from server: missing data property');
      }
      
      if (!response.data.success) {
        console.error('Response indicates failure:', response.data);
        throw new Error(response.data.message || 'Server reported an error');
      }
      
      if (!response.data.data) {
        console.error('Response missing data.data property');
        throw new Error('Invalid response format from server: missing data.data property');
      }
      
      // Validate user data
      const userData = response.data.data;
      const requiredFields = ['_id', 'name', 'idNumber', 'dlNumber', 'dlExpireDate'];
      
      for (const field of requiredFields) {
        if (!userData[field]) {
          console.error(`Missing required field in user data: ${field}`);
          throw new Error(`Invalid user data: missing ${field}`);
        }
      }
      
      console.log('License search successful with valid data');
      console.log('-------------- LICENSE SEARCH REQUEST END --------------');
      return response;
    } catch (error) {
      // Enhanced error handling with different error types
      console.error('-------------- LICENSE SEARCH ERROR --------------');
      console.error(`Error message: ${error.message}`);
      
      // Network errors
      if (error.message === 'Network Error') {
        console.error('Network error detected. API server may be down or network is disconnected');
      }
      
      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error('Request timed out. API server may be slow or unresponsive');
      }
      
      // Server response errors
      if (error.response) {
        console.error(`HTTP status code: ${error.response.status}`);
        console.error(`Response status text: ${error.response.statusText}`);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        
        // Handle specific status codes
        if (error.response.status === 404) {
          console.error('Endpoint not found. Check if API route is correct');
        } else if (error.response.status === 401 || error.response.status === 403) {
          console.error('Authentication or authorization error. Check if token is valid');
        } else if (error.response.status >= 500) {
          console.error('Server error. Check server logs for details');
        }
      }
      
      // Request errors but no response
      if (error.request && !error.response) {
        console.error('Request was made but no response was received');
        console.error('Request details:', error.request);
      }
      
      // Configuration errors
      if (error.config) {
        console.error('Request configuration:', {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
          timeout: error.config.timeout,
          baseURL: error.config.baseURL
        });
      }
      
      // Log stack trace
      console.error('Error stack trace:', error.stack);
      console.error('-------------- LICENSE SEARCH ERROR END --------------');
      
      // Re-throw the error with enhanced information
      throw error;
    }
  },
  
  testCreateFine: async (fineData) => {
    try {
      console.log('Testing direct fine creation for:', fineData);
      const response = await api.post('/fines/test/create-fine', fineData);
      console.log('Test fine creation result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing fine creation:', error);
      throw error;
    }
  },

  issueFine: async (fineData) => {
    try {
      console.log('-------------- ISSUE FINE REQUEST START --------------');
      console.log(`Issuing fine with data:`, fineData);
      
      // First try the direct test endpoint
      try {
        console.log('Trying direct test endpoint first...');
        const testResult = await fineService.testCreateFine(fineData);
        if (testResult && testResult.success) {
          console.log('Direct test endpoint successful!');
          return { data: testResult };
        }
      } catch (testError) {
        console.warn('Test endpoint failed, falling back to public issue endpoint:', testError.message);
      }
      
      // Fall back to public issue endpoint
      // Validate required fields
      const requiredFields = ['idNumber', 'dlNumber', 'description', 'amount', 'location'];
      const missingFields = requiredFields.filter(field => !fineData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // IMPORTANT: Use the direct public endpoint to bypass routing issues
      const issueUrl = '/public-issue';
      console.log(`Using direct public endpoint: ${issueUrl}`);
      console.log(`Full API URL: ${API_URL}${issueUrl}`);
      
      // Add a small delay to ensure the server is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await api.post(issueUrl, fineData);
      
      console.log('Fine issue successful:', response.data);
      console.log('-------------- ISSUE FINE REQUEST END --------------');
      return response;
    } catch (error) {
      console.error('-------------- ISSUE FINE ERROR --------------');
      console.error('Fine issue failed with error:', error);
      
      // Enhanced error information
      let errorInfo = {
        message: error.message,
      };
      
      if (error.response) {
        errorInfo = {
          ...errorInfo,
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        };
        console.error(`Response status: ${error.response.status}`);
        console.error('Response data:', error.response.data);
      }
      
      if (error.config) {
        errorInfo.url = error.config.url;
        errorInfo.method = error.config.method;
        errorInfo.baseURL = error.config.baseURL;
        
        console.error('Request URL:', error.config.baseURL + error.config.url);
        console.error('Request method:', error.config.method);
      }
      
      console.error('Detailed error info:', errorInfo);
      console.error('-------------- ISSUE FINE ERROR END --------------');
      throw error;
    }
  },
  
  getUserFines: async (userId) => {
    const response = await api.get(`/fines/user/${userId}`);
    return response;
  },
  
  getFineDetails: async (fineId) => {
    const response = await api.get(`/fines/${fineId}`);
    return response;
  },
  
  updateFineStatus: async (fineId, statusData) => {
    const response = await api.put(`/fines/${fineId}/status`, statusData);
    return response;
  },
  
  getOfficerActivity: async (timeframe = 'daily') => {
    try {
      console.log(`[API] Fetching officer activity for timeframe: ${timeframe}`);
      
      // Get token for debugging
      const token = await AsyncStorage.getItem('token');
      console.log(`[API] Auth token present: ${!!token}`);
      
      // Get user ID for debugging
      const userId = await AsyncStorage.getItem('userId');
      console.log(`[API] User ID: ${userId}`);
      
      const response = await api.get(`/fines/officer-activity?timeframe=${timeframe}`);
      console.log(`[API] Officer activity response status: ${response.status}`);
      
      if (!response.data) {
        console.error('[API] No data in response');
        throw new Error('No data received from server');
      }
      
      console.log(`[API] Activity data: ${JSON.stringify(response.data)}`);
      
      if (response.data.success) {
        if (response.data.isMockData) {
          console.log('[API] This is mock data from the server');
        }
        
        if (response.data.summary) {
          console.log(`[API] Received officer activity data: ${response.data.summary.totalFines} fines, $${response.data.summary.totalAmount}`);
        } else {
          console.warn('[API] Missing summary in response data');
        }
        
        // Return complete response, including isMockData flag if present
        return {
          ...response.data,
          isMockData: response.data.isMockData || false
        };
      } else {
        console.warn('[API] Missing success in response data');
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('[API] Error fetching officer activity:', error.message);
      
      // Enhanced error information
      if (error.response) {
        console.error(`[API] Status: ${error.response.status}`);
        console.error('[API] Response data:', error.response.data);
        console.error('[API] Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('[API] No response received:', error.request);
        // Try to determine if there's a connection issue
        try {
          const netInfo = await NetInfo.fetch();
          console.log(`[API] Network connected: ${netInfo.isConnected}, type: ${netInfo.type}`);
        } catch (netError) {
          console.error('[API] Error checking network:', netError);
        }
      } else {
        console.error('[API] Error setting up request:', error.message);
      }
      
      throw error;
    }
  }
};

export const apiInstance = api;

export default {
  api: apiInstance,
  authService,
  fineService
}; 