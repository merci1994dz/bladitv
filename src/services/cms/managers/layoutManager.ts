
import { CMSLayout } from '../types';
import { getCMSLayouts, saveCMSLayouts } from '../storage/layouts';
import { getCMSSchedules, saveCMSSchedules } from '../storage/schedules';

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
