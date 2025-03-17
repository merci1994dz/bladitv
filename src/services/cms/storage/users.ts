
import { STORAGE_KEYS } from '../../config';
import { CMSUser } from '../types';
import { defaultAdminUser } from '../defaultData';

// حفظ المستخدمين في التخزين المحلي
export const saveCMSUsers = (users: CMSUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.CMS_USERS, JSON.stringify(users));
};

// استرداد المستخدمين من التخزين المحلي
export const getCMSUsers = (): CMSUser[] => {
  try {
    const savedUsers = localStorage.getItem(STORAGE_KEYS.CMS_USERS);
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    // إذا لم يكن المستخدمون موجودين، قم بتهيئتهم
    saveCMSUsers([defaultAdminUser]);
    return [defaultAdminUser];
  } catch (error) {
    console.error('خطأ في استرداد مستخدمي CMS:', error);
    return [defaultAdminUser];
  }
};
