
import { Channel } from '@/types';
import { channels } from './state';
import { saveChannelsToStorage } from './storage';

// وظيفة للتحقق من وجود قناة مشابهة
const isDuplicateChannel = (newChannel: Channel): boolean => {
  // التحقق من وجود قناة بنفس الاسم
  const nameExists = channels.some(c => 
    c.name.toLowerCase() === newChannel.name.toLowerCase() && 
    c.id !== newChannel.id
  );
  
  // التحقق من وجود قناة بنفس رابط البث
  const streamUrlExists = channels.some(c => 
    c.streamUrl === newChannel.streamUrl && 
    c.id !== newChannel.id
  );
  
  return nameExists || streamUrlExists;
};

// Function to add a channel to memory with duplicate checking
export const addChannelToMemory = (channel: Channel, options?: { preventDuplicates?: boolean }) => {
  // التحقق من وجود القناة بالفعل
  const existingIndex = channels.findIndex(c => c.id === channel.id);
  
  // التحقق من وجود نسخة مشابهة
  if (options?.preventDuplicates && isDuplicateChannel(channel)) {
    console.log(`تم تجاهل قناة مكررة: ${channel.name}`);
    return null;
  }
  
  if (existingIndex >= 0) {
    // Update existing channel
    channels[existingIndex] = { ...channel };
    console.log(`تم تحديث القناة: ${channel.name}`);
  } else {
    // Add new channel
    channels.push({ ...channel });
    console.log(`تم إضافة القناة: ${channel.name}`);
  }
  
  // Save to local storage and add update markers
  saveChannelsToStorage();
  
  // Add additional update markers - optimization
  const timestamp = Date.now().toString();
  localStorage.setItem('channels_updated_at', new Date().toISOString());
  localStorage.setItem('bladi_info_update', timestamp);
  localStorage.setItem('force_refresh', 'true');
  localStorage.setItem('force_browser_refresh', 'true');
  localStorage.setItem('app_update_required', timestamp);
  
  return channel;
};

// Function to remove a channel from memory
export const removeChannelFromMemory = (channelId: string) => {
  const index = channels.findIndex(c => c.id === channelId);
  if (index >= 0) {
    const channelName = channels[index].name;
    channels.splice(index, 1);
    
    // Save changes immediately
    saveChannelsToStorage();
    
    // Add update markers - optimization
    const timestamp = Date.now().toString();
    localStorage.setItem('bladi_info_update', timestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('force_refresh', 'true');
    localStorage.setItem('app_update_required', timestamp);
    
    console.log(`تم حذف القناة: ${channelName} وتحديث البيانات`);
    return true;
  }
  return false;
};

// Function to update a channel in memory
export const updateChannelInMemory = (channel: Channel, options?: { preventDuplicates?: boolean }) => {
  // التحقق من وجود نسخة مشابهة
  if (options?.preventDuplicates && isDuplicateChannel(channel)) {
    console.log(`تم تجاهل تحديث قناة مكررة: ${channel.name}`);
    return false;
  }
  
  const index = channels.findIndex(c => c.id === channel.id);
  if (index >= 0) {
    channels[index] = { ...channel };
    
    // Save changes and broadcast
    saveChannelsToStorage();
    
    // Add update markers - optimization
    const timestamp = Date.now().toString();
    localStorage.setItem('channel_updated', timestamp);
    localStorage.setItem('force_browser_refresh', 'true');
    localStorage.setItem('app_update_required', timestamp);
    localStorage.setItem('data_version', timestamp);
    
    // Broadcast channel_updated event
    try {
      const event = new CustomEvent('channel_updated', { 
        detail: { channelId: channel.id, time: timestamp }
      });
      window.dispatchEvent(event);
    } catch (e) {
      // Ignore any errors here
    }
    
    console.log(`تم تحديث القناة: ${channel.name} ونشرها`);
    return true;
  }
  return false;
};
