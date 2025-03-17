
import { supabase } from '@/integrations/supabase/client';
import { Channel, Country, Category } from '@/types';
import { channels, countries, categories, setIsSyncing } from '../dataStore';
import { STORAGE_KEYS } from '../config';
import { updateLastSyncTime } from './config';
import { SupabaseChannel, toChannel, toSupabaseChannel } from '../supabase/types/channelTypes';

// مزامنة البيانات من Supabase
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
    
    // تحديث البيانات في الذاكرة
    if (channelsData.data && channelsData.data.length > 0) {
      console.log(`تم استلام ${channelsData.data.length} قناة من Supabase`);
      channels.length = 0;
      channels.push(...(channelsData.data as SupabaseChannel[]).map(toChannel));
      
      try {
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      } catch (e) {
        console.warn('لم يتم حفظ القنوات في التخزين المحلي:', e);
      }
    } else {
      console.warn('لم يتم استلام أي قنوات من Supabase');
    }
    
    if (countriesData.data && countriesData.data.length > 0) {
      console.log(`تم استلام ${countriesData.data.length} بلد من Supabase`);
      countries.length = 0;
      countries.push(...countriesData.data as Country[]);
      
      try {
        localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countriesData.data));
      } catch (e) {
        console.warn('لم يتم حفظ البلدان في التخزين المحلي:', e);
      }
    } else {
      console.warn('لم يتم استلام أي بلدان من Supabase');
    }
    
    if (categoriesData.data && categoriesData.data.length > 0) {
      console.log(`تم استلام ${categoriesData.data.length} فئة من Supabase`);
      categories.length = 0;
      categories.push(...categoriesData.data as Category[]);
      
      try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesData.data));
      } catch (e) {
        console.warn('لم يتم حفظ الفئات في التخزين المحلي:', e);
      }
    } else {
      console.warn('لم يتم استلام أي فئات من Supabase');
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
      console.error('خطأ في التحقق من وجود جداول Supabase:', channelsError);
      // ربما الجداول غير موجودة بعد
      console.log('جداول Supabase ربما غير موجودة، جاري التهيئة...');
      return false;
    }
    
    // تحميل البيانات المخزنة محليًا إلى Supabase إذا كانت الجداول فارغة
    const countValue = typeof channelsData === 'object' && channelsData !== null ? (channelsData as any).count : 0;
    if (countValue === 0) {
      console.log('جداول Supabase فارغة، جاري تحميل البيانات المحلية...');
      
      const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
      const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
      const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      
      if (storedChannels) {
        const parsedChannels = JSON.parse(storedChannels);
        if (Array.isArray(parsedChannels) && parsedChannels.length > 0) {
          // تحويل البيانات إلى صيغة Supabase
          const supabaseChannels = parsedChannels.map(ch => {
            // التأكد من أن المعرف بتنسيق UUID صالح
            const channelId = ch.id.includes('-') ? ch.id : crypto.randomUUID();
            
            return {
              id: channelId,
              name: ch.name,
              logo: ch.logo,
              streamurl: ch.streamUrl,
              category: ch.category,
              country: ch.country,
              isfavorite: ch.isFavorite, // استخدام الاسم بالحروف الصغيرة
              lastwatched: ch.lastWatched, // استخدام الاسم بالحروف الصغيرة
              externallinks: ch.externalLinks || []
            };
          });
          
          const { error } = await supabase.from('channels').insert(supabaseChannels);
          if (error) {
            console.error('خطأ في تحميل القنوات إلى Supabase:', error);
          } else {
            console.log(`تم تحميل ${supabaseChannels.length} قناة إلى Supabase بنجاح`);
          }
        }
      }
      
      if (storedCountries) {
        const parsedCountries = JSON.parse(storedCountries);
        if (Array.isArray(parsedCountries) && parsedCountries.length > 0) {
          // التأكد من أن المعرفات بتنسيق UUID صالح
          const supabaseCountries = parsedCountries.map(country => ({
            ...country,
            id: country.id.includes('-') ? country.id : crypto.randomUUID()
          }));
          
          const { error } = await supabase.from('countries').insert(supabaseCountries);
          if (error) {
            console.error('خطأ في تحميل البلدان إلى Supabase:', error);
          } else {
            console.log('تم تحميل البلدان إلى Supabase بنجاح');
          }
        }
      }
      
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          // التأكد من أن المعرفات بتنسيق UUID صالح
          const supabaseCategories = parsedCategories.map(category => ({
            ...category,
            id: category.id.includes('-') ? category.id : crypto.randomUUID()
          }));
          
          const { error } = await supabase.from('categories').insert(supabaseCategories);
          if (error) {
            console.error('خطأ في تحميل الفئات إلى Supabase:', error);
          } else {
            console.log('تم تحميل الفئات إلى Supabase بنجاح');
          }
        }
      }
      
      console.log('تم تحميل البيانات المحلية إلى Supabase بنجاح');
    } else {
      console.log(`جداول Supabase تحتوي على بيانات بالفعل (${countValue} قناة)`);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة جداول Supabase:', error);
    return false;
  }
};

// الاشتراك للتحديثات في الوقت الحقيقي
export const setupRealtimeSync = () => {
  console.log('إعداد المزامنة في الوقت الحقيقي مع Supabase...');
  try {
    const channelsSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' }, 
        async (payload) => {
          console.log('تم تلقي تحديث للقنوات في الوقت الحقيقي:', payload);
          await syncWithSupabase(true);
        }
      )
      .subscribe((status) => {
        console.log('حالة الاشتراك في تحديثات الوقت الحقيقي:', status);
      });
    
    return () => {
      console.log('إزالة الاشتراك في تحديثات الوقت الحقيقي');
      supabase.removeChannel(channelsSubscription);
    };
  } catch (error) {
    console.error('خطأ في إعداد المزامنة في الوقت الحقيقي:', error);
    return () => {
      // دالة تنظيف فارغة في حالة الخطأ
    };
  }
};
