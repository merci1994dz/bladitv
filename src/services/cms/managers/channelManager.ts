
import { Channel } from '@/types';
import { addChannelToMemory, removeChannelFromMemory, updateChannelInMemory } from '../../dataStore/channelOperations';

// إضافة قناة من CMS
export const addChannelFromCMS = (channel: Omit<Channel, 'id'>): Channel => {
  const newChannel: Channel = {
    ...channel,
    id: `channel-${Date.now()}`
  };
  
  return addChannelToMemory(newChannel);
};

// تحديث قناة من CMS
export const updateChannelFromCMS = (channel: Channel): boolean => {
  return updateChannelInMemory(channel);
};

// حذف قناة من CMS
export const deleteChannelFromCMS = (channelId: string): boolean => {
  return removeChannelFromMemory(channelId);
};
