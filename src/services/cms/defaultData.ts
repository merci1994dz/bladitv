
import { 
  CMSUser, 
  CMSContentBlock, 
  CMSLayout, 
  CMSSettings 
} from './types';

// الإعدادات الافتراضية للCMS
export const defaultSettings: CMSSettings = {
  siteName: 'قنوات بلادي',
  logo: '/assets/logo.png',
  defaultLayout: 'default',
  theme: 'auto',
  featuredChannelsLimit: 10,
  recentlyWatchedLimit: 6,
  showCategoriesOnHome: true,
  showCountriesOnHome: true,
  showFeaturedChannelsOnHome: true,
  showRecentlyWatchedOnHome: true,
  hideEmptyCategories: true,
  customCss: undefined,
  customJs: undefined,
  analyticEnabled: false,
  language: 'ar'
};

// مستخدم افتراضي للCMS (المسؤول)
export const defaultAdminUser: CMSUser = {
  id: 'admin-1',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  permissions: ['create', 'read', 'update', 'delete', 'publish'],
  active: true
};

// تخطيط افتراضي للصفحة الرئيسية
export const defaultHomeLayout: CMSLayout = {
  id: 'home-default',
  name: 'تخطيط الصفحة الرئيسية',
  type: 'home',
  blocks: ['featured-channels', 'categories-list', 'countries-grid'],
  active: true,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// كتل المحتوى الافتراضية
export const defaultContentBlocks: CMSContentBlock[] = [
  {
    id: 'featured-channels',
    title: 'القنوات المميزة',
    type: 'featured',
    content: { channelIds: [] },
    position: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 6,
      layout: 'carousel'
    }
  },
  {
    id: 'categories-list',
    title: 'الفئات',
    type: 'grid',
    content: { categoryIds: [] },
    position: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 10,
      layout: 'grid'
    }
  },
  {
    id: 'countries-grid',
    title: 'البلدان',
    type: 'grid',
    content: { countryIds: [] },
    position: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibleOn: ['home'],
    settings: {
      maxItems: 12,
      layout: 'grid'
    }
  }
];
