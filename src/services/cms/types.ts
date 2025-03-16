
import { Channel, Category, Country } from '@/types';

// أنواع نظام إدارة المحتوى
export interface CMSUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  lastLogin?: string;
  permissions: string[];
  active: boolean;
}

export interface CMSContentBlock {
  id: string;
  title: string;
  type: 'featured' | 'banner' | 'grid' | 'carousel' | 'custom';
  content: {
    channelIds?: string[];
    categoryIds?: string[];
    countryIds?: string[];
    customContent?: any;
  };
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  visibleOn: ('home' | 'category' | 'country' | 'search' | 'custom')[];
  settings: {
    maxItems?: number;
    layout?: 'grid' | 'list' | 'carousel';
    theme?: 'light' | 'dark' | 'custom';
    customClass?: string;
  };
}

export interface CMSLayout {
  id: string;
  name: string;
  type: 'home' | 'category' | 'country' | 'custom';
  blocks: string[]; // IDs of content blocks
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CMSSchedule {
  id: string;
  name: string;
  layoutId: string;
  startDate: string;
  endDate: string;
  repeating: boolean;
  repeatDays?: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  active: boolean;
}

export interface CMSSettings {
  siteName: string;
  logo: string;
  defaultLayout: string;
  theme: 'light' | 'dark' | 'auto';
  featuredChannelsLimit: number;
  recentlyWatchedLimit: number;
  showCategoriesOnHome: boolean;
  showCountriesOnHome: boolean;
  showFeaturedChannelsOnHome: boolean;
  showRecentlyWatchedOnHome: boolean;
  hideEmptyCategories: boolean;
  customCss?: string;
  customJs?: string;
  analyticEnabled: boolean;
  language: string;
  id?: string;
}
