import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:5002/api/fines/';

// Get all fines for current user
export const getUserFines = async () => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('No authentication token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error('Get user fines error:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to get fines information.' };
  }
};

// Get outstanding (unpaid) fines for current user
export const getOutstandingFines = async () => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('No authentication token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.get(API_URL + 'outstanding', config);
    return response.data;
  } catch (error) {
    console.error('Get outstanding fines error:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to get outstanding fines information.' };
  }
};

// Get fine details
export const getFineDetails = async (fineId) => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('No authentication token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.get(API_URL + fineId, config);
    return response.data;
  } catch (error) {
    console.error('Get fine details error:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to get fine details.' };
  }
};

// Dispute a fine
export const disputeFine = async (fineId) => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('No authentication token found');
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    };
    
    const response = await axios.put(API_URL + fineId + '/status', { status: 'Disputed' }, config);
    return response.data;
  } catch (error) {
    console.error('Dispute fine error:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Session expired. Please login again.' };
    }
    
    throw error.response?.data || { message: 'Failed to dispute fine.' };
  }
};

// Public search endpoint to get fines by license number - for testing purposes
export const getFinesByLicense = async (dlNumber) => {
  try {
    const response = await axios.get(`http://localhost:5002/api/fines/public/search-fines/${dlNumber}`);
    return response.data;
  } catch (error) {
    console.error('Get fines by license error:', error);
    throw error.response?.data || { message: 'Failed to get fines by license number.' };
  }
}; 