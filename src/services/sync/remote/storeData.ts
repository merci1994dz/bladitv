
/**
 * Functions for storing and updating remote data in memory and localStorage
 */

import { channels, countries, categories } from '../../dataStore';
import { addChannelToMemory, updateChannelInMemory } from '../../dataStore/channelOperations';
import { STORAGE_KEYS } from '../../config';
import { updateLastSyncTime } from '../config';
import { updateRemoteConfigLastSync } from '../remote';
import { Channel } from '@/types';

/**
 * Processes and stores the data from remote sources
 * @returns true if successful, false otherwise
 */
export const storeRemoteData = async (
  data: any, 
  remoteUrl?: string, 
  options?: { preventDuplicates?: boolean }
): Promise<boolean> => {
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
      
      if (options?.preventDuplicates) {
        // إضافة القنوات مع منع التكرار
        let addedCount = 0;
        let ignoredCount = 0;
        
        for (const channelData of data.channels) {
          // إنشاء كائن القناة بالتنسيق المناسب
          const channel: Channel = {
            id: channelData.id || `channel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: channelData.name,
            logo: channelData.logo,
            streamUrl: channelData.stream_url || channelData.streamUrl,
            category: channelData.category,
            country: channelData.country,
            isFavorite: channelData.is_favorite || channelData.isFavorite || false,
            externalLinks: channelData.external_links || channelData.externalLinks || []
          };
          
          // محاولة إضافة القناة مع منع التكرار
          const result = addChannelToMemory(channel, { preventDuplicates: true });
          
          if (result) {
            addedCount++;
          } else {
            ignoredCount++;
          }
        }
        
        console.log(`تم إضافة ${addedCount} قناة وتجاهل ${ignoredCount} قناة متكررة`);
      } else {
        // مسح القنوات الحالية وإضافة القنوات الجديدة
        channels.length = 0;
        channels.push(...data.channels.map((ch: any) => ({
          id: ch.id || `channel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: ch.name,
          logo: ch.logo,
          streamUrl: ch.stream_url || ch.streamUrl,
          category: ch.category,
          country: ch.country,
          isFavorite: ch.is_favorite || ch.isFavorite || false,
          externalLinks: ch.external_links || ch.externalLinks || []
        })));
        
        console.log(`تم استبدال ${channels.length} قناة`);
      }
      
      // حفظ في مخزن محلي
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
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
