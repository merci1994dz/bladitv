
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from './constants';
import { CMSSchedule } from '../../cms/types';

// إضافة جدول عرض جديد
export const addScheduleToFirebase = async (schedule: Omit<CMSSchedule, 'id'>): Promise<CMSSchedule> => {
  try {
    const newSchedule: CMSSchedule = {
      ...schedule,
      id: `schedule-${Date.now()}`
    };
    
    await setDoc(doc(db, COLLECTIONS.SCHEDULES, newSchedule.id), newSchedule);
    return newSchedule;
  } catch (error) {
    console.error('خطأ في إضافة جدول العرض إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع جداول العرض
export const getSchedulesFromFirebase = async (): Promise<CMSSchedule[]> => {
  try {
    const schedulesSnapshot = await getDocs(collection(db, COLLECTIONS.SCHEDULES));
    const schedules: CMSSchedule[] = [];
    
    schedulesSnapshot.forEach((doc) => {
      schedules.push(doc.data() as CMSSchedule);
    });
    
    return schedules;
  } catch (error) {
    console.error('خطأ في جلب جداول العرض من Firebase:', error);
    throw error;
  }
};

// تحديث جدول عرض
export const updateScheduleInFirebase = async (schedule: CMSSchedule): Promise<CMSSchedule> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.SCHEDULES, schedule.id), { ...schedule });
    return schedule;
  } catch (error) {
    console.error('خطأ في تحديث جدول العرض في Firebase:', error);
    throw error;
  }
};

// حذف جدول عرض
export const deleteScheduleFromFirebase = async (scheduleId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SCHEDULES, scheduleId));
    return true;
  } catch (error) {
    console.error('خطأ في حذف جدول العرض من Firebase:', error);
    throw error;
  }
};
