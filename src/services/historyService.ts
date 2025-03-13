
import { STORAGE_KEYS } from './config';

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

// دالة لمسح سجل المشاهدة
export const clearWatchHistory = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECENTLY_WATCHED);
  } catch (error) {
    console.error('Error clearing watch history:', error);
  }
};
