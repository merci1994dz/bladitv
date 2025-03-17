
import { Channel } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { StreamingLink } from '@/types/externalStreaming';

// واجهات لمطابقة أعمدة مخطط Supabase مع نماذج التطبيق
export interface SupabaseChannel {
  category: string;
  country: string;
  external_links: Json | null;
  id: string;
  is_favorite: boolean | null;  // تم تحديث الاسم من isfavorite إلى is_favorite
  last_watched: string | null;  // تم تحديث الاسم من lastwatched إلى last_watched
  logo: string;
  name: string;
  stream_url: string;  // تم تحديث الاسم من streamurl إلى stream_url
}

// دوال التحويل بين نماذج التطبيق ومخطط Supabase
export const toChannel = (supabaseChannel: SupabaseChannel): Channel => ({
  id: supabaseChannel.id,
  name: supabaseChannel.name,
  logo: supabaseChannel.logo,
  streamUrl: supabaseChannel.stream_url,
  category: supabaseChannel.category,
  country: supabaseChannel.country,
  isFavorite: supabaseChannel.is_favorite || false,
  lastWatched: supabaseChannel.last_watched,
  externalLinks: (supabaseChannel.external_links as unknown as StreamingLink[]) || []
});

export const toSupabaseChannel = (channel: Omit<Channel, 'id'> | Channel): Omit<SupabaseChannel, 'id'> => ({
  name: channel.name,
  logo: channel.logo,
  stream_url: channel.streamUrl,
  category: channel.category,
  country: channel.country,
  is_favorite: channel.isFavorite,  // تحويل من isFavorite (كاملكيس) إلى is_favorite (snake_case)
  last_watched: channel.lastWatched,
  external_links: channel.externalLinks as unknown as Json
});
