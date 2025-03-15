
import { channels, countries, categories } from '../dataStore';
import { REMOTE_CONFIG, STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';
import { validateRemoteData } from './remoteValidation';
import { updateRemoteConfigLastSync } from './remote';

/**
 * Synchronize with remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    console.log(`مزامنة مع المصدر الخارجي: ${remoteUrl}`);
    setIsSyncing(true);
    
    const cacheParam = `nocache=${Date.now()}`;
    const urlWithCache = remoteUrl.includes('?') 
      ? `${remoteUrl}&${cacheParam}` 
      : `${remoteUrl}?${cacheParam}`;
    
    console.log(`جاري تحميل البيانات من: ${urlWithCache}`);
    const response = await fetch(urlWithCache);
    
    if (!response.ok) {
      throw new Error(`فشل في تحميل البيانات: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // التحقق من صحة البيانات
    if (!validateRemoteData(data)) {
      throw new Error('البيانات المستلمة غير صالحة');
    }
    
    // تحديث البيانات في الذاكرة
    if (Array.isArray(data.channels)) {
      channels.length = 0;
      channels.push(...data.channels);
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(data.channels));
    }
    
    if (Array.isArray(data.countries)) {
      countries.length = 0;
      countries.push(...data.countries);
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(data.countries));
    }
    
    if (Array.isArray(data.categories)) {
      categories.length = 0;
      categories.push(...data.categories);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    }
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    updateRemoteConfigLastSync(remoteUrl);
    
    // وضع علامات إضافية للتحديث
    localStorage.setItem('channels_last_updated', Date.now().toString());
    localStorage.setItem('bladi_info_update', Date.now().toString());
    
    console.log('تمت المزامنة بنجاح مع المصدر الخارجي');
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
