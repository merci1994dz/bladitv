
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
  LAST_SUCCESSFUL_SOURCE: 'tv_last_successful_source',
  REMOTE_CONFIG: 'tv_remote_config',
  ADMIN_PASSWORD: 'tv_admin_password',
  ADMIN_ACCESS_TOKEN: 'tv_admin_access_token',
  ADMIN_LOGIN_ATTEMPTS: 'tv_admin_login_attempts',
  ADMIN_FULL_ACCESS: 'tv_admin_full_access',
  CMS_CONTENT_BLOCKS: 'tv_cms_content_blocks',
  CMS_LAYOUTS: 'tv_cms_layouts',
  CMS_SCHEDULES: 'tv_cms_schedules',
  CMS_SETTINGS: 'tv_cms_settings',
  CMS_USERS: 'tv_cms_users',
  RECENTLY_WATCHED: 'tv_recently_watched'
};

// Remote data configuration
export const REMOTE_CONFIG = {
  ENABLED: true,
  DEFAULT_URL: '/data/fallback-channels.json', // Default to local fallback
  REFRESH_INTERVAL: 60 * 60 * 1000, // 1 hour
  CHECK_INTERVAL: 15 * 60 * 1000  // 15 minutes
};

// App configuration
export const APP_CONFIG = {
  APP_NAME: 'BladiTV',
  VERSION: '1.0.0'
};

// Video player configuration
export const VIDEO_PLAYER = {
  HIDE_STREAM_URLS: true,
  AUTO_PLAY: true,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
  VOLUME_STEP: 0.1
};

// App version for display
export const APP_VERSION = '1.0.0';

// Security configuration
export const SECURITY_CONFIG = {
  DISABLE_RIGHT_CLICK: true,
  DISABLE_DEVELOPER_TOOLS: false,
  DISABLE_INSPECT: true,
  DISABLE_VIDEO_DOWNLOAD: true,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_DURATION: 30 * 60 * 1000,  // 30 minutes
  ADMIN_PROTECTION: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCK_TIME: 30 * 60 * 1000, // 30 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// CMS configuration
export const CMS_CONFIG = {
  MAX_USERS: 10,
  DEFAULT_ROLE: 'editor',
  PERMISSIONS: {
    create: 'create',
    read: 'read',
    update: 'update',
    delete: 'delete',
    publish: 'publish'
  }
};
