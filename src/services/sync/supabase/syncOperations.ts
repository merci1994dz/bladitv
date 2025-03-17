
import { supabase } from '@/integrations/supabase/client';
import { channels, countries, categories, setIsSyncing } from '../../dataStore';
import { STORAGE_KEYS } from '../../config';
import { updateLastSyncTime } from '../config';
import { SupabaseChannel, toChannel } from '../../supabase/types/channelTypes';

/**
 * مزامنة البيانات من Supabase
 * 
 * @param forceRefresh ما إذا كان يجب تجاهل التخزين المؤقت وإجبار التحديث
 * @returns وعد يحل إلى قيمة boolean تشير إلى نجاح المزامنة
 */
export const syncWithSupabase = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('بدء المزامنة مع Supabase...');
    setIsSyncing(true);
    
    // جلب البيانات من Supabase مع إضافة معامل للتخزين المؤقت
    const cacheBuster = `?_=${Date.now()}`;
    
    const [channelsData, countriesData, categoriesData] = await Promise.all([
      supabase.from('channels').select('*'),
      supabase.from('countries').select('*'),
      supabase.from('categories').select('*'),
    ]);
    
    if (channelsData.error) {
      console.error('خطأ في جلب القنوات من Supabase:', channelsData.error);
      throw channelsData.error;
    }
    
    if (countriesData.error) {
      console.error('خطأ في جلب البلدان من Supabase:', countriesData.error);
      throw countriesData.error;
    }
    
    if (categoriesData.error) {
      console.error('خطأ في جلب الفئات من Supabase:', categoriesData.error);
      throw categoriesData.error;
    }
    
    // تحديث البيانات في الذاكرة والتخزين المحلي
    await updateLocalStoreWithData(channelsData.data, countriesData.data, categoriesData.data);
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    
    console.log('تمت المزامنة مع Supabase بنجاح');
    
    // إطلاق حدث تحديث البيانات
    triggerDataUpdatedEvent('supabase');
    
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع Supabase:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

/**
 * تحديث مخازن البيانات المحلية بالبيانات المستلمة من Supabase
 */
const updateLocalStoreWithData = async (
  channelsData: any[] | null,
  countriesData: any[] | null,
  categoriesData: any[] | null
): Promise<void> => {
  // تحديث القنوات
  if (channelsData && channelsData.length > 0) {
    console.log(`تم استلام ${channelsData.length} قناة من Supabase`);
    channels.length = 0;
    channels.push(...(channelsData as SupabaseChannel[]).map(toChannel));
    
    try {
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    } catch (e) {
      console.warn('لم يتم حفظ القنوات في التخزين المحلي:', e);
    }
  } else {
    console.warn('لم يتم استلام أي قنوات من Supabase');
  }
  
  // تحديث البلدان
  if (countriesData && countriesData.length > 0) {
    console.log(`تم استلام ${countriesData.length} بلد من Supabase`);
    countries.length = 0;
    countries.push(...countriesData);
    
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countriesData));
    } catch (e) {
      console.warn('لم يتم حفظ البلدان في التخزين المحلي:', e);
    }
  } else {
    console.warn('لم يتم استلام أي بلدان من Supabase');
  }
  
  // تحديث الفئات
  if (categoriesData && categoriesData.length > 0) {
    console.log(`تم استلام ${categoriesData.length} فئة من Supabase`);
    categories.length = 0;
    categories.push(...categoriesData);
    
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesData));
    } catch (e) {
      console.warn('لم يتم حفظ الفئات في التخزين المحلي:', e);
    }
  } else {
    console.warn('لم يتم استلام أي فئات من Supabase');
  }
};

/**
 * إطلاق حدث تحديث البيانات
 */
const triggerDataUpdatedEvent = (source: string): void => {
  try {
    const event = new CustomEvent('data_updated', {
      detail: { source, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (eventError) {
    console.error('خطأ في إطلاق حدث التحديث:', eventError);
  }
};
