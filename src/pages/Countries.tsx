
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Globe, Flag } from 'lucide-react';

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

  // Set the first country as active when countries are loaded
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
      // Refresh the channels list
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
            <TabsList className="w-full overflow-x-auto flex justify-start mb-4 px-4 bg-transparent">
              {countries.map(country => (
                <TabsTrigger 
                  key={country.id} 
                  value={country.id}
                  className="px-6 py-2 flex items-center gap-3 transition-all duration-200 hover:bg-primary/10"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>

          {/* Country image banner */}
          {activeCountryData && (
            <div className="relative h-40 md:h-56 lg:h-64 mb-6 overflow-hidden rounded-lg mx-4">
              <img 
                src={activeCountryData.image} 
                alt={activeCountryData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 right-0 p-4 flex items-center gap-3">
                <span className="text-5xl">{activeCountryData.flag}</span>
                <h2 className="text-white text-2xl font-bold">{activeCountryData.name}</h2>
              </div>
            </div>
          )}
          
          {countries.map(country => (
            <TabsContent key={country.id} value={country.id} className="px-4 animate-fade-in">
              {isLoadingChannels ? (
                <div className="py-10 flex flex-col justify-center items-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-gray-500">جاري تحميل القنوات...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-4 gap-2">
                    <Flag className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">قنوات {country.name}</h2>
                  </div>
                
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
                      <div className="col-span-full py-10 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                          <div className="flex justify-center mb-4">
                            <Globe className="h-10 w-10 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-2">لا توجد قنوات من {country.name}</p>
                          <p className="text-sm text-gray-400">يمكنك مشاهدة قنوات من بلدان أخرى أو العودة لاحقًا</p>
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
