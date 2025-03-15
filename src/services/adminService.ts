import { STORAGE_KEYS, SECURITY_CONFIG } from './config';

// وظيفة للتحقق من صحة كلمة المرور
export const verifyPassword = (password: string): boolean => {
  const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
  
  if (!storedPassword) {
    // إذا لم يتم العثور على كلمة مرور، استخدام الافتراضية
    return password === 'admin123';
  }
  
  return password === storedPassword;
};

// إنشاء توكن فريد للجلسة
export const generateSessionToken = (): string => {
  const token = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15) + 
               Date.now().toString(36);
  
  return token;
};

// تسجيل دخول المشرف
export const loginAdmin = (password: string): boolean => {
  // التحقق من عدد محاولات الدخول
  const attemptsStr = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS) || '0';
  const attempts = parseInt(attemptsStr, 10);
  const lastAttemptTime = parseInt(localStorage.getItem('admin_last_attempt') || '0', 10);
  const now = Date.now();
  
  // إذا كان هناك قفل مؤقت، تحقق مما إذا كان الوقت قد انتهى
  if (attempts >= SECURITY_CONFIG.ADMIN_PROTECTION.MAX_LOGIN_ATTEMPTS) {
    if (now - lastAttemptTime < SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME) {
      // لا يزال وقت القفل ساري المفعول
      return false;
    } else {
      // إعادة ضبط العداد بعد انتهاء فترة القفل
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS, '0');
    }
  }
  
  // تعيين وقت آخر محاولة
  localStorage.setItem('admin_last_attempt', now.toString());
  
  // التحقق من كلمة المرور
  const isValid = verifyPassword(password);
  
  if (!isValid) {
    // زيادة عدد المحاولات الفاشلة
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS, (attempts + 1).toString());
    return false;
  }
  
  // إذا كانت كلمة المرور صحيحة، قم بإعادة ضبط العداد وإنشاء توكن
  localStorage.setItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS, '0');
  
  // إنشاء توكن جلسة جديد
  const token = generateSessionToken();
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, token);
  
  // تعيين وقت انتهاء الجلسة
  const expiryTime = now + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
  localStorage.setItem('admin_session_expiry', expiryTime.toString());
  
  return true;
};

// التحقق من صحة جلسة المشرف
export const verifyAdminSession = (): boolean => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  
  if (!token) {
    return false;
  }
  
  // التحقق مما إذا كانت الجلسة قد انتهت صلاحيتها
  const expiryTime = parseInt(localStorage.getItem('admin_session_expiry') || '0', 10);
  const now = Date.now();
  
  if (now > expiryTime) {
    // الجلسة منتهية الصلاحية، قم بحذف الرمز المميز
    localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
    localStorage.removeItem('admin_session_expiry');
    return false;
  }
  
  // تحديث وقت انتهاء الصلاحية (تمديد الجلسة)
  const newExpiryTime = now + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
  localStorage.setItem('admin_session_expiry', newExpiryTime.toString());
  
  return true;
};

// تسجيل خروج المشرف
export const logoutAdmin = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
  localStorage.removeItem('admin_session_expiry');
};

// تغيير كلمة مرور المشرف - this was previously changeAdminPassword, renaming to updateAdminPassword
export const updateAdminPassword = (newPassword: string): boolean => {
  // حفظ كلمة المرور الجديدة
  localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
  
  // إنشاء جلسة جديدة
  const token = generateSessionToken();
  localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, token);
  
  // تعيين وقت انتهاء الصلاحية الجديد
  const expiryTime = Date.now() + SECURITY_CONFIG.ADMIN_PROTECTION.SESSION_TIMEOUT;
  localStorage.setItem('admin_session_expiry', expiryTime.toString());
  
  return true;
};

// التحقق من حالة قفل الحساب
export const isAccountLocked = (): { locked: boolean; remainingTime: number } => {
  const attemptsStr = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGIN_ATTEMPTS) || '0';
  const attempts = parseInt(attemptsStr, 10);
  const lastAttemptTime = parseInt(localStorage.getItem('admin_last_attempt') || '0', 10);
  const now = Date.now();
  
  if (attempts >= SECURITY_CONFIG.ADMIN_PROTECTION.MAX_LOGIN_ATTEMPTS) {
    const lockEndTime = lastAttemptTime + SECURITY_CONFIG.ADMIN_PROTECTION.LOCK_TIME;
    if (now < lockEndTime) {
      // الحساب لا يزال مقفلاً
      return {
        locked: true,
        remainingTime: Math.floor((lockEndTime - now) / 1000) // بالثواني
      };
    }
  }
  
  return {
    locked: false,
    remainingTime: 0
  };
};

// Alias for verifyPassword as verifyAdminPassword for backward compatibility
export const verifyAdminPassword = verifyPassword;
