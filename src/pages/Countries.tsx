
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChannelsList from '@/components/channel/ChannelsList';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { useDeviceType } from '@/hooks/use-tv';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Countries: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isTV } = useDeviceType();

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
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['channelsByCountry', activeCountry],
    queryFn: () => activeCountry ? getChannelsByCountry(activeCountry) : Promise.resolve([]),
    enabled: !!activeCountry,
  });

  useEffect(() => {
    if (countries && countries.length > 0 && !activeCountry) {
      setActiveCountry(countries[0].id);
    }
  }, [countries, activeCountry]);

  const handleTabChange = (countryId: string) => {
    setActiveCountry(countryId);
    refetchChannels();
  };

  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    
    // إضافة إشعار للمستخدم
    toast({
      title: `جاري تشغيل ${channel.name}`,
      description: isTV ? "استخدم أزرار التنقل للتحكم" : "يرجى الانتظار قليلاً...",
      duration: 3000,
    });
  };

  const handleToggleFavorite = async (channelId: string) => {
    try {
      const updatedChannel = await toggleFavoriteChannel(channelId);
      toast({
        title: updatedChannel.isFavorite ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة",
        description: `${updatedChannel.name} ${updatedChannel.isFavorite ? 'تمت إضافتها للمفضلة' : 'تمت إزالتها من المفضلة'}`,
        duration: 2000,
      });
      refetchChannels();
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 animate-pulse">جاري تحميل البلدان...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 min-h-screen">
      <header className="px-4 py-2 mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/home')}
          className="mr-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className={`text-2xl font-bold ${isTV ? 'tv-text' : ''}`}>البلدان</h1>
        <div className="flex-grow"></div>
        <div className="p-1 bg-primary/10 rounded-full">
          <Globe className="h-5 w-5 text-primary" />
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {countries && countries.length > 0 && (
        <Tabs 
          value={activeCountry || countries[0].id} 
          onValueChange={handleTabChange}
          dir="rtl" 
          className="w-full"
        >
          <div className="relative px-4">
            <TabsList className={`w-full overflow-x-auto flex justify-start mb-4 bg-transparent shadow-sm rounded-lg ${isTV ? 'p-2' : 'p-1'}`}>
              {countries.map(country => (
                <TabsTrigger 
                  key={country.id} 
                  value={country.id}
                  className={`px-6 py-3 flex items-center gap-3 transition-all duration-200 
                    hover:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary
                    ${isTV ? 'tv-focus-item text-lg' : ''}`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
          
          {countries.map(country => (
            <TabsContent key={country.id} value={country.id} className="animate-in fade-in-50 duration-300">
              <ChannelsList 
                channels={countryChannels}
                countries={countries}
                activeCountry={activeCountry}
                isLoading={isLoadingChannels}
                onPlayChannel={handlePlayChannel}
                onToggleFavorite={handleToggleFavorite}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Countries;
