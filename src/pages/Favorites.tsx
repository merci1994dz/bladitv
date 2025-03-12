
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFavoriteChannels, toggleFavoriteChannel } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Favorites: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { toast } = useToast();

  const { 
    data: favoriteChannels,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['favoriteChannels'],
    queryFn: getFavoriteChannels,
  });

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleToggleFavorite = async (channelId: string) => {
    try {
      const updatedChannel = await toggleFavoriteChannel(channelId);
      toast({
        title: "تمت الإزالة من المفضلة",
        description: `${updatedChannel.name} تمت إزالتها من المفضلة`,
        duration: 2000,
      });
      refetch(); // تحديث القائمة بعد الإزالة
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث المفضلة",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">المفضلة</h1>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      <div className="px-4">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {favoriteChannels && favoriteChannels.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favoriteChannels.map(channel => (
                  <ChannelCard 
                    key={channel.id} 
                    channel={channel} 
                    onPlay={handlePlayChannel}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Heart size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-500 mb-2">لا توجد قنوات مفضلة</p>
                <p className="text-gray-400">أضف قنواتك المفضلة للوصول إليها بسرعة</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;
