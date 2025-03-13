import { Channel, Category, Country } from '@/types';

// API Base URL - Change this to your website API endpoint
const API_BASE_URL = 'https://elhiwar.us/iptv/api';

// Local storage keys
const STORAGE_KEYS = {
  CHANNELS: 'tv_channels',
  COUNTRIES: 'tv_countries',
  CATEGORIES: 'tv_categories',
  LAST_SYNC: 'tv_last_sync'
};

// Fallback data (used only if API fails and no local data exists)
const fallbackCategories: Category[] = [
  { id: '1', name: 'رياضة', icon: 'trophy' },
  { id: '2', name: 'أخبار', icon: 'newspaper' },
  { id: '3', name: 'ترفيه', icon: 'tv' },
  { id: '4', name: 'أطفال', icon: 'baby' },
  { id: '5', name: 'ثقافة', icon: 'book' },
];

const fallbackCountries: Country[] = [
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

const fallbackChannels: Channel[] = [
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

// In-memory cache
let channels: Channel[] = [];
let countries: Country[] = [];
let categories: Category[] = [];
let isSyncing = false;

// Function to fetch data from the remote API
const syncWithRemoteAPI = async (): Promise<boolean> => {
  if (isSyncing) return false;
  
  try {
    isSyncing = true;
    console.log('Syncing with remote API...');
    
    // Fetch channels, countries, and categories from your website API
    const [channelsRes, countriesRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/channels`).then(res => res.json()),
      fetch(`${API_BASE_URL}/countries`).then(res => res.json()),
      fetch(`${API_BASE_URL}/categories`).then(res => res.json())
    ]);
    
    // Update local data
    channels = channelsRes;
    countries = countriesRes;
    categories = categoriesRes;
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    localStorage.setItem(STORAGE_KEYS.COUNTRIES, JSON.stringify(countries));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    
    // Update last sync time
    const lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime);
    
    console.log('Sync completed successfully');
    return true;
  } catch (error) {
    console.error('Error syncing with remote API:', error);
    return false;
  } finally {
    isSyncing = false;
  }
};

// Helper to load data from localStorage or use fallbacks
const loadFromLocalStorage = () => {
  try {
    const storedChannels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    const storedCountries = localStorage.getItem(STORAGE_KEYS.COUNTRIES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (storedChannels) {
      channels = JSON.parse(storedChannels);
    } else {
      channels = [...fallbackChannels];
    }

    if (storedCountries) {
      countries = JSON.parse(storedCountries);
    } else {
      countries = [...fallbackCountries];
    }

    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    } else {
      categories = [...fallbackCategories];
    }
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    
    // Use fallback data
    channels = [...fallbackChannels];
    countries = [...fallbackCountries];
    categories = [...fallbackCategories];
  }
};

// Initialize data
loadFromLocalStorage();

// Try to sync with remote API on application start
syncWithRemoteAPI().catch(error => {
  console.error('Initial sync failed:', error);
});

// Periodic sync (every 1 hour)
setInterval(() => {
  syncWithRemoteAPI().catch(error => {
    console.error('Periodic sync failed:', error);
  });
}, 60 * 60 * 1000);

// API Functions
export const getChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Try to sync with remote API first (but don't wait for it)
  syncWithRemoteAPI().catch(console.error);
  
  return [...channels];
};

export const getChannelsByCategory = async (categoryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.category === categoryId);
};

export const getChannelsByCountry = async (countryId: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.country === countryId);
};

export const getCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...categories];
};

export const getCountries = async (): Promise<Country[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...countries];
};

export const searchChannels = async (query: string): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const searchQuery = query.toLowerCase();
  return channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery)
  );
};

export const getFavoriteChannels = async (): Promise<Channel[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return channels.filter(channel => channel.isFavorite);
};

export const toggleFavoriteChannel = async (channelId: string): Promise<Channel> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const channelIndex = channels.findIndex(c => c.id === channelId);
  if (channelIndex >= 0) {
    channels[channelIndex].isFavorite = !channels[channelIndex].isFavorite;
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
    return channels[channelIndex];
  }
  throw new Error('Channel not found');
};

// These functions are kept for compatibility with the Admin component
// but they won't be accessible to users in the app anymore
export const addChannel = async (channel: Omit<Channel, 'id'>): Promise<Channel> => {
  throw new Error('Admin functions disabled in client app');
};

export const updateChannel = async (channel: Channel): Promise<Channel> => {
  throw new Error('Admin functions disabled in client app');
};

export const deleteChannel = async (channelId: string): Promise<void> => {
  throw new Error('Admin functions disabled in client app');
};

export const addCountry = async (country: Omit<Country, 'id'>): Promise<Country> => {
  throw new Error('Admin functions disabled in client app');
};

export const updateCountry = async (country: Country): Promise<Country> => {
  throw new Error('Admin functions disabled in client app');
};

export const deleteCountry = async (countryId: string): Promise<void> => {
  throw new Error('Admin functions disabled in client app');
};

// New function to manually trigger sync with remote
export const forceSync = async (): Promise<boolean> => {
  return await syncWithRemoteAPI();
};
