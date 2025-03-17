
import { supabase } from '@/integrations/supabase/client';
import { Channel, Country, Category } from '@/types';
import { STORAGE_KEYS } from '../../config';
import { SupabaseChannel, toChannel } from '../types/channelTypes';

// جلب قائمة القنوات من Supabase
export const getChannelsFromSupabase = async (): Promise<Channel[]> => {
  try {
    console.log('جلب القنوات من Supabase...');
    const { data, error } = await supabase
      .from('channels')
      .select('*');
    
    if (error) {
      console.error('خطأ في جلب القنوات من Supabase:', error);
      throw error;
    }
    
    // Convert Supabase data to our Channel model
    const channels = (data as SupabaseChannel[]).map(toChannel);
    console.log(`تم جلب ${channels.length} قناة من Supabase`);
    
    // حفظ البيانات في التخزين المحلي كنسخة احتياطية
    try {
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    } catch (e) {
      console.warn('لم يتم حفظ البيانات في التخزين المحلي:', e);
    }
    
    return channels;
  } catch (error) {
    console.error('خطأ في جلب القنوات من Supabase:', error);
    
    // محاولة استخدام البيانات المخزنة محليًا كخطة بديلة
    const storedData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (storedData) {
      return JSON.parse(storedData) as Channel[];
    }
    
    return [];
  }
};

// خدمات البلدان والفئات مشابهة
export const getCountriesFromSupabase = async (): Promise<Country[]> => {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*');
    
    if (error) {
      console.error('خطأ في جلب البلدان من Supabase:', error);
      throw error;
    }
    
    return data as Country[];
  } catch (error) {
    console.error('خطأ في جلب البلدان من Supabase:', error);
    
    // محاولة استخدام البيانات المخزنة محليًا كخطة بديلة
    const storedData = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    if (storedData) {
      return JSON.parse(storedData) as Country[];
    }
    
    return [];
  }
};

export const getCategoriesFromSupabase = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('خطأ في جلب الفئات من Supabase:', error);
      throw error;
    }
    
    return data as Category[];
  } catch (error) {
    console.error('خطأ في جلب الفئات من Supabase:', error);
    
    // محاولة استخدام البيانات المخزنة محليًا كخطة بديلة
    const storedData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (storedData) {
      return JSON.parse(storedData) as Category[];
    }
    
    return [];
  }
};
