
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types';
import { STORAGE_KEYS } from '../../config';
import { SupabaseChannel, toChannel, toSupabaseChannel } from '../types/channelTypes';

// إضافة قناة جديدة إلى Supabase
export const addChannelToSupabase = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  try {
    // تحضير كائن القناة للإرسال إلى Supabase
    const supabaseChannel = toSupabaseChannel(channel);
    
    // تأكد من أن externalLinks موجود ومنسق بشكل صحيح
    if (!channel.externalLinks) {
      channel.externalLinks = [];
    }
    
    console.log('إضافة قناة جديدة:', channel);
    
    const { data, error } = await supabase
      .from('channels')
      .insert(supabaseChannel)
      .select()
      .single();
    
    if (error) {
      console.error('خطأ في إضافة القناة إلى Supabase:', error);
      throw error;
    }
    
    const newChannel = toChannel(data as SupabaseChannel);
    console.log('تمت إضافة القناة بنجاح:', newChannel);
    
    // تحديث التخزين المحلي
    const storedData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (storedData) {
      const channels = JSON.parse(storedData) as Channel[];
      channels.push(newChannel);
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    }
    
    return newChannel;
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
    
    const updatedChannel = toChannel(data as SupabaseChannel);
    
    // تحديث التخزين المحلي
    const storedData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (storedData) {
      const channels = JSON.parse(storedData) as Channel[];
      const index = channels.findIndex(c => c.id === channel.id);
      if (index !== -1) {
        channels[index] = updatedChannel;
        localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
      }
    }
    
    return updatedChannel;
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
    
    // تحديث التخزين المحلي
    const storedData = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    if (storedData) {
      const channels = JSON.parse(storedData) as Channel[];
      const updatedChannels = channels.filter(c => c.id !== channelId);
      localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(updatedChannels));
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حذف القناة من Supabase:', error);
    throw error;
  }
};
