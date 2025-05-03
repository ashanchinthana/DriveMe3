import NetInfo from '@react-native-community/netinfo';

/**
 * Check if the device has internet connectivity
 * @returns {Promise<boolean>} Whether the device has internet connectivity
 */
export const isConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    // In some environments (like development), isInternetReachable might be null
    // In those cases, just rely on isConnected value
    const isInternetReachable = state.isInternetReachable === null ? 
      true : state.isInternetReachable;
    
    return state.isConnected && isInternetReachable;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    // If we can't determine connectivity, assume connected to avoid blocking the app
    return true;
  }
};

/**
 * Subscribe to network connectivity changes
 * @param {function} callback - Function to call when connectivity changes
 * @returns {function} Unsubscribe function
 */
export const subscribeToNetworkChanges = (callback) => {
  return NetInfo.addEventListener(state => {
    // Handle null isInternetReachable value
    const isInternetReachable = state.isInternetReachable === null ? 
      true : state.isInternetReachable;
    
    const isConnected = state.isConnected && isInternetReachable;
    callback(isConnected);
  });
};

export default {
  isConnected,
  subscribeToNetworkChanges,
}; 