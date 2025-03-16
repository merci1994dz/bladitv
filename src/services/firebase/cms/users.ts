
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';
import { COLLECTIONS } from './constants';
import { CMSUser } from '../../cms/types';

// إضافة مستخدم جديد
export const addUserToFirebase = async (user: Omit<CMSUser, 'id'>): Promise<CMSUser> => {
  try {
    const newUser: CMSUser = {
      ...user,
      id: `user-${Date.now()}`
    };
    
    await setDoc(doc(db, COLLECTIONS.USERS, newUser.id), newUser);
    return newUser;
  } catch (error) {
    console.error('خطأ في إضافة المستخدم إلى Firebase:', error);
    throw error;
  }
};

// جلب جميع المستخدمين
export const getUsersFromFirebase = async (): Promise<CMSUser[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    const users: CMSUser[] = [];
    
    usersSnapshot.forEach((doc) => {
      users.push(doc.data() as CMSUser);
    });
    
    return users;
  } catch (error) {
    console.error('خطأ في جلب المستخدمين من Firebase:', error);
    throw error;
  }
};

// تحديث مستخدم
export const updateUserInFirebase = async (user: CMSUser): Promise<CMSUser> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { ...user });
    return user;
  } catch (error) {
    console.error('خطأ في تحديث المستخدم في Firebase:', error);
    throw error;
  }
};

// حذف مستخدم
export const deleteUserFromFirebase = async (userId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
    return true;
  } catch (error) {
    console.error('خطأ في حذف المستخدم من Firebase:', error);
    throw error;
  }
};
