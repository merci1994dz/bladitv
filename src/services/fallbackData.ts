
import { Channel, Category, Country } from '@/types';

// Fallback data (used only if API fails and no local data exists)
export const fallbackCategories: Category[] = [
  { id: '1', name: 'رياضة', icon: 'trophy' },
  { id: '2', name: 'أخبار', icon: 'newspaper' },
  { id: '3', name: 'ترفيه', icon: 'tv' },
  { id: '4', name: 'أطفال', icon: 'baby' },
  { id: '5', name: 'ثقافة', icon: 'book' },
];

export const fallbackCountries: Country[] = [
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

export const fallbackChannels: Channel[] = [
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
