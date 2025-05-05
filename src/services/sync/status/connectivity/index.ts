
/**
 * مؤشر التصدير الرئيسي لوظائف فحص الاتصال
 * Main export index for connectivity checking functions
 */

// Export the connectivity checker functions directly
export {
  checkConnectivityIssues,
  checkServerConnection,
  testEndpointAvailability,
  isConnected
} from './connectivity-checker';

// Add better documentation for the exports
/**
 * وظائف التحقق من الاتصال المتاحة:
 * 
 * checkConnectivityIssues: للتحقق من حالة كل من الإنترنت والخادم
 * checkServerConnection: للتحقق من إمكانية الوصول إلى الخادم فقط
 * testEndpointAvailability: لاختبار نقطة نهاية محددة
 * isConnected: للتحقق من توفر الاتصال بشكل كامل (الإنترنت والخادم)
 */
