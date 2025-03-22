
/**
 * Remote data sources configuration
 */

// تحسين قائمة المصادر وإعطاء الأولوية للمصادر الأكثر موثوقية
export const BLADI_INFO_SOURCES = [
  // مصادر CDN (الأكثر موثوقية عادة)
  'https://cdn.jsdelivr.net/gh/lovable-iq/bladi-info@main/api/channels.json',
  'https://cdn.jsdelivr.net/gh/bladitv/channels@master/channels.json',
  
  // المصادر الرئيسية
  'https://bladitv.lovable.app/api/channels.json',
  'https://bladi-info.com/api/channels.json',
  
  // مصادر Firebase و Vercel (مستضافة على منصات موثوقة)
  'https://bladitv-db.web.app/api/channels.json',
  'https://bladi-tv-default-rtdb.firebaseio.com/channels.json',
  'https://bladiinfo-api.vercel.app/api/channels.json',
  
  // مصادر Netlify (مستضافة على منصات موثوقة)
  'https://bladiinfo-backup.netlify.app/api/channels.json',
  'https://bladitv-api.netlify.app/api/channels.json',
  
  // مصادر JSON خارجية
  'https://api.jsonbin.io/v3/b/bladiinfo-channels/latest',
  'https://api.npoint.io/bladiinfo-channels',
  
  // المصدر المحلي كآخر خيار (سنحاول تجنب استخدامه حسب طلب المستخدم)
  '/data/fallback-channels.json'
];

// إضافة مصادر CORS Proxy لتخطي قيود CORS
export const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://cors.bridged.cc/',
  'https://crossorigin.me/'
];
