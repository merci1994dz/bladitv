
/**
 * مساعدات لتحديث التخزين المحلي
 * Helpers for updating local storage
 */

import { STORAGE_KEYS } from '../../../config';
import { Channel, Country, Category } from '@/types';
import { SupabaseChannel, toChannel } from '../../supabase/types/channelTypes';

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
  // تحديث القنوات
  // Update channels
  if (channelsData && channelsData.length > 0) {
    console.log(`تم استلام ${channelsData.length} قناة من Supabase / Received ${channelsData.length} channels from Supabase`);
    channels.length = 0;
    channels.push(...(channelsData as SupabaseChannel[]).map(toChannel));
    
    try {
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    } catch (e) {
      console.warn('لم يتم حفظ القنوات في التخزين المحلي / Failed to save channels to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي قنوات من Supabase / No channels received from Supabase');
  }
  
  // تحديث البلدان
  // Update countries
  if (countriesData && countriesData.length > 0) {
    console.log(`تم استلام ${countriesData.length} بلد من Supabase / Received ${countriesData.length} countries from Supabase`);
    countries.length = 0;
    countries.push(...countriesData);
    
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countriesData));
    } catch (e) {
      console.warn('لم يتم حفظ البلدان في التخزين المحلي / Failed to save countries to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي بلدان من Supabase / No countries received from Supabase');
  }
  
  // تحديث الفئات
  // Update categories
  if (categoriesData && categoriesData.length > 0) {
    console.log(`تم استلام ${categoriesData.length} فئة من Supabase / Received ${categoriesData.length} categories from Supabase`);
    categories.length = 0;
    categories.push(...categoriesData);
    
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesData));
    } catch (e) {
      console.warn('لم يتم حفظ الفئات في التخزين المحلي / Failed to save categories to local storage:', e);
    }
  } else {
    console.warn('لم يتم استلام أي فئات من Supabase / No categories received from Supabase');
  }
};
