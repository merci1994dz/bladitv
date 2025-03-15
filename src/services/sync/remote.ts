
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
