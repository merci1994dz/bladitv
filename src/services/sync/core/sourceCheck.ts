
/**
 * التحقق من توفر مصادر البيانات
 * Check data source availability
 */

import { checkBladiInfoAvailability } from '../remote/sync/sourceAvailability';

/**
 * التحقق من توفر مصادر البيانات
 * Check for available data sources
 */
export const checkSourceAvailability = async (): Promise<string | null> => {
  try {
    return await checkBladiInfoAvailability();
  } catch (error) {
    console.error('خطأ في التحقق من توفر المصادر:', error);
    return null;
  }
};

// Re-export the function for direct use
export { checkBladiInfoAvailability };
