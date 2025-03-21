
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
import { handleError } from '@/utils/errorHandling';

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
    
    // إضافة معرف طلب فريد لمنع التخزين المؤقت
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // جلب البيانات من Supabase مع إضافة معامل للتخزين المؤقت
    const [channelsData, countriesData, categoriesData] = await Promise.all([
      supabase.from('channels').select('*').order('id', { ascending: true }).throwOnError(),
      supabase.from('countries').select('*').order('id', { ascending: true }).throwOnError(),
      supabase.from('categories').select('*').order('id', { ascending: true }).throwOnError(),
    ]);
    
    // التحقق من وجود أخطاء
    if (channelsData.error) {
      console.error('خطأ في جلب القنوات من Supabase / Error fetching channels from Supabase:', channelsData.error);
      handleError(channelsData.error, 'Supabase Channels Fetch', true);
      return false;
    }
    
    if (countriesData.error) {
      console.error('خطأ في جلب البلدان من Supabase / Error fetching countries from Supabase:', countriesData.error);
      handleError(countriesData.error, 'Supabase Countries Fetch', true);
      return false;
    }
    
    if (categoriesData.error) {
      console.error('خطأ في جلب الفئات من Supabase / Error fetching categories from Supabase:', categoriesData.error);
      handleError(categoriesData.error, 'Supabase Categories Fetch', true);
      return false;
    }
    
    // طباعة حجم البيانات المستلمة للتشخيص
    console.log('تم استلام البيانات من Supabase:', {
      channels: channelsData.data?.length || 0,
      countries: countriesData.data?.length || 0,
      categories: categoriesData.data?.length || 0
    });
    
    // تحديث البيانات في الذاكرة والتخزين المحلي
    await updateLocalStoreWithData(
      channelsData.data || [], 
      countriesData.data || [], 
      categoriesData.data || [],
      channels,
      countries,
      categories
    );
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    
    console.log('تمت المزامنة مع Supabase بنجاح / Successfully synchronized with Supabase');
    
    // إطلاق حدث تحديث البيانات
    triggerDataUpdatedEvent('supabase');
    
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع Supabase / Error synchronizing with Supabase:', error);
    handleError(error, 'Supabase Sync', true);
    return false;
  } finally {
    setIsSyncing(false);
  }
};
