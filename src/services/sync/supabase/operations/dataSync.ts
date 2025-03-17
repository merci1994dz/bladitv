
/**
 * عمليات مزامنة البيانات مع Supabase
 * Data synchronization operations with Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { channels, countries, categories, setIsSyncing } from '../../../dataStore';
import { updateLastSyncTime } from '../../config';
import { updateLocalStoreWithData } from '../helpers/storageHelpers';
import { triggerDataUpdatedEvent } from '../helpers/eventHelpers';
import { SyncResult } from '../types/syncTypes';

/**
 * مزامنة البيانات من Supabase
 * Synchronize data from Supabase
 * 
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث / Whether to ignore cache and force a refresh
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المزامنة / Promise resolving to boolean indicating sync success
 */
export const syncWithSupabase = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('بدء المزامنة مع Supabase... / Starting synchronization with Supabase...');
    setIsSyncing(true);
    
    // جلب البيانات من Supabase مع إضافة معامل للتخزين المؤقت
    // Fetch data from Supabase with a cache buster parameter
    const cacheBuster = `?_=${Date.now()}`;
    
    const [channelsData, countriesData, categoriesData] = await Promise.all([
      supabase.from('channels').select('*'),
      supabase.from('countries').select('*'),
      supabase.from('categories').select('*'),
    ]);
    
    if (channelsData.error) {
      console.error('خطأ في جلب القنوات من Supabase / Error fetching channels from Supabase:', channelsData.error);
      throw channelsData.error;
    }
    
    if (countriesData.error) {
      console.error('خطأ في جلب البلدان من Supabase / Error fetching countries from Supabase:', countriesData.error);
      throw countriesData.error;
    }
    
    if (categoriesData.error) {
      console.error('خطأ في جلب الفئات من Supabase / Error fetching categories from Supabase:', categoriesData.error);
      throw categoriesData.error;
    }
    
    // تحديث البيانات في الذاكرة والتخزين المحلي
    // Update data in memory and local storage
    await updateLocalStoreWithData(
      channelsData.data, 
      countriesData.data, 
      categoriesData.data,
      channels,
      countries,
      categories
    );
    
    // تحديث وقت آخر مزامنة
    // Update last sync time
    updateLastSyncTime();
    
    console.log('تمت المزامنة مع Supabase بنجاح / Successfully synchronized with Supabase');
    
    // إطلاق حدث تحديث البيانات
    // Trigger data updated event
    triggerDataUpdatedEvent('supabase');
    
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع Supabase / Error synchronizing with Supabase:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
