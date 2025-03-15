
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updatePassword,
  signOut,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './config';

// تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    throw error;
  }
};

// إنشاء حساب جديد
export const registerUser = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error);
    throw error;
  }
};

// تغيير كلمة المرور
export const changeUserPassword = async (
  user: User, 
  newPassword: string
): Promise<void> => {
  try {
    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    throw error;
  }
};

// تسجيل الخروج
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    throw error;
  }
};

// الحصول على المستخدم الحالي
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
