
import { CMSUser } from '../types';
import { getCMSUsers, saveCMSUsers } from '../storage/users';

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
