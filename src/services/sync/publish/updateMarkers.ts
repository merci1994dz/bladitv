
// Utility to add update markers to localStorage
export const addUpdateMarkers = (timestamp: string): void => {
  // Multiple update keys to ensure detection
  const updateKeys = [
    'data_version',
    'bladi_info_update',
    'channels_last_update',
    'force_update',
    'bladi_update_version',
    'bladi_update_channels',
    'bladi_force_refresh',
    'force_browser_refresh',
    'channels_updated_at',
    'channels_version',
    'force_reload_all'
  ];
  
  // Apply all markers
  updateKeys.forEach(key => {
    if (key.includes('force') || key.includes('refresh') || key.includes('reload')) {
      localStorage.setItem(key, 'true');
    } else {
      localStorage.setItem(key, timestamp);
    }
  });
};

// Add more specialized markers for different update types
export const addChannelUpdateMarkers = (timestamp: string, channelId?: string): void => {
  localStorage.setItem('channels_last_update', timestamp);
  localStorage.setItem('bladi_info_update', timestamp);
  localStorage.setItem('data_version', timestamp);
  
  if (channelId) {
    localStorage.setItem('updated_channel_id', channelId);
  }
};

export const addForceRefreshMarkers = (): void => {
  const timestamp = Date.now().toString();
  
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('bladi_force_refresh', 'true');
  localStorage.setItem('force_reload_all', 'true');
  localStorage.setItem('refresh_timestamp', timestamp);
};
