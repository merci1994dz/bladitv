
import { Channel } from '@/types';
import { channels } from './dataStore';

// الحصول على سجل المشاهدة مع بيانات القنوات
export const getWatchHistoryWithChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // بما أن وظيفة المشاهدة تم حذفها، نعيد مصفوفة فارغة
  return [];
};

// إضافة قناة إلى سجل المشاهدة
export const addChannelToHistory = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log(`Added channel ${channelId} to watch history`);
  // تم حذف وظائف سجل المشاهدة، لذا هذه الدالة لن تفعل شيئًا
};

// مسح سجل المشاهدة بالكامل
export const clearWatchHistory = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Watch history cleared');
  // تم حذف وظائف سجل المشاهدة، لذا هذه الدالة لن تفعل شيئًا
};

// إزالة قناة واحدة من سجل المشاهدة
export const removeFromWatchHistory = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log(`Removed channel ${channelId} from watch history`);
  // تم حذف وظائف سجل المشاهدة، لذا هذه الدالة لن تفعل شيئًا
};
