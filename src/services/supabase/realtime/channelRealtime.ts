
import { supabase } from '@/integrations/supabase/client';
import { Channel } from '@/types';
import { STORAGE_KEYS } from '../../config';
import { SupabaseChannel, toChannel } from '../types/channelTypes';

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
          
          // تحديث التخزين المحلي
          localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
};
