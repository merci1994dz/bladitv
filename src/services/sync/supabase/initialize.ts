
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_KEYS } from '../../config';
import { fallbackChannels, fallbackCountries, fallbackCategories } from '../../fallbackData';
import { addChannelToMemory } from '@/services/dataStore/channelOperations';
import { setSyncTimestamp } from '../status/timestamp';

/**
 * تهيئة جداول Supabase
 * Initialize Supabase tables
 * 
 * @returns Promise<boolean> - ما إذا كانت التهيئة ناجحة أم لا / Whether initialization was successful or not
 */
export const initializeSupabaseTables = async (): Promise<boolean> => {
  let isInitializing = localStorage.getItem('supabase_initializing');
  
  if (isInitializing) {
    // إذا كانت هناك عملية تهيئة جارية، انتظر قليلاً وارجع true
    console.log('هناك عملية تهيئة جارية بالفعل، جاري تجاوزها');
    return true;
  }
  
  try {
    localStorage.setItem('supabase_initializing', 'true');
    
    console.log('بدء تهيئة جداول Supabase... / Starting Supabase tables initialization...');
    
    // إنشاء مصفوفات للتحديثات المتوازية
    // Create arrays for parallel updates
    const updatePromises = [];
    
    // التحقق من وجود جدول القنوات
    // Check if channels table exists
    const { data: channelsExist, error: channelsError } = await supabase
      .from('channels')
      .select('id')
      .limit(1);
    
    if (channelsError) {
      console.error('خطأ في التحقق من وجود جدول القنوات / Error checking if channels table exists:', channelsError);
      // أنشئ جدول القنوات
      // Create channels table
      const createTablePromise = supabase.rpc('create_channels_table');
      updatePromises.push(createTablePromise);
    } else if (!channelsExist || channelsExist.length === 0) {
      console.log('إنشاء قنوات افتراضية في Supabase / Creating default channels in Supabase');
      
      // تقسيم القنوات إلى دفعات صغيرة (5 في كل دفعة) لتجنب الحد الأقصى للطلبات
      // Split channels into small batches (5 per batch) to avoid request limits
      const batchSize = 5;
      for (let i = 0; i < fallbackChannels.length; i += batchSize) {
        const batch = fallbackChannels.slice(i, i + batchSize);
        const batchPromise = supabase.from('channels').insert(batch);
        updatePromises.push(batchPromise);
      }
    } else {
      console.log('جدول القنوات موجود بالفعل / Channels table already exists');
    }
    
    // التحقق من وجود جدول البلدان
    // Check if countries table exists
    const { data: countriesExist, error: countriesError } = await supabase
      .from('countries')
      .select('id')
      .limit(1);
    
    if (countriesError) {
      console.error('خطأ في التحقق من وجود جدول البلدان / Error checking if countries table exists:', countriesError);
      // أنشئ جدول البلدان
      // Create countries table
      const createTablePromise = supabase.rpc('create_countries_table');
      updatePromises.push(createTablePromise);
    } else if (!countriesExist || countriesExist.length === 0) {
      console.log('إنشاء بلدان افتراضية في Supabase / Creating default countries in Supabase');
      const countriesPromise = supabase.from('countries').insert(fallbackCountries);
      updatePromises.push(countriesPromise);
    } else {
      console.log('جدول البلدان موجود بالفعل / Countries table already exists');
    }
    
    // التحقق من وجود جدول الفئات
    // Check if categories table exists
    const { data: categoriesExist, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (categoriesError) {
      console.error('خطأ في التحقق من وجود جدول الفئات / Error checking if categories table exists:', categoriesError);
      // أنشئ جدول الفئات
      // Create categories table
      const createTablePromise = supabase.rpc('create_categories_table');
      updatePromises.push(createTablePromise);
    } else if (!categoriesExist || categoriesExist.length === 0) {
      console.log('إنشاء فئات افتراضية في Supabase / Creating default categories in Supabase');
      const categoriesPromise = supabase.from('categories').insert(fallbackCategories);
      updatePromises.push(categoriesPromise);
    } else {
      console.log('جدول الفئات موجود بالفعل / Categories table already exists');
    }
    
    // انتظار اكتمال جميع التحديثات
    // Wait for all updates to complete
    if (updatePromises.length > 0) {
      console.log(`تنفيذ ${updatePromises.length} عملية تحديث متوازية / Executing ${updatePromises.length} parallel update operations`);
      
      const results = await Promise.allSettled(updatePromises);
      
      // التحقق من النتائج
      // Check results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`فشلت العملية ${index + 1} / Operation ${index + 1} failed:`, result.reason);
        }
      });
      
      // تحديث وقت آخر مزامنة
      // Update last sync time
      setSyncTimestamp(new Date().toISOString());
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    }
    
    console.log('تمت تهيئة جداول Supabase بنجاح / Supabase tables initialized successfully');
    
    // محاولة إضافة القنوات من التخزين المحلي إلى Supabase إذا كانت موجودة
    try {
      const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
      if (storedChannels) {
        const channels = JSON.parse(storedChannels);
        
        if (Array.isArray(channels) && channels.length > 0) {
          console.log(`محاولة مزامنة ${channels.length} قناة من التخزين المحلي إلى Supabase`);
          
          // تقسيم القنوات إلى دفعات صغيرة لتجنب الحد الأقصى للطلبات
          const batchSize = 5;
          const syncPromises = [];
          
          for (let i = 0; i < channels.length; i += batchSize) {
            const batch = channels.slice(i, i + batchSize);
            const batchPromise = syncChannelBatch(batch);
            syncPromises.push(batchPromise);
            
            // انتظار قليلاً بين الدفعات لتجنب قيود معدل الطلبات
            if (i > 0 && i % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          await Promise.allSettled(syncPromises);
        }
      }
    } catch (e) {
      console.error('فشل في مزامنة القنوات المحلية مع Supabase:', e);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في تهيئة جداول Supabase / Error initializing Supabase tables:', error);
    return false;
  } finally {
    localStorage.removeItem('supabase_initializing');
  }
};

/**
 * مزامنة دفعة من القنوات مع Supabase
 * Sync a batch of channels with Supabase
 */
const syncChannelBatch = async (channels: any[]): Promise<void> => {
  try {
    for (const channel of channels) {
      const { error } = await supabase
        .from('channels')
        .upsert({ 
          id: channel.id,
          name: channel.name,
          logo: channel.logo,
          streamUrl: channel.streamUrl,
          category: channel.category,
          country: channel.country,
          isFavorite: channel.isFavorite || false
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`خطأ في مزامنة القناة ${channel.name}:`, error);
      }
    }
  } catch (e) {
    console.error('خطأ في مزامنة دفعة القنوات:', e);
  }
};
