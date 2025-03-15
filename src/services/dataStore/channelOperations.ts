
import { Channel } from '@/types';
import { channels } from './state';
import { saveChannelsToStorage } from './storage';

// Function to add a channel to memory
export const addChannelToMemory = (channel: Channel) => {
  // Check if channel already exists
  const index = channels.findIndex(c => c.id === channel.id);
  
  if (index >= 0) {
    // Update existing channel
    channels[index] = { ...channel };
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
export const updateChannelInMemory = (channel: Channel) => {
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
