
// أنواع خدمات البث الخارجية
export type ExternalStreamingService = 
  | 'youtube' 
  | 'netflix' 
  | 'shahid' 
  | 'rotana' 
  | 'watan' 
  | 'directv' 
  | 'custom';

export interface ExternalStreamingProvider {
  id: string;
  name: string;
  type: ExternalStreamingService;
  logoUrl: string;
  baseUrl: string;
  isEnabled: boolean;
  requiresAuth: boolean;
}

export interface StreamingLink {
  serviceId: string;
  channelId: string;
  url: string;
}

// توسيع نوع القناة لدعم الخدمات الخارجية
declare module '@/types' {
  interface Channel {
    externalLinks?: StreamingLink[];
  }
}
