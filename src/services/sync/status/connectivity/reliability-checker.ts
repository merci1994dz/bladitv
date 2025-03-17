
/**
 * فحص موثوقية الشبكة والاتصال
 * Check network and connection reliability
 */

import { NetworkReliabilityResult } from './types';
import { checkEndpointsAccessibility } from './endpoint-checker';

/**
 * فحص التوافر النسبي للشبكة - تقدير أكثر دقة لجودة الاتصال
 * Check relative network availability - more accurate estimate of connection quality
 */
export async function checkNetworkReliability(): Promise<NetworkReliabilityResult> {
  // فحص الاتصال بجميع نقاط النهاية
  // Check connection to all endpoints
  const endpoints = await checkEndpointsAccessibility();
  
  // حساب معدل النجاح
  // Calculate success rate
  const successRate = endpoints.filter(e => e.success).length / endpoints.length;
  
  // حساب متوسط زمن الاستجابة للنقاط الناجحة
  // Calculate average response time for successful points
  const successfulEndpoints = endpoints.filter(e => e.success && e.responseTime !== undefined);
  const averageResponseTime = successfulEndpoints.length
    ? successfulEndpoints.reduce((sum, e) => sum + (e.responseTime || 0), 0) / successfulEndpoints.length
    : 0;
  
  // تحديد موثوقية الشبكة بناءً على معدل النجاح ومتوسط زمن الاستجابة
  // Determine network reliability based on success rate and average response time
  let reliability: 'high' | 'medium' | 'low' | 'none';
  
  if (successRate === 0) {
    reliability = 'none';
  } else if (successRate < 0.3 || averageResponseTime > 2000) {
    reliability = 'low';
  } else if (successRate < 0.7 || averageResponseTime > 1000) {
    reliability = 'medium';
  } else {
    reliability = 'high';
  }
  
  return {
    reliability,
    averageResponseTime,
    successRate
  };
}
