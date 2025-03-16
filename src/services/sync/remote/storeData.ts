
/**
 * Functions for storing and updating remote data in memory and localStorage
 */

import { channels, countries, categories } from '../../dataStore';
import { STORAGE_KEYS } from '../../config';
import { updateLastSyncTime } from '../config';
import { updateRemoteConfigLastSync } from '../remote';

/**
 * Processes and stores the data from remote sources
 * @returns true if successful, false otherwise
 */
export const storeRemoteData = async (data: any, remoteUrl?: string): Promise<boolean> => {
  // حفظ نسخة احتياطية من البيانات الحالية قبل تحديثها
  const backupData = {
    channels: [...channels],
    countries: [...countries],
    categories: [...categories]
  };
  
  try {
    // تحديث البيانات في الذاكرة
    if (Array.isArray(data.channels)) {
      console.log(`تم استلام ${data.channels.length} قناة من المصدر الخارجي`);
      
      // مسح القنوات الحالية وإضافة القنوات الجديدة
      channels.length = 0;
      channels.push(...data.channels);
      
      // حفظ في مخزن محلي
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(data.channels));
        console.log(`تم تحديث ${channels.length} قناة بنجاح`);
      } catch (storageError) {
        console.error('خطأ في تخزين القنوات محليًا:', storageError);
        
        // استرجاع البيانات الاحتياطية في حالة الفشل
        channels.length = 0;
        channels.push(...backupData.channels);
        throw storageError;
      }
    }
    
    if (Array.isArray(data.countries)) {
      console.log(`تم استلام ${data.countries.length} دولة من المصدر الخارجي`);
      
      // مسح الدول الحالية وإضافة الدول الجديدة
      countries.length = 0;
      countries.push(...data.countries);
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(data.countries));
        console.log(`تم تحديث ${countries.length} دولة بنجاح`);
      } catch (storageError) {
        console.error('خطأ في تخزين الدول محليًا:', storageError);
        
        // استرجاع البيانات الاحتياطية في حالة الفشل
        countries.length = 0;
        countries.push(...backupData.countries);
        throw storageError;
      }
    }
    
    if (Array.isArray(data.categories)) {
      console.log(`تم استلام ${data.categories.length} فئة من المصدر الخارجي`);
      
      // مسح الفئات الحالية وإضافة الفئات الجديدة
      categories.length = 0;
      categories.push(...data.categories);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
        console.log(`تم تحديث ${categories.length} فئة بنجاح`);
      } catch (storageError) {
        console.error('خطأ في تخزين الفئات محليًا:', storageError);
        
        // استرجاع البيانات الاحتياطية في حالة الفشل
        categories.length = 0;
        categories.push(...backupData.categories);
        throw storageError;
      }
    }
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    if (remoteUrl) {
      updateRemoteConfigLastSync(remoteUrl);
    }
    
    // وضع علامات إضافية للتحديث
    const timestamp = Date.now().toString();
    try {
      localStorage.setItem('channels_last_updated', timestamp);
      localStorage.setItem('bladi_info_update', timestamp);
      localStorage.setItem('force_refresh', 'true');
      localStorage.setItem('nocache_version', timestamp);
    } catch (e) {
      console.error('خطأ في تخزين بيانات الطابع الزمني:', e);
    }
    
    console.log('تمت المزامنة بنجاح مع المصدر الخارجي');
    
    // إطلاق حدث تحديث البيانات
    try {
      const event = new CustomEvent('data_updated', {
        detail: { source: 'remote', timestamp }
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('خطأ في إطلاق حدث التحديث:', eventError);
    }
    
    return true;
  } catch (updateError) {
    console.error('خطأ في تحديث البيانات:', updateError);
    
    // استعادة البيانات الاحتياطية في حالة الفشل
    channels.length = 0;
    countries.length = 0;
    categories.length = 0;
    
    channels.push(...backupData.channels);
    countries.push(...backupData.countries);
    categories.push(...backupData.categories);
    
    throw updateError;
  }
};
