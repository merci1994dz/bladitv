
/**
 * مصادر البيانات الخارجية
 * External data sources
 */

// مصادر Bladi Info
// Bladi Info sources
export const BLADI_INFO_SOURCES = [
  // المصادر المحلية للتطوير
  // Local sources for development
  '/data/channels.json',
  
  // CDNs للإنتاج
  // CDNs for production
  'https://cdn.jsdelivr.net/gh/yourusername/data-repo@main/data/channels.json',
  
  // مصادر احتياطية
  // Backup sources
  'https://example.com/data/channels.json',
];

// قائمة بروكسيات CORS للمساعدة في الوصول للمصادر
// List of CORS proxies to help access sources
export const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];
