
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// تحسين معالج الأخطاء العالمي
const handleGlobalError = (error: Error) => {
  console.error('خطأ غير معالج في التطبيق:', error);
  
  // تحسين منطق إعادة تحميل التطبيق في حالة المشاكل الشبكية
  if (error.message.includes('network') || 
      error.message.includes('fetch') || 
      error.message.includes('API') || 
      error.message.includes('data')) {
    console.warn('خطأ في الاتصال أو البيانات، محاولة استعادة التطبيق...');
    
    // إضافة علامة للإشارة إلى خطأ حدث
    localStorage.setItem('app_error_occurred', 'true');
    localStorage.setItem('error_timestamp', Date.now().toString());
    
    // محاولة إعادة تحميل الصفحة فقط إذا كان المستخدم متصلاً بالإنترنت
    if (navigator.onLine) {
      setTimeout(() => {
        // إضافة معلمات لمنع التخزين المؤقت عند إعادة التحميل
        window.location.href = window.location.href.split('?')[0] + 
          `?reload=${Date.now()}&nocache=true`;
      }, 3000);
    }
  }
};

// تسجيل معالجات الأخطاء
window.addEventListener('error', (event) => {
  handleGlobalError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(event.reason);
});

// تحسين التعرف على بيئة التشغيل
declare global {
  interface Window {
    isHostedEnvironment: boolean;
    isGitHubPages: boolean;
  }
}

// تهيئة متغيرات بيئة التشغيل
window.isHostedEnvironment = window.location.hostname !== 'localhost' && 
                           !window.location.hostname.includes('127.0.0.1');
                           
window.isGitHubPages = window.location.hostname.includes('github.io');

// تحسين الإعدادات بناءً على بيئة التشغيل
if (window.isGitHubPages) {
  console.log('التطبيق يعمل على GitHub Pages - تطبيق إعدادات خاصة');
  // إعدادات خاصة بـ GitHub Pages
  localStorage.setItem('is_github_pages', 'true');
} else if (window.isHostedEnvironment) {
  console.log('التطبيق يعمل على بيئة استضافة عادية');
  localStorage.setItem('is_hosted', 'true');
} else {
  console.log('التطبيق يعمل محليًا - وضع التطوير');
  localStorage.setItem('is_development', 'true');
}

// تثبيت التطبيق الرئيسي
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("عنصر الجذر غير موجود في الصفحة");
}

createRoot(rootElement).render(<App />);

// إضافة مؤقت للتحقق من اتصال الإنترنت مع تحسين منطق المعالجة
let wasOffline = !navigator.onLine;
setInterval(() => {
  if (!navigator.onLine && !wasOffline) {
    console.warn('انقطع الاتصال بالإنترنت!');
    wasOffline = true;
    
    // إشعار للتخزين المحلي يمكن للمكونات الأخرى الاستجابة له
    localStorage.setItem('connection_lost', Date.now().toString());
  } else if (navigator.onLine && wasOffline) {
    console.log('تم استعادة الاتصال بالإنترنت!');
    wasOffline = false;
    
    // إشعار بعودة الاتصال
    localStorage.setItem('connection_restored', Date.now().toString());
  }
}, 5000);
