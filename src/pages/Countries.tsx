
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Tab, Tabs, TabList, TabPanel } from '@/components/ui/tabs';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";

const Countries: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { toast } = useToast();

  const { 
    data: countries,
    isLoading: isLoadingCountries,
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

  const handleTabChange = (countryId: string) => {
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
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">البلدان</h1>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {countries && countries.length > 0 && (
        <Tabs defaultValue={countries[0].id} dir="rtl" className="w-full">
          <TabsList className="w-full overflow-x-auto flex justify-start mb-4 px-4 bg-transparent">
            {countries.map(country => (
              <TabsTrigger 
                key={country.id} 
                value={country.id}
                onClick={() => handleTabChange(country.id)}
                className="px-6 py-2"
              >
                <span className="ml-2">{country.flag}</span>
                {country.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {countries.map(country => (
            <TabsContent key={country.id} value={country.id} className="px-4">
              {isLoadingChannels ? (
                <div className="py-10 flex justify-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {countryChannels && countryChannels.length > 0 ? (
                    countryChannels.map(channel => (
                      <ChannelCard 
                        key={channel.id} 
                        channel={channel} 
                        onPlay={handlePlayChannel}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-gray-500">
                      لا توجد قنوات من هذا البلد
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Countries;
