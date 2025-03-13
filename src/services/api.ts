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
  { 
    id: '1', 
    name: 'المغرب', 
    flag: '🇲🇦', 
    image: 'https://images.unsplash.com/photo-1528657249085-893be9ffd8f3?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '2', 
    name: 'الجزائر', 
    flag: '🇩🇿', 
    image: 'https://images.unsplash.com/photo-1583774248673-85f5e8558091?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '3', 
    name: 'مصر', 
    flag: '🇪🇬', 
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '4', 
    name: 'السعودية', 
    flag: '🇸🇦', 
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '5', 
    name: 'تونس', 
    flag: '🇹🇳', 
    image: 'https://images.unsplash.com/photo-1605216663770-d64eacdd8ba4?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '6', 
    name: 'قطر', 
    flag: '🇶🇦', 
    image: 'https://images.unsplash.com/photo-1518990708123-762400bee438?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '7', 
    name: 'الإمارات', 
    flag: '🇦🇪', 
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=500&auto=format&fit=crop'
  },
  { 
    id: '8', 
    name: 'الكويت', 
    flag: '🇰🇼', 
    image: 'https://images.unsplash.com/photo-1534778356534-d3dda7d937e9?q=80&w=500&auto=format&fit=crop'
  },
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

// Helper to save data to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem('tv_channels', JSON.stringify(channels));
  localStorage.setItem('tv_countries', JSON.stringify(countries));
  localStorage.setItem('tv_categories', JSON.stringify(categories));
};

// Helper to load data from localStorage
const loadFromLocalStorage = () => {
  const storedChannels = localStorage.getItem('tv_channels');
  const storedCountries = localStorage.getItem('tv_countries');
  const storedCategories = localStorage.getItem('tv_categories');

  if (storedChannels) {
    channels.length = 0;
    channels.push(...JSON.parse(storedChannels));
  }

  if (storedCountries) {
    countries.length = 0;
    countries.push(...JSON.parse(storedCountries));
  }

  if (storedCategories) {
    categories.length = 0;
    categories.push(...JSON.parse(storedCategories));
  }
};

// Load data from localStorage on initialization
try {
  loadFromLocalStorage();
} catch (error) {
  console.error('Error loading data from localStorage:', error);
  // If there's an error, we'll use the default data
}

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
    saveToLocalStorage();
    return channels[channelIndex];
  }
  throw new Error('Channel not found');
};

// Admin functions for channels

// Add a new channel
export const addChannel = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newChannel: Channel = {
    ...channel,
    id: Date.now().toString(),
    isFavorite: false
  };
  channels.push(newChannel);
  saveToLocalStorage();
  return newChannel;
};

// Update a channel
export const updateChannel = async (channel: Channel): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const channelIndex = channels.findIndex(c => c.id === channel.id);
  if (channelIndex >= 0) {
    channels[channelIndex] = channel;
    saveToLocalStorage();
    return channel;
  }
  throw new Error('Channel not found');
};

// Delete a channel
export const deleteChannel = async (channelId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const channelIndex = channels.findIndex(c => c.id === channelId);
  if (channelIndex >= 0) {
    channels.splice(channelIndex, 1);
    saveToLocalStorage();
    return;
  }
  throw new Error('Channel not found');
};

// Admin functions for countries

// Add a new country
export const addCountry = async (country: Omit<Country, 'id'>): Promise<Country> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newCountry: Country = {
    ...country,
    id: Date.now().toString()
  };
  countries.push(newCountry);
  saveToLocalStorage();
  return newCountry;
};

// Update a country
export const updateCountry = async (country: Country): Promise<Country> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const countryIndex = countries.findIndex(c => c.id === country.id);
  if (countryIndex >= 0) {
    countries[countryIndex] = country;
    saveToLocalStorage();
    return country;
  }
  throw new Error('Country not found');
};

// Delete a country
export const deleteCountry = async (countryId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const countryIndex = countries.findIndex(c => c.id === countryId);
  if (countryIndex >= 0) {
    // Check if there are channels associated with this country
    const hasChannels = channels.some(channel => channel.country === countryId);
    if (hasChannels) {
      throw new Error('Cannot delete country with associated channels');
    }
    countries.splice(countryIndex, 1);
    saveToLocalStorage();
    return;
  }
  throw new Error('Country not found');
};
