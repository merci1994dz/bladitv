
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels, getCountries, toggleFavoriteChannel } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Link } from 'react-router-dom';

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
    data: countries,
    isLoading: isLoadingCountries,
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
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

  if (isLoadingChannels || isLoadingCountries) {
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {countries?.map(country => (
            <Link 
              key={country.id} 
              to={`/countries`}
              className="relative bg-gradient-to-t from-black/60 via-black/20 to-black/5 rounded-lg overflow-hidden h-24 group"
            >
              <img 
                src={country.image} 
                alt={country.name}
                className="absolute inset-0 w-full h-full object-cover z-[-1] transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl mb-1">{country.flag}</span>
                <h3 className="text-white font-semibold text-center text-sm">{country.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
