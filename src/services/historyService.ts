
import { Channel } from '@/types';
import { addToWatchHistory, getWatchHistory, channels } from './dataStore';

// الحصول على سجل المشاهدة مع بيانات القنوات
export const getWatchHistoryWithChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const history = getWatchHistory();
  
  // ترتيب القنوات حسب آخر مشاهدة
  return history
    .map(item => {
      const channel = channels.find(ch => ch.id === item.channelId);
      return channel ? { ...channel, lastWatched: item.timestamp } : null;
    })
    .filter(Boolean) as Channel[];
};

// إضافة قناة إلى سجل المشاهدة
export const addChannelToHistory = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  addToWatchHistory(channelId);
  console.log(`Added channel ${channelId} to watch history`);
};

// مسح سجل المشاهدة بالكامل
export const clearWatchHistory = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  localStorage.removeItem('watch_history');
  console.log('Watch history cleared');
};

// إزالة قناة واحدة من سجل المشاهدة
export const removeFromWatchHistory = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const history = getWatchHistory();
  const newHistory = history.filter(item => item.channelId !== channelId);
  
  localStorage.setItem('watch_history', JSON.stringify(newHistory));
  console.log(`Removed channel ${channelId} from watch history`);
};
