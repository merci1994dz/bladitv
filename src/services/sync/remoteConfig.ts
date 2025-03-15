
import { STORAGE_KEYS } from '../config';

/**
 * Configuration interface for remote data
 */
export interface RemoteConfig {
  url: string;
  lastSync: string;
}

/**
 * Get the current remote configuration
 */
export const getRemoteConfig = (): RemoteConfig | null => {
  try {
    const remoteConfigStr = localStorage.getItem(STORAGE_KEYS.REMOTE_CONFIG);
    if (remoteConfigStr) {
      return JSON.parse(remoteConfigStr);
    }
    return null;
  } catch (error) {
    console.error('خطأ في قراءة تكوين المصدر الخارجي:', error);
    return null;
  }
};

/**
 * Save remote configuration
 */
export const setRemoteConfig = (url: string): void => {
  const remoteConfig = {
    url,
    lastSync: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.REMOTE_CONFIG, JSON.stringify(remoteConfig));
};
