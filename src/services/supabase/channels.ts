import { supabase } from '@/integrations/supabase/client';
import { Channel, Country, Category } from '@/types';
import { STORAGE_KEYS } from '../config';
import { Json } from '@/integrations/supabase/types';
import { StreamingLink as ExternalStreamingLink } from '@/types/externalStreaming';

// Interfaces to match Supabase schema columns with our app models
interface SupabaseChannel {
  category: string;
  country: string;
  externallinks: Json | null;
  id: string;
  isfavorite: boolean | null;
  lastwatched: string | null;
  logo: string;
  name: string;
  streamurl: string;
}

// Import StreamingLink directly instead of redefining it
type StreamingLink = ExternalStreamingLink;

// Converter functions to map between our app models and Supabase schema
const toChannel = (supabaseChannel: SupabaseChannel): Channel => ({
  id: supabaseChannel.id,
  name: supabaseChannel.name,
  logo: supabaseChannel.logo,
  streamUrl: supabaseChannel.streamurl,
  category: supabaseChannel.category,
  country: supabaseChannel.country,
  isFavorite: supabaseChannel.isfavorite || false,
  lastWatched: supabaseChannel.lastwatched,
  externalLinks: (supabaseChannel.externallinks as unknown as StreamingLink[]) || []
});

const toSupabaseChannel = (channel: Omit<Channel, 'id'> | Channel): Omit<SupabaseChannel, 'id'> => ({
  name: channel.name,
  logo: channel.logo,
  streamurl: channel.streamUrl,
  category: channel.category,
  country: channel.country,
  isfavorite: channel.isFavorite,
  lastwatched: channel.lastWatched,
  externallinks: channel.externalLinks as unknown as Json
});

// جلب قائمة القنوات من Supabase
export const getChannelsFromSupabase = async (): Promise<Channel[]> => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*');
    
    if (error) {
      console.error('خطأ في جلب القنوات من Supabase:', error);
      throw error;
    }
    
    // Convert Supabase data to our Channel model
    const channels = (data as SupabaseChannel[]).map(toChannel);
    
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

// إضافة قناة جديدة إلى Supabase
export const addChannelToSupabase = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  try {
    const supabaseChannel = toSupabaseChannel(channel);
    const { data, error } = await supabase
      .from('channels')
      .insert(supabaseChannel)
      .select()
      .single();
    
    if (error) {
      console.error('خطأ في إضافة القناة إلى Supabase:', error);
      throw error;
    }
    
    return toChannel(data as SupabaseChannel);
  } catch (error) {
    console.error('خطأ في إضافة القناة إلى Supabase:', error);
    throw error;
  }
};

// تحديث قناة في Supabase
export const updateChannelInSupabase = async (channel: Channel): Promise<Channel> => {
  try {
    const supabaseChannel = toSupabaseChannel(channel);
    const { data, error } = await supabase
      .from('channels')
      .update(supabaseChannel)
      .eq('id', channel.id)
      .select()
      .single();
    
    if (error) {
      console.error('خطأ في تحديث القناة في Supabase:', error);
      throw error;
    }
    
    return toChannel(data as SupabaseChannel);
  } catch (error) {
    console.error('خطأ في تحديث القناة في Supabase:', error);
    throw error;
  }
};

// حذف قناة من Supabase
export const deleteChannelFromSupabase = async (channelId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) {
      console.error('خطأ في حذف القناة من Supabase:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف القناة من Supabase:', error);
    throw error;
  }
};

// الاستماع للتغييرات في الوقت الحقيقي
export const subscribeToChannelsChanges = (callback: (channels: Channel[]) => void) => {
  const subscription = supabase
    .channel('public:channels')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'channels' }, 
      async () => {
        // استرجاع البيانات المحدثة
        const { data } = await supabase.from('channels').select('*');
        if (data) {
          const channels = (data as SupabaseChannel[]).map(toChannel);
          callback(channels);
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
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
