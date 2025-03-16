
import { 
  CMSContentBlock, 
  CMSLayout, 
  CMSSchedule, 
  CMSSettings, 
  CMSUser 
} from './types';
import { 
  getCMSSettings, 
  saveCMSSettings,
  getCMSUsers, 
  saveCMSUsers,
  getCMSLayouts, 
  saveCMSLayouts,
  getCMSContentBlocks, 
  saveCMSContentBlocks,
  getCMSSchedules, 
  saveCMSSchedules
} from './storage';
import { STORAGE_KEYS } from '../config';
import { Channel } from '@/types';
import { addChannelToMemory, removeChannelFromMemory, updateChannelInMemory } from '../dataStore/channelOperations';

// ----------------------
// إدارة المستخدمين
// ----------------------

// إضافة مستخدم جديد
export const addUser = (user: Omit<CMSUser, 'id'>): CMSUser => {
  const users = getCMSUsers();
  const newUser: CMSUser = {
    ...user,
    id: `user-${Date.now()}`,
  };
  
  users.push(newUser);
  saveCMSUsers(users);
  return newUser;
};

// تحديث بيانات مستخدم
export const updateUser = (user: CMSUser): CMSUser => {
  const users = getCMSUsers();
  const index = users.findIndex(u => u.id === user.id);
  
  if (index !== -1) {
    users[index] = user;
    saveCMSUsers(users);
    return user;
  }
  
  throw new Error(`لم يتم العثور على مستخدم بالمعرف ${user.id}`);
};

// حذف مستخدم
export const deleteUser = (userId: string): boolean => {
  const users = getCMSUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users.splice(index, 1);
    saveCMSUsers(users);
    return true;
  }
  
  return false;
};

// ----------------------
// إدارة كتل المحتوى
// ----------------------

