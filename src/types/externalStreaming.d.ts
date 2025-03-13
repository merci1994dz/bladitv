
// تصدير أنواع البيانات المتعلقة بالبث الخارجي
export type ExternalStreamingServiceType = 'youtube' | 'shahid' | 'rotana' | 'watan' | 'netflix' | string;

export interface ExternalStreamingProvider {
  id: string;
  name: string;
  type: ExternalStreamingServiceType;
  logoUrl: string;
  baseUrl: string;
  isEnabled: boolean;
  requiresAuth: boolean;
}

export interface StreamingLink {
  serviceId: string;
  channelId: string;
}
