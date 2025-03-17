
// Configuration constants for the application

// Storage keys for localStorage and sessionStorage
export const STORAGE_KEYS = {
  CHANNELS: 'tv_channels',
  COUNTRIES: 'tv_countries',
  CATEGORIES: 'tv_categories',
  FAVORITES: 'tv_favorites',
  SETTINGS: 'tv_settings',
  RECENT: 'tv_recent_channels',
  LAST_SYNC: 'tv_last_sync',
  LAST_SYNC_TIME: 'tv_last_sync_time',
  SYNC_STATUS: 'tv_sync_status',
  LAST_SUCCESSFUL_SOURCE: 'tv_last_successful_source', // New key for tracking last working source
  REMOTE_CONFIG: 'tv_remote_config'
};

// Remote data configuration
export const REMOTE_CONFIG = {
  ENABLED: true,
  DEFAULT_URL: '/data/fallback-channels.json', // Default to local fallback
  REFRESH_INTERVAL: 60 * 60 * 1000 // 1 hour
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'BladiTV',
  VERSION: '1.0.0'
};
