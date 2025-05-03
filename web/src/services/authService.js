import axios from 'axios';

const API_URL = 'http://localhost:5002/api/auth/';

// Register user
export const register = async (userData) => {
  try {
    console.log('Registering user with data:', { ...userData, password: '***' });
    const response = await axios.post(API_URL + 'register', userData);
    
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Registration successful but no token received');
    }
  } catch (error) {
    console.error('User registration error:', error);
    
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

// Login user
export const login = async (credentials) => {
  try {
    console.log('Logging in user with credentials:', { idNumber: credentials.idNumber });
    const response = await axios.post(API_URL + 'login', credentials);
    
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Login successful but no token received');
    }
  } catch (error) {
    console.error('User login error:', error);
    
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

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user && !!user.token;
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = getCurrentUser()?.token;
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    
    const response = await axios.get(API_URL + 'me', config);
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      logout();
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to get profile information.' };
  }
}; 