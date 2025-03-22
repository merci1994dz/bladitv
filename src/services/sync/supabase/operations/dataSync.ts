
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
    
    // استخدام مهلة زمنية لضمان عدم تعليق العملية
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('انتهت مهلة المزامنة مع Supabase')), 30000);
    });
    
    // إعداد الطلبات بمهلة زمنية
    const channelsPromise = supabase.from('channels').select('*').order('id', { ascending: true });
    const countriesPromise = supabase.from('countries').select('*').order('id', { ascending: true });
    const categoriesPromise = supabase.from('categories').select('*').order('id', { ascending: true });
    
    // جلب البيانات من Supabase مع مهلة زمنية
    const [channelsResponse, countriesResponse, categoriesResponse] = await Promise.all([
      Promise.race([channelsPromise, timeoutPromise]),
      Promise.race([countriesPromise, timeoutPromise]),
      Promise.race([categoriesPromise, timeoutPromise]),
    ]) as [any, any, any];
    
    // التحقق من وجود أخطاء
    if (channelsResponse === null || channelsResponse.error) {
      const error = channelsResponse?.error || new Error('فشل في جلب القنوات من Supabase');
      console.error('خطأ في جلب القنوات من Supabase / Error fetching channels from Supabase:', error);
      throw error;
    }
    
    if (countriesResponse === null || countriesResponse.error) {
      const error = countriesResponse?.error || new Error('فشل في جلب البلدان من Supabase');
      console.error('خطأ في جلب البلدان من Supabase / Error fetching countries from Supabase:', error);
      throw error;
    }
    
    if (categoriesResponse === null || categoriesResponse.error) {
      const error = categoriesResponse?.error || new Error('فشل في جلب الفئات من Supabase');
      console.error('خطأ في جلب الفئات من Supabase / Error fetching categories from Supabase:', error);
      throw error;
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
  } catch (error: any) {
    // تصنيف الخطأ
    const errorMessage = error?.message || 'خطأ غير معروف';
    
    // معالجة أخطاء الاتصال بشكل خاص
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('connection')) {
      console.error('خطأ في الاتصال بـ Supabase:', errorMessage);
      handleError(error, 'Supabase Sync - Network Error');
    } else if (error?.code === '23505' || errorMessage.includes('duplicate key')) {
      // معالجة أخطاء التكرار في قاعدة البيانات
      console.error('خطأ تكرار المفتاح في قاعدة البيانات:', errorMessage);
      handleError(error, 'Supabase Sync - Duplicate Key');
    } else {
      // الأخطاء الأخرى
      console.error('خطأ في المزامنة مع Supabase / Error synchronizing with Supabase:', error);
      
      // تسجيل التفاصيل إذا كان الخطأ من Supabase
      if (error?.code || error?.details) {
        console.error('تفاصيل خطأ Supabase:', {
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }
      
      handleError(error, 'Supabase Sync - General Error');
    }
    
    return false;
  } finally {
    setIsSyncing(false);
  }
};
