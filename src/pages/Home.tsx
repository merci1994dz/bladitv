
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel, Country } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Tv, Globe } from 'lucide-react';

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
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary font-semibold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (countriesError) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl shadow-xl border border-red-200 dark:border-red-800 animate-fade-in">
          <p className="text-2xl text-red-600 dark:text-red-400 mb-3 font-bold">حدث خطأ أثناء تحميل البلدان</p>
          <p className="text-gray-600 dark:text-gray-400">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* شعار التطبيق وشريط العنوان المحسن */}
      <header className="bg-gradient-to-r from-primary/20 via-primary/15 to-primary/5 py-6 mb-8 shadow-md">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center">
            {/* شعار التطبيق */}
            <div className="flex items-center mb-3">
              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-3 mr-3 shadow-lg">
                <Tv className="text-white h-8 w-8" />
              </div>
              <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                بلادي TV
              </h1>
            </div>
            <div className="flex items-center mt-2">
              <div className="bg-gradient-to-r from-blue-600 to-primary rounded-full p-2 mr-2 shadow-md">
                <Globe className="text-white h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300">
                تصفح حسب البلد
              </h2>
            </div>
            <p className="text-center text-muted-foreground mt-2 text-sm">اختر البلد لمشاهدة القنوات المتاحة</p>
          </div>
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {/* قسم البلدان - تصميم محسن */}
      <section className="px-4 mb-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {countries?.map(country => (
              <CountryCard 
                key={country.id} 
                country={country} 
                onClick={handleCountryClick}
                isActive={activeCountry === country.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* عرض قنوات البلد المختار - تصميم محسن */}
      {activeCountry && (
        <section className="px-4 mb-10">
          <div className="container mx-auto">
            <div className="flex items-center mb-6 bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg">
              {countries && (
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="text-4xl mr-2">{countries.find(c => c.id === activeCountry)?.flag}</span>
                  <span>قنوات {countries.find(c => c.id === activeCountry)?.name}</span>
                </h2>
              )}
            </div>
            
            {isLoadingChannels ? (
              <div className="py-10 flex justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
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
                      <p className="text-gray-500 mb-2 font-medium">لا توجد قنوات متاحة في هذا البلد</p>
                      <p className="text-sm text-gray-400">يرجى اختيار بلد آخر</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

// مكون بطاقة البلد بتصميم محسن
interface CountryCardProps {
  country: Country;
  onClick: (countryId: string) => void;
  isActive?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, onClick, isActive }) => {
  return (
    <button 
      onClick={() => onClick(country.id)}
      className={`relative overflow-hidden h-32 sm:h-36 group rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-2 ${isActive ? 'border-primary' : 'border-transparent'} w-full`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>
      <img 
        src={country.image} 
        alt={country.name}
        className="absolute inset-0 w-full h-full object-cover z-[-1] transition-transform duration-500 group-hover:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1589519160732-57fc498494f8?q=80&w=500&auto=format&fit=crop';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-white font-bold text-xl text-center shadow-text px-2 transform transition-transform duration-300 group-hover:scale-110">{country.name}</h3>
          <p className="text-white/90 text-2xl mt-1">{country.flag}</p>
        </div>
      </div>
      {/* إضافة شريط تفاعلي عند مرور المؤشر */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </button>
  );
};

export default Home;
