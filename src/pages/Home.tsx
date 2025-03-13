
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import HomeHeader from '@/components/header/HomeHeader';
import CountriesList from '@/components/country/CountriesList';
import ChannelsList from '@/components/channel/ChannelsList';

const Home: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    data: countries,
    isLoading: isLoadingCountries,
    error: countriesError
  } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  const { 
    data: countryChannels,
    isLoading: isLoadingChannels,
  } = useQuery({
    queryKey: ['channelsByCountry', activeCountry],
    queryFn: () => activeCountry ? getChannelsByCountry(activeCountry) : Promise.resolve([]),
    enabled: !!activeCountry,
  });

  const handleCountryClick = (countryId: string) => {
    setActiveCountry(countryId);
  };

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

  if (isLoadingCountries) {
    return <LoadingSpinner />;
  }

  if (countriesError) {
    return <ErrorMessage />;
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      <HomeHeader />

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      <CountriesList 
        countries={countries} 
        activeCountry={activeCountry} 
        onCountryClick={handleCountryClick} 
      />

      {activeCountry && (
        <ChannelsList 
          channels={countryChannels}
          countries={countries}
          activeCountry={activeCountry}
          isLoading={isLoadingChannels}
          onPlayChannel={handlePlayChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default Home;
