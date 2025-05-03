import axios from 'axios';

const API_URL = 'http://localhost:5002/api/admin/users/';

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

// Track last API call time
let lastUsersFetchTime = 0;
const DEBOUNCE_DELAY = 2000; // 2 seconds

// Get all users
export const getAllUsers = async () => {
  try {
    // Check if we've made this call recently
    const now = Date.now();
    if (now - lastUsersFetchTime < DEBOUNCE_DELAY) {
      console.log('Skipping repeated API call (called too frequently)');
      return JSON.parse(localStorage.getItem('usersCache')) || { 
        success: true, 
        data: [],
        count: 0,
        message: 'Using cached data due to frequent calls' 
      };
    }
    
    console.log('Calling API to get users');
    lastUsersFetchTime = now;
    
    const response = await axios.get(API_URL, setAuthHeader());
    
    console.log('Users API response:', response.status);
    
    // Check if response has the expected structure
    if (!response.data || typeof response.data !== 'object') {
      console.error('Invalid API response format:', response.data);
      throw new Error('Invalid response format received from server');
    }
    
    // Cache successful response
    localStorage.setItem('usersCache', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Get users error details:', error);
    
    if (error.response) {
      console.error('Server error response:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        throw { message: 'Session expired. Please login again.' };
      }
      
      throw error.response.data || { message: 'Server error: ' + error.response.status };
    } else if (error.request) {
      console.error('No response received from server');
      throw { message: 'No response from server. Please check your connection.' };
    } else {
      console.error('Request setup error:', error.message);
      throw { message: error.message || 'Failed to fetch users.' };
    }
  }
};

// Get single user
export const getUser = async (id) => {
  try {
    const response = await axios.get(API_URL + id, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error.response?.data || { message: 'Failed to fetch user details.' };
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error.response?.data || { message: 'Failed to create user.' };
  }
};

// Update user
export const updateUser = async (id, updateData) => {
  try {
    const response = await axios.put(API_URL + id, updateData, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error.response?.data || { message: 'Failed to update user.' };
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(API_URL + id, setAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error.response?.data || { message: 'Failed to delete user.' };
  }
};

// Search users by ID, name, or email
export const searchUsers = async (query) => {
  try {
    console.log('Searching users with query:', query);
    const response = await axios.get(
      API_URL + 'search?q=' + encodeURIComponent(query), 
      setAuthHeader()
    );
    
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format received from server');
    }
    
    return response.data;
  } catch (error) {
    console.error('Search users error:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to search users.' };
  }
}; 