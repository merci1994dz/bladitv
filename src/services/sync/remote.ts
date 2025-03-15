import { getRemoteConfig, setRemoteConfig, RemoteConfig } from './remoteConfig';
import { syncWithRemoteSource } from './remoteSync';
import { validateRemoteData } from './remoteValidation';

// Re-export all the remote sync functionality
export { 
  getRemoteConfig,
  setRemoteConfig,
  syncWithRemoteSource,
  validateRemoteData,
  type RemoteConfig
};

// إضافة دالة تحديث وقت آخر مزامنة للتكوين البعيد
export const updateRemoteConfigLastSync = (remoteUrl: string): void => {
  try {
    const remoteConfigStr = localStorage.getItem('tv_remote_config');
    if (remoteConfigStr) {
      const remoteConfig = JSON.parse(remoteConfigStr);
      if (remoteConfig && remoteConfig.url === remoteUrl) {
        remoteConfig.lastSync = new Date().toISOString();
        localStorage.setItem('tv_remote_config', JSON.stringify(remoteConfig));
      }
    }
  } catch (error) {
    console.error('خطأ في تحديث وقت آخر مزامنة للتكوين البعيد:', error);
  }
};
