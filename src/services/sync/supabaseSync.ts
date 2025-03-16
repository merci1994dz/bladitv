
import { supabase } from '@/integrations/supabase/client';
import { Channel, Country, Category } from '@/types';
import { channels, countries, categories, setIsSyncing } from '../dataStore';
import { STORAGE_KEYS } from '../config';
import { updateLastSyncTime } from './config';
import { Json } from '@/integrations/supabase/types';

// Types to map Supabase schema to our app models
interface SupabaseChannel {
  category: string;
  country: string;
  externallinks: any;
  id: string;
  isfavorite: boolean | null;
  lastwatched: string | null;
  logo: string;
  name: string;
  streamurl: string;
}

// Converter functions
const toChannel = (sc: SupabaseChannel): Channel => ({
  id: sc.id,
  name: sc.name,
  logo: sc.logo,
  streamUrl: sc.streamurl,
  category: sc.category,
  country: sc.country,
  isFavorite: sc.isfavorite || false,
  lastWatched: sc.lastwatched,
  externalLinks: sc.externallinks || []
});

// مزامنة البيانات من Supabase
export const syncWithSupabase = async (forceRefresh = false): Promise<boolean> => {
  try {
    console.log('بدء المزامنة مع Supabase...');
    setIsSyncing(true);
    
    // جلب البيانات من Supabase
    const [channelsData, countriesData, categoriesData] = await Promise.all([
      supabase.from('channels').select('*'),
      supabase.from('countries').select('*'),
      supabase.from('categories').select('*'),
    ]);
    
    if (channelsData.error || countriesData.error || categoriesData.error) {
      throw new Error('خطأ في جلب البيانات من Supabase');
    }
    
    // تحديث البيانات في الذاكرة
    if (channelsData.data && channelsData.data.length > 0) {
      channels.length = 0;
      channels.push(...(channelsData.data as SupabaseChannel[]).map(toChannel));
      
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      } catch (e) {
        console.warn('لم يتم حفظ القنوات في التخزين المحلي:', e);
      }
    }
    
    if (countriesData.data && countriesData.data.length > 0) {
      countries.length = 0;
      countries.push(...countriesData.data as Country[]);
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countriesData.data));
      } catch (e) {
        console.warn('لم يتم حفظ البلدان في التخزين المحلي:', e);
      }
    }
    
    if (categoriesData.data && categoriesData.data.length > 0) {
      categories.length = 0;
      categories.push(...categoriesData.data as Category[]);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesData.data));
      } catch (e) {
        console.warn('لم يتم حفظ الفئات في التخزين المحلي:', e);
      }
    }
    
    // تحديث وقت آخر مزامنة
    updateLastSyncTime();
    
    console.log('تمت المزامنة مع Supabase بنجاح');
    
    // إطلاق حدث تحديث البيانات
    try {
      const event = new CustomEvent('data_updated', {
        detail: { source: 'supabase', timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    } catch (eventError) {
      console.error('خطأ في إطلاق حدث التحديث:', eventError);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في المزامنة مع Supabase:', error);
    return false;
  } finally {
    setIsSyncing(false);
  }
};

// إنشاء الجداول في Supabase (للمرة الأولى)
export const initializeSupabaseTables = async (): Promise<boolean> => {
  try {
    // تحقق مما إذا كانت الجداول موجودة بالفعل
    const { data: channelsData, error: channelsError } = await supabase
      .from('channels')
      .select('count', { count: 'exact', head: true });
    
    if (channelsError) {
      // ربما الجداول غير موجودة بعد
      console.log('جداول Supabase ربما غير موجودة، جاري التهيئة...');
      
      // نحن لا نقوم بإنشاء الجداول هنا لأن هذا يتطلب صلاحيات SQL
      // يجب على المستخدم إنشاء الجداول من خلال واجهة Supabase
      
      return false;
    }
    
    // تحميل البيانات المخزنة محليًا إلى Supabase إذا كانت الجداول فارغة
    // Access count correctly based on Supabase's return type
    const countValue = typeof channelsData === 'object' && channelsData !== null ? (channelsData as any).count : 0;
    if (countValue === 0) {
      const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
      const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      
      if (storedChannels) {
        await supabase.from('channels').insert(JSON.parse(storedChannels));
      }
      
      if (storedCountries) {
        await supabase.from('countries').insert(JSON.parse(storedCountries));
      }
      
      if (storedCategories) {
        await supabase.from('categories').insert(JSON.parse(storedCategories));
      }
      
      console.log('تم تحميل البيانات المحلية إلى Supabase بنجاح');
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة جداول Supabase:', error);
    return false;
  }
};

// الاشتراك للتحديثات في الوقت الحقيقي
export const setupRealtimeSync = () => {
  const channelsSubscription = supabase
    .channel('schema-db-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'channels' }, 
      async (payload) => {
        console.log('تم تلقي تحديث للقنوات في الوقت الحقيقي:', payload);
        await syncWithSupabase(true);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channelsSubscription);
  };
};
