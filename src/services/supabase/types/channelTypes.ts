
import { Channel } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { StreamingLink } from '@/types/externalStreaming';

// واجهات لمطابقة أعمدة مخطط Supabase مع نماذج التطبيق
export interface SupabaseChannel {
  category: string;
  country: string;
  externallinks: Json | null;
  id: string;
  isfavorite: boolean | null;
  lastwatched: string | null;
  logo: string;
  name: string;
  streamurl: string;
}

// دوال التحويل بين نماذج التطبيق ومخطط Supabase
export const toChannel = (supabaseChannel: SupabaseChannel): Channel => ({
  id: supabaseChannel.id,
  name: supabaseChannel.name,
  logo: supabaseChannel.logo,
  streamUrl: supabaseChannel.streamurl,
  category: supabaseChannel.category,
  country: supabaseChannel.country,
  isFavorite: supabaseChannel.isfavorite || false,
  lastWatched: supabaseChannel.lastwatched,
  externalLinks: (supabaseChannel.externallinks as unknown as StreamingLink[]) || []
});

export const toSupabaseChannel = (channel: Omit<Channel, 'id'> | Channel): Omit<SupabaseChannel, 'id'> => ({
  name: channel.name,
  logo: channel.logo,
  streamurl: channel.streamUrl,
  category: channel.category,
  country: channel.country,
  isfavorite: channel.isFavorite,
  lastwatched: channel.lastWatched,
  externallinks: channel.externalLinks as unknown as Json
});
