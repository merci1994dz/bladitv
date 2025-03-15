
import { STORAGE_KEYS } from '../config';
import { setIsSyncing } from '../dataStore';
import { updateLastSyncTime } from './config';
import { validateRemoteData } from './remoteValidation';
import { updateRemoteConfigLastSync } from './remote';

/**
 * Synchronize with remote source
 */
export const syncWithRemoteSource = async (remoteUrl: string, forceRefresh = false): Promise<boolean> => {
  try {
    setIsSyncing(true);
    console.log('جاري المزامنة مع المصدر الخارجي:', remoteUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout for larger files
    
    try {
      // Add cache-control headers and parameters to prevent caching
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Add random query parameter to bust cache
      const urlWithCacheBuster = remoteUrl.includes('?') 
        ? `${remoteUrl}&_=${Date.now()}&nocache=${Math.random()}`
        : `${remoteUrl}?_=${Date.now()}&nocache=${Math.random()}`;
      
      console.log('إرسال طلب إلى:', urlWithCacheBuster);
      
      const response = await fetch(urlWithCacheBuster, { 
        signal: controller.signal,
        cache: 'no-store', 
        headers,
        method: 'GET',
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('خطأ في الاستجابة:', response.status, errorText);
        throw new Error(`فشل الاتصال بالمصدر الخارجي: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('النص المستلم:', responseText.substring(0, 150) + '...');
      
      let remoteData;
      try {
        remoteData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('خطأ في تحليل JSON:', parseError);
        console.log('النص المستلم غير صالح:', responseText.substring(0, 500));
        throw new Error('البيانات المستلمة ليست بتنسيق JSON صالح');
      }
      
      console.log('تم استلام البيانات:', {
        channels: remoteData.channels?.length || 0,
        countries: remoteData.countries?.length || 0,
        categories: remoteData.categories?.length || 0
      });
      
      // Data validation
      if (!validateRemoteData(remoteData)) {
        throw new Error('تنسيق البيانات من المصدر الخارجي غير صالح');
      }
      
      // Ensure each channel has an ID
      remoteData.channels = remoteData.channels.map((channel: any) => {
        if (!channel.id) {
          channel.id = 'ch_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        }
        return channel;
      });
      
      // For forced refresh, we completely replace the data
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(remoteData.channels));
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(remoteData.countries));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(remoteData.categories));
      
      // Save last updated timestamps for each data type
      localStorage.setItem('channels_updated_at', new Date().toISOString());
      localStorage.setItem('countries_updated_at', new Date().toISOString());
      localStorage.setItem('categories_updated_at', new Date().toISOString());
      
      // Update last sync time
      const lastSyncTime = updateLastSyncTime();
      
      // Update stored config
      updateRemoteConfigLastSync(remoteUrl);
      
      console.log('تم تحديث البيانات بنجاح من المصدر الخارجي');
      
      // إضافة علامة زمنية مميزة لإجبار جميع المستخدمين على رؤية البيانات الجديدة
      localStorage.setItem('force_data_refresh', Date.now().toString());
      
      // Force page reload in cases of significant data changes (for admin actions)
      if (forceRefresh) {
        console.log('سيتم إعادة تحميل الصفحة لتطبيق التغييرات...');
        
        // نؤخر إعادة تحميل الصفحة قليلاً لإتاحة الوقت لعرض رسالة النجاح
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      
      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('انتهت المهلة الزمنية للاتصال بالمصدر الخارجي');
      }
      console.error('خطأ في الاتصال:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('خطأ في تحديث البيانات من المصدر الخارجي:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
