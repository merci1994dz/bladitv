
/**
 * Remote data sources configuration
 */

// تحسين قائمة المصادر مع خادم احتياطي ودعم CORS
export const BLADI_INFO_SOURCES = [
  // المصادر الرئيسية
  'https://bladitv.lovable.app/api/channels.json',
  'https://bladi-info.com/api/channels.json',
  
  // مصادر احتياطية بروتوكول HTTPS
  'https://bladiinfo-api.vercel.app/api/channels.json',
  'https://bladiinfo-backup.netlify.app/api/channels.json',
  
  // CDN للتغلب على مشاكل CORS
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/api/channels.json',
  
  // مصادر جديدة أكثر موثوقية
  'https://bladitv-api.netlify.app/api/channels.json',
  'https://bladitv-db.web.app/api/channels.json',
  'https://bladi-tv-default-rtdb.firebaseio.com/channels.json',
  
  // نقاط نهاية بديلة تدعم CORS
  'https://api.jsonbin.io/v3/b/bladiinfo-channels/latest',
  'https://api.npoint.io/bladiinfo-channels',
  
  // نسخة محلية محملة مع التطبيق كخيار أخير
  '/data/fallback-channels.json'
];
