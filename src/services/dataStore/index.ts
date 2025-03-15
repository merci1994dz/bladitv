
// Main export file for data store functionality
import { channels, countries, categories, isSyncing, setIsSyncing } from './state';
import { saveChannelsToStorage, loadFromLocalStorage } from './storage';
import { addChannelToMemory, removeChannelFromMemory, updateChannelInMemory } from './channelOperations';

// Initialize data on module load
loadFromLocalStorage();

// Export all data store functionality
export {
  // State exports
  channels,
  countries,
  categories,
  isSyncing,
  setIsSyncing,
  
  // Storage operations
  saveChannelsToStorage,
  loadFromLocalStorage,
  
  // Channel operations
  addChannelToMemory,
  removeChannelFromMemory,
  updateChannelInMemory
};
