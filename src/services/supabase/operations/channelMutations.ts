
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
    
    // إنشاء معرف UUID جديد للقناة باستخدام crypto.randomUUID() أو تنسيق uuid-v4
    // لضمان أن المعرف يتوافق مع متطلبات Supabase UUID
    const newChannelId = crypto.randomUUID ? 
      crypto.randomUUID() : 
      `channel-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const { data, error } = await supabase
      .from('channels')
      .insert({ ...supabaseChannel, id: newChannelId })
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
    
    console.log('تحديث القناة في Supabase:', {id: channel.id, ...supabaseChannel});
    
    // تأكد من أن المعرف موجود وصالح قبل التحديث
    if (!channel.id || typeof channel.id !== 'string') {
      throw new Error('معرف القناة غير صالح للتحديث');
    }
    
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
    console.log('تم تحديث القناة بنجاح:', updatedChannel);
    
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
    console.log('حذف القناة من Supabase:', channelId);
    
    // تأكد من أن المعرف موجود وصالح قبل الحذف
    if (!channelId || typeof channelId !== 'string') {
      throw new Error('معرف القناة غير صالح للحذف');
    }
    
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', channelId);
    
    if (error) {
      console.error('خطأ في حذف القناة من Supabase:', error);
      throw error;
    }
    
    console.log('تم حذف القناة بنجاح:', channelId);
    
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
