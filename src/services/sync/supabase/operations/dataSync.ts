
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
    const cacheOptions = forceRefresh ? { cache: 'no-cache' } : undefined;
    
    // جلب البيانات من Supabase مع إضافة معامل للتخزين المؤقت
    const [channelsResponse, countriesResponse, categoriesResponse] = await Promise.all([
      supabase.from('channels').select('*').order('id', { ascending: true }),
      supabase.from('countries').select('*').order('id', { ascending: true }),
      supabase.from('categories').select('*').order('id', { ascending: true }),
    ]);
    
    // التحقق من وجود أخطاء
    if (channelsResponse.error) {
      console.error('خطأ في جلب القنوات من Supabase / Error fetching channels from Supabase:', channelsResponse.error);
      handleError(channelsResponse.error, 'Supabase Channels Fetch', true);
      return false;
    }
    
    if (countriesResponse.error) {
      console.error('خطأ في جلب البلدان من Supabase / Error fetching countries from Supabase:', countriesResponse.error);
      handleError(countriesResponse.error, 'Supabase Countries Fetch', true);
      return false;
    }
    
    if (categoriesResponse.error) {
      console.error('خطأ في جلب الفئات من Supabase / Error fetching categories from Supabase:', categoriesResponse.error);
      handleError(categoriesResponse.error, 'Supabase Categories Fetch', true);
      return false;
    }
    
    const channelsData = channelsResponse.data || [];
    const countriesData = countriesResponse.data || [];
    const categoriesData = categoriesResponse.data || [];
    
    // طباعة حجم البيانات المستلمة للتشخيص
    console.log('تم استلام البيانات من Supabase:', {
      channels: channelsData.length,
      countries: countriesData.length,
      categories: categoriesData.length
    });
    
    // التحقق من وجود بيانات
    if (channelsData.length === 0 && countriesData.length === 0 && categoriesData.length === 0) {
      console.warn('لم يتم استلام أي بيانات من Supabase');
      return false;
    }
    
    // تحديث البيانات في الذاكرة والتخزين المحلي
    await updateLocalStoreWithData(
      channelsData, 
      countriesData, 
      categoriesData,
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
