
import { CMSSchedule } from '../types';
import { getCMSSchedules, saveCMSSchedules } from '../storage/schedules';

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
