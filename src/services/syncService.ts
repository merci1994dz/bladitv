
import { API_BASE_URL, STORAGE_KEYS } from './config';
import { channels, countries, categories, isSyncing } from './dataStore';

// Function to fetch data from the remote API
export const syncWithRemoteAPI = async (): Promise<boolean> => {
  if (isSyncing) return false;
  
  try {
    isSyncing = true;
    console.log('Syncing with remote API...');
    
    // Fetch channels, countries, and categories from your website API
    const [channelsRes, countriesRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/channels`).then(res => res.json()),
      fetch(`${API_BASE_URL}/countries`).then(res => res.json()),
      fetch(`${API_BASE_URL}/categories`).then(res => res.json())
    ]);
    
    // Update local data
    Object.assign(channels, channelsRes);
    Object.assign(countries, countriesRes);
    Object.assign(categories, categoriesRes);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    console.log('Sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with remote API:', error);
    return false;
  } finally {
    isSyncing = false;
  }
};

// Try to sync with remote API on application start
syncWithRemoteAPI().catch(error => {
  console.error('Initial sync failed:', error);
});

// Periodic sync (every 1 hour)
setInterval(() => {
  syncWithRemoteAPI().catch(error => {
    console.error('Periodic sync failed:', error);
  });
}, 60 * 60 * 1000);

// Function to manually trigger sync with remote
export const forceSync = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};
