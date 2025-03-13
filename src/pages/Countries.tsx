import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Globe, Flag, Tv } from 'lucide-react';

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

  const activeCountryData = activeCountry && countries ? 
    countries.find(country => country.id === activeCountry) : 
    (countries && countries.length > 0 ? countries[0] : null);

  return (
    <div className="pb-20 pt-4">
      <header className="px-4 py-2 mb-6">
        <h1 className="text-2xl font-bold text-center">البلدان</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">اختر البلد لمشاهدة القنوات المتاحة</p>
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
          <div className="relative">
            <TabsList className="w-full overflow-x-auto flex justify-start mb-4 px-4 bg-transparent shadow-sm rounded-lg">
              {countries.map(country => (
                <TabsTrigger 
                  key={country.id} 
                  value={country.id}
                  className="px-6 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary"
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
            <TabsContent key={country.id} value={country.id} className="px-4 animate-in fade-in-50 duration-300">
              {isLoadingChannels ? (
                <div className="py-10 flex flex-col justify-center items-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-500">جاري تحميل قنوات {country.name}...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-6 gap-2 border-b pb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Tv className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">قنوات {country.name} <span className="text-xl mr-1">{country.flag}</span></h2>
                    <span className="text-muted-foreground text-sm mr-auto">
                      {countryChannels?.length || 0} قناة متاحة
                    </span>
                  </div>
                
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                      <div className="col-span-full py-10 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex justify-center mb-4">
                            <Globe className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-2 font-medium">لا توجد قنوات من {country.name} {country.flag}</p>
                          <p className="text-sm text-gray-400">سيتم إضافة قنوات جديدة قريبًا، يمكنك تصفح قنوات من بلدان أخرى</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Countries;
