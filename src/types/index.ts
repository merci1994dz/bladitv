
export interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
  country: string;
  isFavorite: boolean;
  externalLinks?: StreamingLink[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  image: string;
}

// New types for admin functionality
export interface AdminChannel extends Channel {
  isEditing?: boolean;
}

export interface AdminCountry extends Country {
  isEditing?: boolean;
}

// New types for remote admin configuration
export interface RemoteAdminConfig {
  enabled: boolean;
  adminUrl: string;
  lastSyncTime?: string;
}

// استيراد نوع StreamingLink من ملف externalStreaming.d.ts
import { StreamingLink } from './externalStreaming';

// New type for program guides
export interface TVProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  genre: string;
  isLive: boolean;
}

// User settings type
export interface UserInterfaceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  layout: 'grid' | 'list';
  animations: boolean;
}

// Device information
export interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'unknown';
  lastSync: string;
}
