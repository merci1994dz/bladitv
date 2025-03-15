
import { User } from 'firebase/auth';
import { 
  loginWithEmailAndPassword, 
  registerUser, 
  changeUserPassword, 
  logoutUser, 
  getCurrentUser 
} from './firebase/auth';
import { setDocument, getDocument } from './firebase/firestore';
import { SECURITY_CONFIG } from './config';

// قاعدة بيانات Firestore للمشرف
const ADMIN_COLLECTION = 'admin';
const ADMIN_DOC_ID = 'settings';

// التحقق من صلاحية كلمة المرور عبر Firebase
export const verifyPassword = async (password: string): Promise<boolean> => {
  try {
    const adminDoc = await getDocument(ADMIN_COLLECTION, ADMIN_DOC_ID);
    
    if (!adminDoc || !adminDoc.email) {
      // إذا لم نجد بيانات المشرف، نستخدم الإعدادات الافتراضية
      return password === 'admin123';
    }
    
    // محاولة تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
    await loginWithEmailAndPassword(adminDoc.email, password);
    return true;
  } catch (error) {
    console.error('خطأ في التحقق من كلمة المرور:', error);
    return false;
  }
};

// إنشاء توكن للجلسة
export const generateSessionToken = (): string => {
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
  
  return token;
};

// تسجيل دخول المشرف
export const loginAdmin = async (password: string): Promise<boolean> => {
  try {
    // التحقق من عدد محاولات الدخول
    const attemptsStr = localStorage.getItem('admin_login_attempts') || '0';
    const attempts = parseInt(attemptsStr, 10);
    const lastAttemptTime = parseInt(localStorage.getItem('admin_last_attempt') || '0', 10);
    const now = Date.now();
    
    // التحقق من قفل الحساب
    if (attempts >= SECURITY_CONFIG.ADMIN_PROTECTION.MAX_LOGIN_ATTEMPTS) {
      if (now - lastAttemptTime < SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME) {
        return false;
      } else {
        localStorage.setItem('admin_login_attempts', '0');
      }
    }
    
    // تعيين وقت آخر محاولة
    localStorage.setItem('admin_last_attempt', now.toString());
    
    // التحقق من كلمة المرور
    const isValid = await verifyPassword(password);
    
    if (!isValid) {
      localStorage.setItem('admin_login_attempts', (attempts + 1).toString());
      return false;
    }
    
    // إعادة تعيين عدد المحاولات
    localStorage.setItem('admin_login_attempts', '0');
    
    // توليد توكن جلسة جديد
    const token = generateSessionToken();
    localStorage.setItem('admin_access_token', token);
    
    // تعيين وقت انتهاء الجلسة
    const expiryTime = now + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
    localStorage.setItem('admin_session_expiry', expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('خطأ في تسجيل دخول المشرف:', error);
    return false;
  }
};

// التحقق من جلسة المشرف
export const verifyAdminSession = (): boolean => {
  const token = localStorage.getItem('admin_access_token');
  
  if (!token) {
    return false;
  }
  
  const expiryTime = parseInt(localStorage.getItem('admin_session_expiry') || '0', 10);
  const now = Date.now();
  
  if (now > expiryTime) {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_session_expiry');
    return false;
  }
  
  const newExpiryTime = now + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
  localStorage.setItem('admin_session_expiry', newExpiryTime.toString());
  
  return true;
};

// تسجيل خروج المشرف
export const logoutAdmin = (): void => {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_session_expiry');
  
  // تسجيل الخروج من Firebase
  logoutUser();
};

// تحديث كلمة مرور المشرف باستخدام Firebase
export const updateAdminPassword = async (newPassword: string): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    await changeUserPassword(user, newPassword);
    
    // تحديث توكن الجلسة
    const token = generateSessionToken();
    localStorage.setItem('admin_access_token', token);
    
    // تحديث وقت انتهاء الصلاحية
    const expiryTime = Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
    localStorage.setItem('admin_session_expiry', expiryTime.toString());
    
    return true;
  } catch (error) {
    console.error('خطأ في تحديث كلمة المرور:', error);
    throw error;
  }
};

// التحقق من حالة قفل الحساب
export const isAccountLocked = (): { locked: boolean; remainingTime: number } => {
  const attemptsStr = localStorage.getItem('admin_login_attempts') || '0';
  const attempts = parseInt(attemptsStr, 10);
  const lastAttemptTime = parseInt(localStorage.getItem('admin_last_attempt') || '0', 10);
  const now = Date.now();
  
  if (attempts >= SECURITY_CONFIG.ADMIN_PROTECTION.MAX_LOGIN_ATTEMPTS) {
    const lockEndTime = lastAttemptTime + SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME;
    if (now < lockEndTime) {
      return {
        locked: true,
        remainingTime: Math.floor((lockEndTime - now) / 1000)
      };
    }
  }
  
  return {
    locked: false,
    remainingTime: 0
  };
};
