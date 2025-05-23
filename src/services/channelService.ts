
import { Channel } from '@/types';
import { channels } from './dataStore';
import { STORAGE_KEYS } from './config';
import { syncWithLocalData } from './sync/local';
import { addChannelToHistory } from './historyService';

// وظائف API المتعلقة بالقنوات
export const getChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  syncWithLocalData().catch(console.error);
  
  return [...channels];
};

export const getChannelsByCategory = async (categoryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return channels.filter(channel => channel.category === categoryId);
};

export const getChannelsByCountry = async (countryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return channels.filter(channel => channel.country === countryId);
};

export const searchChannels = async (query: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const searchQuery = query.toLowerCase();
  return channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery)
  );
};

export const getFavoriteChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return channels.filter(channel => channel.isFavorite);
};

export const toggleFavoriteChannel = async (channelId: string): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const channelIndex = channels.findIndex(c => c.id === channelId);
  if (channelIndex >= 0) {
    channels[channelIndex].isFavorite = !channels[channelIndex].isFavorite;
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    return channels[channelIndex];
  }
  throw new Error('Channel not found');
};

// تحسين: إضافة دالة لتشغيل القناة وتتبع المشاهدة
export const playChannel = async (channelId: string): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const channelIndex = channels.findIndex(c => c.id === channelId);
  if (channelIndex >= 0) {
    await addChannelToHistory(channelId);
    
    return channels[channelIndex];
  }
  throw new Error('Channel not found');
};

export const addChannel = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // إنشاء معرف فريد بتنسيق UUID
  const newId = crypto.randomUUID ? 
    crypto.randomUUID() : 
    `channel-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newChannel: Channel = {
    ...channel,
    id: newId
  };
  
  channels.push(newChannel);
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  
  return newChannel;
};

export const updateChannel = async (channel: Channel): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = channels.findIndex(c => c.id === channel.id);
  if (index === -1) throw new Error('Channel not found');
  
  channels[index] = { ...channel };
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  
  return channel;
};

export const deleteChannel = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = channels.findIndex(c => c.id === channelId);
  if (index === -1) throw new Error('Channel not found');
  
  channels.splice(index, 1);
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
};
