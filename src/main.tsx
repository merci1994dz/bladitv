
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// إضافة معالج أخطاء عالمي
const handleGlobalError = (error: Error) => {
  console.error('خطأ غير معالج في التطبيق:', error);
  
  // يمكن إضافة منطق إعادة تحميل التطبيق هنا إذا كانت المشكلة خطيرة
  if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('API')) {
    console.warn('خطأ في الاتصال، محاولة إعادة تحميل البيانات...');
    
    // محاولة إعادة تحميل الصفحة في حالات خطأ الاتصال
    if (navigator.onLine) {
      setTimeout(() => {
        // إعادة التحميل بدون التخزين المؤقت في حالة ظهور خطأ اتصال
        window.location.reload();
      }, 5000);
    }
  }
};

// تسجيل معالج الأخطاء
window.addEventListener('error', (event) => {
  handleGlobalError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  handleGlobalError(event.reason);
});

// إضافة متغير للتحقق مما إذا كان التطبيق يعمل على خادم استضافة أو محليًا
// تعريف النوع لتجنب خطأ TypeScript
declare global {
  interface Window {
    isHostedEnvironment: boolean;
  }
}

// تهيئة المتغير
window.isHostedEnvironment = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

// تحسين الأداء عند التشغيل على الاستضافة
if (window.isHostedEnvironment) {
  console.log('التطبيق يعمل على بيئة استضافة');
}

// إضافة معلومات استضافة Namecheap
console.log('تم تجهيز التطبيق للتوافق مع استضافة Namecheap');

// تثبيت التطبيق الرئيسي
createRoot(document.getElementById("root")!).render(<App />);

// إضافة مؤقت للتحقق من اتصال الإنترنت
let wasOffline = false;
setInterval(() => {
  if (!navigator.onLine && !wasOffline) {
    console.warn('انقطع الاتصال بالإنترنت!');
    wasOffline = true;
  } else if (navigator.onLine && wasOffline) {
    console.log('تم استعادة الاتصال بالإنترنت!');
    wasOffline = false;
    // يمكنك إضافة منطق لإعادة تحميل البيانات هنا
  }
}, 5000);
