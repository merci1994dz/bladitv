
/**
 * مصادر البيانات الخارجية
 * External data sources
 */

// مصادر Bladi Info
// Bladi Info sources
export const BLADI_INFO_SOURCES = [
  'https://tv.bladiinfo.net/data/channels.json',
  'https://api.bladiinfo.net/tv/data/channels.json',
  'https://bladitv.net/data/channels.json',
  'https://beta.bladitv.net/data/channels.json',
  '/data/channels.json'  // مصدر محلي كخيار أخير / Local source as a last resort
];

// وظيفة الحصول على مصادر لفئة معينة
// Function to get sources for a specific category
export const getSourcesForCategory = (category: string): string[] => {
  switch (category) {
    case 'sports':
      return [
        'https://tv.bladiinfo.net/data/sports-channels.json',
        'https://api.bladiinfo.net/tv/data/sports-channels.json',
        '/data/sports-channels.json'
      ];
    case 'news':
      return [
        'https://tv.bladiinfo.net/data/news-channels.json',
        'https://api.bladiinfo.net/tv/data/news-channels.json',
        '/data/news-channels.json'
      ];
    case 'entertainment':
      return [
        'https://tv.bladiinfo.net/data/entertainment-channels.json',
        'https://api.bladiinfo.net/tv/data/entertainment-channels.json',
        '/data/entertainment-channels.json'
      ];
    default:
      return BLADI_INFO_SOURCES;
  }
};
