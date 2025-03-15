
import { STORAGE_KEYS, DEFAULT_ADMIN_PASSWORD, SECURITY_CONFIG } from './config';
import { toast } from '@/hooks/use-toast';

// Function to verify admin password with security features
export const verifyAdminPassword = (password: string): boolean => {
  // التحقق من وجود قفل على تسجيل الدخول بعد عدة محاولات فاشلة
  const lockUntil = localStorage.getItem('admin_lock_until');
  if (lockUntil && Number(lockUntil) > Date.now()) {
    const remainingMinutes = Math.ceil((Number(lockUntil) - Date.now()) / 60000);
    throw new Error(`تم قفل الحساب مؤقتًا. يرجى المحاولة بعد ${remainingMinutes} دقيقة`);
  }

  // استرجاع كلمة المرور المخزنة أو استخدام الافتراضية
  const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  
  // التحقق من صحة كلمة المرور
  const isValid = password === storedPassword;
  
  // إدارة محاولات تسجيل الدخول
  const attempts = Number(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS) || '0');
  
  if (isValid) {
    // إعادة ضبط عدد المحاولات في حالة النجاح
    localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS);
    
    // إنشاء توكن الجلسة
    const sessionToken = generateSessionToken();
    localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, sessionToken);
    localStorage.setItem('admin_session_expires', (Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT).toString());
    
    return true;
  } else {
    // زيادة عدد المحاولات الفاشلة
    const newAttempts = attempts + 1;
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS, newAttempts.toString());
    
    // قفل الحساب بعد وصول الحد الأقصى من المحاولات
    if (newAttempts >= SECURITY_CONFIG.ADMIN_PROTECTION.MAX_LOGIN_ATTEMPTS) {
      const lockTime = Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME;
      localStorage.setItem('admin_lock_until', lockTime.toString());
      throw new Error(`تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. تم قفل الحساب لمدة ${SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME / 60000} دقيقة`);
    }
    
    return false;
  }
};

// وظيفة للتحقق من صلاحية جلسة المسؤول
export const verifyAdminSession = (): boolean => {
  const sessionToken = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  const sessionExpires = localStorage.getItem('admin_session_expires');
  
  if (!sessionToken || !sessionExpires) {
    return false;
  }
  
  // التحقق من انتهاء صلاحية الجلسة
  if (Number(sessionExpires) < Date.now()) {
    // إزالة بيانات الجلسة المنتهية
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
    localStorage.removeItem('admin_session_expires');
    return false;
  }
  
  // تجديد مدة الجلسة
  localStorage.setItem('admin_session_expires', (Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT).toString());
  return true;
};

// Function to update admin password with validation
export const updateAdminPassword = (newPassword: string): void => {
  // التحقق من شروط كلمة المرور
  if (!newPassword) {
    throw new Error('كلمة المرور مطلوبة');
  }
  
  if (newPassword.length < 8) {
    throw new Error('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
  }
  
  // التحقق من تعقيد كلمة المرور
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers) && !hasSpecialChar) {
    throw new Error('كلمة المرور ضعيفة جدًا. يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام أو رموز خاصة');
  }
  
  // تخزين كلمة المرور الجديدة
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
  
  // إنشاء توكن جلسة جديد بعد تغيير كلمة المرور
  const sessionToken = generateSessionToken();
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, sessionToken);
  localStorage.setItem('admin_session_expires', (Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT).toString());
};

// وظيفة لتسجيل خروج المسؤول
export const logoutAdmin = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  localStorage.removeItem('admin_session_expires');
  localStorage.removeItem('admin_authenticated');
};

// وظيفة مساعدة لإنشاء توكن عشوائي
const generateSessionToken = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timePart = Date.now().toString(36);
  return `${randomPart}_${timePart}`;
};
