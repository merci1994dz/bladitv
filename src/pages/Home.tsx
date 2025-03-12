
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCategories, toggleFavoriteChannel } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";

const Home: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { toast } = useToast();

  const { 
    data: channels, 
    isLoading: isLoadingChannels,
    error: channelsError
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  });

  const { 
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleToggleFavorite = async (channelId: string) => {
    try {
      const updatedChannel = await toggleFavoriteChannel(channelId);
      toast({
        title: updatedChannel.isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
        description: `${updatedChannel.name} ${updatedChannel.isFavorite ? 'تمت إضافتها للمفضلة' : 'تمت إزالتها من المفضلة'}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر تحديث المفضلة",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (isLoadingChannels || isLoadingCategories) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (channelsError) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="text-center text-red-500">
          <p className="text-xl">حدث خطأ أثناء تحميل القنوات</p>
          <p>يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">بلادي TV</h1>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      <section className="px-4 mb-8">
        <h2 className="text-xl font-bold mb-4 text-right">القنوات الشائعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {channels?.slice(0, 6).map(channel => (
            <ChannelCard 
              key={channel.id} 
              channel={channel} 
              onPlay={handlePlayChannel}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      </section>

      {categories?.map(category => {
        const categoryChannels = channels?.filter(channel => channel.category === category.id) || [];
        if (categoryChannels.length === 0) return null;

        return (
          <section key={category.id} className="px-4 mb-8">
            <h2 className="text-xl font-bold mb-4 text-right">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryChannels.slice(0, 4).map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onPlay={handlePlayChannel}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Home;
