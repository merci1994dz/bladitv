
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
      
      // تسجيل أعداد البيانات
      let addedCount = 0;
      let updatedCount = 0;
      let ignoredCount = 0;
      
      // إنشاء مجموعة للاسماء وروابط البث الموجودة بالفعل
      const existingNames = new Set(channels.map(ch => ch.name.toLowerCase()));
      const existingUrls = new Set(channels.map(ch => ch.streamUrl));
      const existingIds = new Set(channels.map(ch => ch.id));
      
      if (options?.preventDuplicates !== false) { // تحسين المنطق - منع التكرار افتراضيًا
        // إضافة القنوات مع منع التكرار
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
          
          // التحقق من وجود القناة بالمعرف أولاً ثم بالاسم أو رابط البث
          const isDuplicate = existingIds.has(channel.id) || 
                             existingNames.has(channel.name.toLowerCase()) || 
                             existingUrls.has(channel.streamUrl);
          
          if (isDuplicate) {
            // تجاهل القناة المكررة أو تحديثها إذا كانت موجودة بالفعل
            const existingChannel = channels.find(ch => 
              ch.id === channel.id ||
              ch.name.toLowerCase() === channel.name.toLowerCase() || 
              ch.streamUrl === channel.streamUrl
            );
            
            if (existingChannel) {
              // تحديث القناة الموجودة فقط إذا كانت هناك تغييرات جوهرية
              if (existingChannel.logo !== channel.logo || 
                  existingChannel.category !== channel.category ||
                  existingChannel.country !== channel.country ||
                  existingChannel.streamUrl !== channel.streamUrl) {
                updateChannelInMemory({
                  ...existingChannel,
                  logo: channel.logo,
                  category: channel.category,
                  country: channel.country,
                  streamUrl: channel.streamUrl
                });
                updatedCount++;
              } else {
                ignoredCount++;
              }
            } else {
              ignoredCount++;
            }
          } else {
            // إضافة القناة الجديدة فقط
            addChannelToMemory(channel);
            addedCount++;
            
            // تحديث المجموعات للاستخدام في التحقق اللاحق
            existingIds.add(channel.id);
            existingNames.add(channel.name.toLowerCase());
            existingUrls.add(channel.streamUrl);
          }
        }
        
        console.log(`تم إضافة ${addedCount} قناة، تحديث ${updatedCount} قناة، وتجاهل ${ignoredCount} قناة متكررة`);
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
      
      // منع التكرار للدول
      if (options?.preventDuplicates !== false) {
        // إنشاء مجموعة للمعرفات الموجودة بالفعل
        const existingIds = new Set(countries.map(c => c.id));
        const existingNames = new Set(countries.map(c => c.name.toLowerCase()));
        
        // فلترة الدول الجديدة فقط
        const newCountries = data.countries.filter((country: any) => 
          !existingIds.has(country.id) && 
          !existingNames.has(country.name.toLowerCase())
        );
        
        // إضافة الدول الجديدة فقط
        countries.push(...newCountries);
        console.log(`تم إضافة ${newCountries.length} دولة جديدة وتجاهل ${data.countries.length - newCountries.length} دولة مكررة`);
      } else {
        // مسح الدول الحالية وإضافة الدول الجديدة
        countries.length = 0;
        countries.push(...data.countries);
        console.log(`تم استبدال جميع الدول بـ ${countries.length} دولة`);
      }
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
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
      
      // منع التكرار للفئات
      if (options?.preventDuplicates !== false) {
        // إنشاء مجموعة للمعرفات الموجودة بالفعل
        const existingIds = new Set(categories.map(c => c.id));
        const existingNames = new Set(categories.map(c => c.name.toLowerCase()));
        
        // فلترة الفئات الجديدة فقط
        const newCategories = data.categories.filter((category: any) => 
          !existingIds.has(category.id) && 
          !existingNames.has(category.name.toLowerCase())
        );
        
        // إضافة الفئات الجديدة فقط
        categories.push(...newCategories);
        console.log(`تم إضافة ${newCategories.length} فئة جديدة وتجاهل ${data.categories.length - newCategories.length} فئة مكررة`);
      } else {
        // مسح الفئات الحالية وإضافة الفئات الجديدة
        categories.length = 0;
        categories.push(...data.categories);
        console.log(`تم استبدال جميع الفئات بـ ${categories.length} فئة`);
      }
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
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
