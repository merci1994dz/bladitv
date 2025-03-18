
/**
 * مساعدات لتحديث التخزين المحلي
 * Helpers for updating local storage
 */

import { STORAGE_KEYS } from '../../../config';
import { Channel, Country, Category } from '@/types';
import { SupabaseChannel, toChannel } from '@/services/supabase/types/channelTypes';

/**
 * تحديث مخازن البيانات المحلية بالبيانات المستلمة من Supabase
 * Update local data stores with data received from Supabase
 */
export const updateLocalStoreWithData = async (
  channelsData: any[] | null,
  countriesData: any[] | null,
  categoriesData: any[] | null,
  channels: Channel[],
  countries: Country[],
  categories: Category[]
): Promise<void> => {
  // تفريغ البيانات القديمة تمامًا واستبدالها بالبيانات الجديدة من Supabase
  // Completely clear old data and replace with new data from Supabase
  
  // تحديث القنوات - استبدال كامل
  if (channelsData && channelsData.length > 0) {
    console.log(`تم استلام ${channelsData.length} قناة من Supabase / Received ${channelsData.length} channels from Supabase`);
    
    // تحويل البيانات إلى قنوات
    const newChannels = (channelsData as SupabaseChannel[]).map(toChannel);
    
    // حذف جميع القنوات الموجودة واستبدالها بالجديدة
    channels.length = 0;
    channels.push(...newChannels);
    
    try {
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      console.log(`تم تحديث ${channels.length} قناة في التخزين المحلي`);
    } catch (e) {
      console.warn('لم يتم حفظ القنوات في التخزين المحلي / Failed to save channels to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي قنوات من Supabase / No channels received from Supabase');
  }
  
  // تحديث البلدان - استبدال كامل
  if (countriesData && countriesData.length > 0) {
    console.log(`تم استلام ${countriesData.length} بلد من Supabase / Received ${countriesData.length} countries from Supabase`);
    
    // حذف جميع البلدان الموجودة واستبدالها بالجديدة
    countries.length = 0;
    countries.push(...(countriesData as Country[]));
    
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
      console.log(`تم تحديث ${countries.length} بلد في التخزين المحلي`);
    } catch (e) {
      console.warn('لم يتم حفظ البلدان في التخزين المحلي / Failed to save countries to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي بلدان من Supabase / No countries received from Supabase');
  }
  
  // تحديث الفئات - استبدال كامل
  if (categoriesData && categoriesData.length > 0) {
    console.log(`تم استلام ${categoriesData.length} فئة من Supabase / Received ${categoriesData.length} categories from Supabase`);
    
    // حذف جميع الفئات الموجودة واستبدالها بالجديدة
    categories.length = 0;
    categories.push(...(categoriesData as Category[]));
    
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      console.log(`تم تحديث ${categories.length} فئة في التخزين المحلي`);
    } catch (e) {
      console.warn('لم يتم حفظ الفئات في التخزين المحلي / Failed to save categories to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي فئات من Supabase / No categories received from Supabase');
  }
};
