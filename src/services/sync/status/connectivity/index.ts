
/**
 * مؤشر التصدير الرئيسي لوظائف فحص الاتصال
 * Main export index for connectivity checking functions
 */

// Export the connectivity checker function directly
export { checkConnectivityIssues } from './connectivity-checker';

/**
 * وظيفة فحص مشاكل الاتصال المتقدمة
 * Advanced connectivity issues check function
 * 
 * Re-exported for backward compatibility
 */
export { 
  checkServerConnection,
  testEndpointAvailability
} from './connectivity-checker';
