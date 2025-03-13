
import { STORAGE_KEYS } from './config';
import { Channel } from '@/types';
import { getChannels } from './channelService';

// دالة لإضافة قناة إلى سجل المشاهدة
export const addChannelToHistory = async (channelId: string): Promise<void> => {
  try {
    // الحصول على سجل المشاهدة الحالي
    const historyJson = localStorage.getItem(STORAGE_KEYS.RECENTLY_WATCHED) || '[]';
    let history: string[] = JSON.parse(historyJson);
    
    // إزالة القناة من السجل إذا كانت موجودة مسبقًا
    history = history.filter(id => id !== channelId);
    
    // إضافة القناة في بداية السجل
    history.unshift(channelId);
    
    // الاحتفاظ بأحدث 20 قناة فقط
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    // حفظ السجل المحدث
    localStorage.setItem(STORAGE_KEYS.RECENTLY_WATCHED, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding channel to history:', error);
  }
};

// دالة للحصول على سجل المشاهدة
export const getWatchHistory = async (): Promise<string[]> => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.RECENTLY_WATCHED) || '[]';
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

// دالة للحصول على سجل المشاهدة مع تفاصيل القنوات
export const getWatchHistoryWithChannels = async (): Promise<Channel[]> => {
  try {
    // الحصول على معرّفات القنوات المشاهدة مؤخرًا
    const watchHistory = await getWatchHistory();
    
    // الحصول على جميع القنوات
    const allChannels = await getChannels();
    
    // تصفية القنوات بناءً على سجل المشاهدة
    const historyChannels = allChannels
      .filter(channel => watchHistory.includes(channel.id))
      .map(channel => ({
        ...channel,
        lastWatched: new Date().toISOString() // يمكن تحسين هذا لتخزين وقت المشاهدة الفعلي
      }));
    
    return historyChannels;
  } catch (error) {
    console.error('Error getting watch history with channels:', error);
    return [];
  }
};

// دالة لمسح سجل المشاهدة
export const clearWatchHistory = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_WATCHED);
  } catch (error) {
    console.error('Error clearing watch history:', error);
  }
};

// دالة لإزالة قناة من سجل المشاهدة
export const removeFromWatchHistory = async (channelId: string): Promise<void> => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEYS.RECENTLY_WATCHED) || '[]';
    let history: string[] = JSON.parse(historyJson);
    
    // إزالة القناة من السجل
    history = history.filter(id => id !== channelId);
    
    // حفظ السجل المحدث
    localStorage.setItem(STORAGE_KEYS.RECENTLY_WATCHED, JSON.stringify(history));
  } catch (error) {
    console.error('Error removing channel from history:', error);
  }
};