// إضافة كتلة محتوى جديدة
export const addContentBlock = (block: Omit<CMSContentBlock, 'id' | 'createdAt' | 'updatedAt'>): CMSContentBlock => {
  const blocks = getCMSContentBlocks();
  const newBlock: CMSContentBlock = {
    ...block,
    id: `block-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  blocks.push(newBlock);
  saveCMSContentBlocks(blocks);
  return newBlock;
};

// تحديث كتلة محتوى
export const updateContentBlock = (block: CMSContentBlock): CMSContentBlock => {
  const blocks = getCMSContentBlocks();
  const index = blocks.findIndex(b => b.id === block.id);
  
  if (index !== -1) {
    const updatedBlock = {
      ...block,
      updatedAt: new Date().toISOString()
    };
    
    blocks[index] = updatedBlock;
    saveCMSContentBlocks(blocks);
    return updatedBlock;
  }
  
  throw new Error(`لم يتم العثور على كتلة محتوى بالمعرف ${block.id}`);
};

// حذف كتلة محتوى
export const deleteContentBlock = (blockId: string): boolean => {
  const blocks = getCMSContentBlocks();
  const index = blocks.findIndex(b => b.id === blockId);
  
  if (index !== -1) {
    blocks.splice(index, 1);
    saveCMSContentBlocks(blocks);
    
    // تحديث أي تخطيطات تستخدم هذه الكتلة
    const layouts = getCMSLayouts();
    let layoutsUpdated = false;
    
    layouts.forEach(layout => {
      const blockIndex = layout.blocks.indexOf(blockId);
      if (blockIndex !== -1) {
        layout.blocks.splice(blockIndex, 1);
        layout.updatedAt = new Date().toISOString();
        layoutsUpdated = true;
      }
    });
    
    if (layoutsUpdated) {
      saveCMSLayouts(layouts);
    }
    
    return true;
  }
  
  return false;
};

// ----------------------
// إدارة تخطيطات الصفحات
// ----------------------

// إضافة تخطيط جديد
export const addLayout = (layout: Omit<CMSLayout, 'id' | 'createdAt' | 'updatedAt'>): CMSLayout => {
  const layouts = getCMSLayouts();
  const newLayout: CMSLayout = {
    ...layout,
    id: `layout-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // إذا كان التخطيط الجديد هو الافتراضي، قم بإلغاء تفعيل التخطيطات الافتراضية الأخرى
  if (newLayout.isDefault) {
    layouts.forEach(l => {
      if (l.type === newLayout.type && l.isDefault) {
        l.isDefault = false;
        l.updatedAt = new Date().toISOString();
      }
    });
  }
  
  layouts.push(newLayout);
  saveCMSLayouts(layouts);
  return newLayout;
};

// تحديث تخطيط
export const updateLayout = (layout: CMSLayout): CMSLayout => {
  const layouts = getCMSLayouts();
  const index = layouts.findIndex(l => l.id === layout.id);
  
  if (index !== -1) {
    const updatedLayout = {
      ...layout,
      updatedAt: new Date().toISOString()
    };
    
    // إذا كان التخطيط المحدث هو الافتراضي، قم بإلغاء تفعيل التخطيطات الافتراضية الأخرى
    if (updatedLayout.isDefault) {
      layouts.forEach(l => {
        if (l.id !== updatedLayout.id && l.type === updatedLayout.type && l.isDefault) {
          l.isDefault = false;
          l.updatedAt = new Date().toISOString();
        }
      });
    }
    
    layouts[index] = updatedLayout;
    saveCMSLayouts(layouts);
    return updatedLayout;
  }
  
  throw new Error(`لم يتم العثور على تخطيط بالمعرف ${layout.id}`);
};

// حذف تخطيط
export const deleteLayout = (layoutId: string): boolean => {
  const layouts = getCMSLayouts();
  const layoutToDelete = layouts.find(l => l.id === layoutId);
  
  if (!layoutToDelete) {
    return false;
  }
  
  // لا تسمح بحذف التخطيط الافتراضي
  if (layoutToDelete.isDefault) {
    throw new Error('لا يمكن حذف التخطيط الافتراضي');
  }
  
  const index = layouts.findIndex(l => l.id === layoutId);
  layouts.splice(index, 1);
  saveCMSLayouts(layouts);
  
  // حذف أي جداول مرتبطة بهذا التخطيط
  const schedules = getCMSSchedules();
  const updatedSchedules = schedules.filter(s => s.layoutId !== layoutId);
  
  if (updatedSchedules.length !== schedules.length) {
    saveCMSSchedules(updatedSchedules);
  }
  
  return true;
};

// ----------------------
// إدارة جداول العرض
// ----------------------

// إضافة جدول عرض جديد
export const addSchedule = (schedule: Omit<CMSSchedule, 'id'>): CMSSchedule => {
  const schedules = getCMSSchedules();
  const newSchedule: CMSSchedule = {
    ...schedule,
    id: `schedule-${Date.now()}`
  };
  
  schedules.push(newSchedule);
  saveCMSSchedules(schedules);
  return newSchedule;
};

// تحديث جدول عرض
export const updateSchedule = (schedule: CMSSchedule): CMSSchedule => {
  const schedules = getCMSSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  
  if (index !== -1) {
    schedules[index] = schedule;
    saveCMSSchedules(schedules);
    return schedule;
  }
  
  throw new Error(`لم يتم العثور على جدول عرض بالمعرف ${schedule.id}`);
};

// حذف جدول عرض
export const deleteSchedule = (scheduleId: string): boolean => {
  const schedules = getCMSSchedules();
  const index = schedules.findIndex(s => s.id === scheduleId);
  
  if (index !== -1) {
    schedules.splice(index, 1);
    saveCMSSchedules(schedules);
    return true;
  }
  
  return false;
};

// ----------------------
// إدارة الإعدادات
// ----------------------

// تحديث إعدادات CMS
export const updateSettings = (settings: Partial<CMSSettings>): CMSSettings => {
  const currentSettings = getCMSSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  
  saveCMSSettings(updatedSettings);
  return updatedSettings;
};

// ----------------------
// وظائف مساعدة
// ----------------------

// الحصول على التخطيط النشط للصفحة الرئيسية
export const getActiveHomeLayout = (): CMSLayout | null => {
  const layouts = getCMSLayouts();
  
  // البحث عن تخطيط الصفحة الرئيسية الافتراضي والنشط
  const defaultHomeLayout = layouts.find(l => l.type === 'home' && l.isDefault && l.active);
  if (defaultHomeLayout) {
    return defaultHomeLayout;
  }
  
  // إذا لم يتم العثور على تخطيط افتراضي نشط، ابحث عن أي تخطيط نشط للصفحة الرئيسية
  const anyActiveHomeLayout = layouts.find(l => l.type === 'home' && l.active);
  if (anyActiveHomeLayout) {
    return anyActiveHomeLayout;
  }
  
  return null;
};

// الحصول على كتل المحتوى لتخطيط معين
export const getContentBlocksForLayout = (layoutId: string): CMSContentBlock[] => {
  const layout = getCMSLayouts().find(l => l.id === layoutId);
  
  if (!layout) {
    return [];
  }
  
  const allBlocks = getCMSContentBlocks();
  return allBlocks
    .filter(block => layout.blocks.includes(block.id) && block.active)
    .sort((a, b) => {
      // الترتيب حسب الموضع في التخطيط
      const posA = layout.blocks.indexOf(a.id);
      const posB = layout.blocks.indexOf(b.id);
      return posA - posB;
    });
};

// الحصول على التخطيط النشط حاليًا بناءً على الجداول
export const getCurrentActiveLayout = (type: 'home' | 'category' | 'country' | 'custom'): CMSLayout | null => {
  const now = new Date();
  const schedules = getCMSSchedules();
  const layouts = getCMSLayouts();
  
  // البحث عن الجداول النشطة حاليًا
  const activeSchedules = schedules.filter(schedule => {
    if (!schedule.active) return false;
    
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    
    if (now < startDate || now > endDate) return false;
    
    // التحقق من أيام التكرار إذا كان الجدول متكررًا
    if (schedule.repeating && schedule.repeatDays) {
      const today = now.getDay();
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      
      const isActiveToday = schedule.repeatDays.some(day => dayMap[day] === today);
      if (!isActiveToday) return false;
    }
    
    return true;
  });
  
  // البحث عن التخطيط من الجداول النشطة
  for (const schedule of activeSchedules) {
    const layout = layouts.find(l => l.id === schedule.layoutId && l.type === type && l.active);
    if (layout) {
      return layout;
    }
  }
  
  // إذا لم يتم العثور على تخطيط من الجداول، استخدم التخطيط الافتراضي
  const defaultLayout = layouts.find(l => l.type === type && l.isDefault && l.active);
  if (defaultLayout) {
    return defaultLayout;
  }
  
  // إذا لم يتم العثور على تخطيط افتراضي، استخدم أي تخطيط نشط
  return layouts.find(l => l.type === type && l.active) || null;
};

// ----------------------
// وظائف تكاملية مع وظائف إدارة القنوات الحالية
// ----------------------

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

// تهيئة نظام CMS
export const initializeCMS = (): void => {
  const settings = getCMSSettings();
  console.log('تم تهيئة نظام إدارة المحتوى (CMS)', settings);
  
  // إضافة مؤشر لتهيئة CMS
  localStorage.setItem('cms_initialized', 'true');
  localStorage.setItem('cms_version', '1.0.0');
};
