import axios from 'axios';

const API_URL = 'http://localhost:5002/api/admin/';
const AUTH_URL = 'http://localhost:5002/api/admin/auth/';

// Helper function to get auth token
const getAuthToken = () => {
  const admin = JSON.parse(localStorage.getItem('admin'));
  return admin?.token;
};

// Set auth header
const setAuthHeader = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Register admin - Uses AdminUser model
export const registerAdmin = async (adminData) => {
  try {
    console.log('Registering admin with data:', adminData);
    const response = await axios.post(AUTH_URL + 'register', adminData);
    
    if (response.data && response.data.token) {
      localStorage.setItem('admin', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Registration successful but no token received');
    }
  } catch (error) {
    console.error('Admin registration error:', error);
    
    // Handle errors from server
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    
    // Handle network errors
    if (error.request) {
      throw { message: 'Network error. Please check your connection.' };
    }
    
    // Handle other errors
    throw { message: error.message || 'Registration failed. Please try again.' };
  }
};

// Login admin - Uses AdminUser model
export const loginAdmin = async (credentials) => {
  try {
    console.log('Logging in admin with credentials:', { idNumber: credentials.idNumber });
    const response = await axios.post(AUTH_URL + 'login', credentials);
    
    if (response.data && response.data.token) {
      localStorage.setItem('admin', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Login successful but no token received');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    
    // Handle errors from server
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    
    // Handle network errors
    if (error.request) {
      throw { message: 'Network error. Please check your connection.' };
    }
    
    // Handle other errors
    throw { message: error.message || 'Login failed. Please try again.' };
  }
};

// Logout admin
export const logoutAdmin = () => {
  localStorage.removeItem('admin');
};

// Get current admin user
export const getCurrentAdmin = () => {
  return JSON.parse(localStorage.getItem('admin'));
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const admin = getCurrentAdmin();
  return !!admin && !!admin.token;
};

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const response = await axios.get(AUTH_URL + 'me', setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Get admin profile error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      logoutAdmin();
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to get profile information.' };
  }
};

// Track last API call time
let lastPoliceAccountsFetchTime = 0;
const DEBOUNCE_DELAY = 2000; // 2 seconds

// Get all police accounts
export const getPoliceAccounts = async () => {
  try {
    // Check if we've made this call recently
    const now = Date.now();
    if (now - lastPoliceAccountsFetchTime < DEBOUNCE_DELAY) {
      console.log('Skipping repeated API call (called too frequently)');
      return JSON.parse(localStorage.getItem('policeAccountsCache')) || { 
        success: true, 
        data: [],
        count: 0,
        message: 'Using cached data due to frequent calls' 
      };
    }
    
    console.log('Calling API to get police accounts');
    lastPoliceAccountsFetchTime = now;
    
    const response = await axios.get(API_URL + 'police', setAuthHeader());
    
    console.log('Police accounts API response:', response.status);
    
    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid response format received from server');
    }
    
    // Cache successful response
    localStorage.setItem('policeAccountsCache', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Get police accounts error details:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Server error response:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Token expired or invalid - logout
        logoutAdmin();
        throw { message: 'Session expired. Please login again.' };
      }
      
      throw error.response.data || { message: 'Server error: ' + error.response.status };
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw { message: error.message || 'Failed to fetch police accounts.' };
    }
  }
};

// Get single police account
export const getPoliceAccount = async (id) => {
  try {
    const response = await axios.get(API_URL + `police/${id}`, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Get police account error:', error);
    throw error.response?.data || { message: 'Failed to fetch police account details.' };
  }
};

// Create new police account
export const createPoliceAccount = async (accountData) => {
  try {
    const response = await axios.post(API_URL + 'police', accountData, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Create police account error:', error);
    throw error.response?.data || { message: 'Failed to create police account.' };
  }
};

// Update police account
export const updatePoliceAccount = async (id, updateData) => {
  try {
    const response = await axios.put(API_URL + `police/${id}`, updateData, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Update police account error:', error);
    throw error.response?.data || { message: 'Failed to update police account.' };
  }
};

// Delete police account
export const deletePoliceAccount = async (id) => {
  try {
    const response = await axios.delete(API_URL + `police/${id}`, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Delete police account error:', error);
    throw error.response?.data || { message: 'Failed to delete police account.' };
  }
};

// Search police accounts by ID or name
export const searchPoliceAccounts = async (query) => {
  try {
    console.log('Searching police accounts with query:', query);
    const response = await axios.get(
      API_URL + 'police/search?q=' + encodeURIComponent(query), 
      setAuthHeader()
    );
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Search police accounts error:', error);
    
    if (error.response?.status === 401) {
      logoutAdmin();
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to search police accounts.' };
  }
}; 