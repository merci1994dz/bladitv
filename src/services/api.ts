
import { Channel, Category, Country } from '@/types';

// بيانات وهمية للاختبار
const categories: Category[] = [
  { id: '1', name: 'رياضة', icon: 'trophy' },
  { id: '2', name: 'أخبار', icon: 'newspaper' },
  { id: '3', name: 'ترفيه', icon: 'tv' },
  { id: '4', name: 'أطفال', icon: 'baby' },
  { id: '5', name: 'ثقافة', icon: 'book' },
];

const countries: Country[] = [
  { id: '1', name: 'المغرب', flag: '🇲🇦' },
  { id: '2', name: 'الجزائر', flag: '🇩🇿' },
  { id: '3', name: 'مصر', flag: '🇪🇬' },
  { id: '4', name: 'السعودية', flag: '🇸🇦' },
  { id: '5', name: 'تونس', flag: '🇹🇳' },
  { id: '6', name: 'قطر', flag: '🇶🇦' },
  { id: '7', name: 'الإمارات', flag: '🇦🇪' },
  { id: '8', name: 'الكويت', flag: '🇰🇼' },
];

const channels: Channel[] = [
  { 
    id: '1', 
    name: 'الجزيرة', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_logo.svg/1200px-Aljazeera_logo.svg.png', 
    streamUrl: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8', 
    category: '2', 
    country: '6', 
    isFavorite: false 
  },
  { 
    id: '2', 
    name: 'MBC', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Mbc1logo.png/640px-Mbc1logo.png', 
    streamUrl: 'http://example.com/mbc.m3u8', 
    category: '3', 
    country: '4', 
    isFavorite: false 
  },
  { 
    id: '3', 
    name: 'beIN SPORTS', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Logo_bein_sports_1.png/640px-Logo_bein_sports_1.png', 
    streamUrl: 'http://example.com/beinsports.m3u8', 
    category: '1', 
    country: '6', 
    isFavorite: false 
  },
  { 
    id: '4', 
    name: '2M', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/2M_TV_logo.svg/640px-2M_TV_logo.svg.png', 
    streamUrl: 'https://cdnamd-hls-globecast.akamaized.net/live/ramdisk/2m_monde/hls_video_ts_tuhawxpiemz257adfc/2m_monde.m3u8', 
    category: '3', 
    country: '1', 
    isFavorite: false 
  },
  { 
    id: '5', 
    name: 'CBC', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/CBC_Egypt.png/640px-CBC_Egypt.png', 
    streamUrl: 'http://example.com/cbc.m3u8', 
    category: '3', 
    country: '3', 
    isFavorite: false 
  },
  { 
    id: '6', 
    name: 'العربية', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Al_Arabiya.png/640px-Al_Arabiya.png', 
    streamUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8', 
    category: '2', 
    country: '7', 
    isFavorite: false 
  },
  { 
    id: '7', 
    name: 'الأولى المغربية', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/2M_TV_logo.png/640px-2M_TV_logo.png', 
    streamUrl: 'http://example.com/aloula.m3u8', 
    category: '3', 
    country: '1', 
    isFavorite: false 
  },
  { 
    id: '8', 
    name: 'MBC 3', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/MBC_3_Transparent_Background_Logo.png/640px-MBC_3_Transparent_Background_Logo.png', 
    streamUrl: 'http://example.com/mbc3.m3u8', 
    category: '4', 
    country: '4', 
    isFavorite: false 
  },
];

// استرجاع جميع القنوات
export const getChannels = async (): Promise<Channel[]> => {
  // محاكاة تأخير لشبكة الاتصال
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...channels];
};

// استرجاع القنوات حسب الفئة
export const getChannelsByCategory = async (categoryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.category === categoryId);
};

// استرجاع القنوات حسب البلد
export const getChannelsByCountry = async (countryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.country === countryId);
};

// استرجاع قائمة الفئات
export const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...categories];
};

// استرجاع قائمة البلدان
export const getCountries = async (): Promise<Country[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...countries];
};

// البحث عن القنوات
export const searchChannels = async (query: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const searchQuery = query.toLowerCase();
  return channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery)
  );
};

// استرجاع القنوات المفضلة
export const getFavoriteChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.isFavorite);
};

// تحديث حالة المفضلة للقناة
export const toggleFavoriteChannel = async (channelId: string): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const channelIndex = channels.findIndex(c => c.id === channelId);
  if (channelIndex >= 0) {
    channels[channelIndex].isFavorite = !channels[channelIndex].isFavorite;
    return channels[channelIndex];
  }
  throw new Error('Channel not found');
};
