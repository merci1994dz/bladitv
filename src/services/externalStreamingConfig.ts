
import { ExternalStreamingProvider, ExternalStreamingServiceType } from '@/types/externalStreaming';

// تكوين مزودي خدمات البث الخارجية
export const EXTERNAL_STREAMING_PROVIDERS: ExternalStreamingProvider[] = [
  {
    id: 'youtube',
    name: 'يوتيوب',
    type: 'youtube',
    logoUrl: '/assets/icons/youtube.svg', // يمكن استبدالها بعنصر أيقونة lucide-react
    baseUrl: 'https://www.youtube.com/watch?v=',
    isEnabled: true,
    requiresAuth: false
  },
  {
    id: 'shahid',
    name: 'شاهد VIP',
    type: 'shahid',
    logoUrl: '/assets/icons/shahid.svg',
    baseUrl: 'https://shahid.mbc.net/ar/show/',
    isEnabled: true,
    requiresAuth: true
  },
  {
    id: 'rotana',
    name: 'روتانا+',
    type: 'rotana',
    logoUrl: '/assets/icons/rotana.svg',
    baseUrl: 'https://rotanaplus.net/',
    isEnabled: true,
    requiresAuth: true
  },
  {
    id: 'watan',
    name: 'وطن',
    type: 'watan',
    logoUrl: '/assets/icons/watan.svg',
    baseUrl: 'https://www.watan.com/live/',
    isEnabled: true,
    requiresAuth: false
  },
  {
    id: 'netflix',
    name: 'Netflix',
    type: 'netflix',
    logoUrl: '/assets/icons/netflix.svg',
    baseUrl: 'https://www.netflix.com/watch/',
    isEnabled: true,
    requiresAuth: true
  }
];

// الحصول على مزودي الخدمة المفعلين
export const getEnabledProviders = (): ExternalStreamingProvider[] => {
  return EXTERNAL_STREAMING_PROVIDERS.filter(provider => provider.isEnabled);
};

// الحصول على مزود خدمة بواسطة المعرف
export const getProviderById = (id: string): ExternalStreamingProvider | undefined => {
  return EXTERNAL_STREAMING_PROVIDERS.find(provider => provider.id === id);
};

// بناء رابط البث الخارجي
export const buildExternalStreamingUrl = (providerId: string, channelId: string): string | null => {
  const provider = getProviderById(providerId);
  if (!provider) return null;
  
  return `${provider.baseUrl}${channelId}`;
};
