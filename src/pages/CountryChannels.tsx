
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  getCountries, 
  getChannelsByCountry, 
  toggleFavoriteChannel, 
  playChannel 
} from '@/services/api';
import ChannelsList from '@/components/channel/ChannelsList';
import CountryDetails from '@/components/country/CountryDetails';
import VideoPlayer from '@/components/VideoPlayer';
import { Channel, Country } from '@/types';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-tv';
import ProgramGuide from '@/components/guide/ProgramGuide';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CountryChannels: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTV } = useDeviceType();
  const { toast } = useToast();
  
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showProgramGuide, setShowProgramGuide] = useState(false);

  // استعلام لجلب بيانات البلد
  const { 
    data: country,
    isLoading: isLoadingCountry,
    error: countryError
  } = useQuery({
    queryKey: ['country', countryId],
    queryFn: async () => {
      if (!countryId) return Promise.reject('No country ID');
      
      // Get all countries and find the one with matching ID
      const countries = await getCountries();
      const foundCountry = countries.find(c => c.id === countryId);
      
      if (!foundCountry) {
        throw new Error('Country not found');
      }
      
      return foundCountry;
    },
    enabled: !!countryId,
  });
  
  // استعلام لجلب قنوات البلد
  const { 
    data: channels, 
    isLoading: isLoadingChannels,
    error: channelsError,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['channelsByCountry', countryId],
    queryFn: () => countryId ? getChannelsByCountry(countryId) : Promise.reject('No country ID'),
    enabled: !!countryId,
  });

  // التحقق من وجود قناة محددة في الـ state عند تحميل الصفحة
  useEffect(() => {
    const state = location.state as { selectedChannelId?: string } | null;
    if (state?.selectedChannelId && channels) {
      const channel = channels.find(c => c.id === state.selectedChannelId);
      if (channel) {
        setSelectedChannel(channel);
      }
    }
  }, [location.state, channels]);

  // معالج النقر على قناة
  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
    
    // تسجيل المشاهدة
    playChannel(channel.id).catch(console.error);
    
    // إظهار إشعار
    toast({
      title: `جاري تشغيل ${channel.name}`,
      description: isTV ? "استخدم أزرار التنقل للتحكم" : "يرجى الانتظار قليلاً...",
      duration: 3000,
    });
  };

  // معالج تبديل المفضلة
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

  // عرض شاشة التحميل
  if (isLoadingCountry || isLoadingChannels) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // عرض رسالة الخطأ
  if (countryError || channelsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 min-h-screen">
      {/* رأس الصفحة */}
      <header className="px-4 py-2 mb-2 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/countries')}
            className="mr-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className={`text-xl font-bold ${isTV ? 'tv-text text-2xl' : ''}`}>
            {country?.name || 'تحميل البلد...'}
          </h1>
        </div>

        {/* زر دليل البرامج */}
        {isTV ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowProgramGuide(!showProgramGuide)}
            className={`${isTV ? 'tv-focus-item px-4 py-2' : ''}`}
          >
            <Calendar className="h-4 w-4 mr-1" />
            <span>دليل البرامج</span>
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>دليل البرامج</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg">
              <ProgramGuide 
                channelId={selectedChannel?.id}
                onSelectProgram={() => {}} // يمكن إضافة وظيفة للتفاعل مع البرامج المحددة
              />
            </SheetContent>
          </Sheet>
        )}
      </header>

      {/* مشغل الفيديو للقناة المحددة */}
      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {/* عرض تفاصيل البلد والقنوات */}
      <div className="flex flex-col md:flex-row">
        <div className={`w-full ${showProgramGuide && isTV ? 'md:w-2/3' : 'w-full'}`}>
          {country && (
            <div className="px-4">
              <CountryDetails 
                country={country} 
                channelsCount={channels?.length || 0} 
                isTV={isTV}
              />
            </div>
          )}

          <ChannelsList 
            channels={channels}
            countries={[country!]}
            activeCountry={countryId || null}
            isLoading={isLoadingChannels}
            onPlayChannel={handleChannelClick}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
        
        {/* دليل البرامج - يظهر فقط على أجهزة التلفزيون عند الطلب */}
        {showProgramGuide && isTV && (
          <div className="md:w-1/3 p-4">
            <ProgramGuide 
              channelId={selectedChannel?.id}
              onSelectProgram={() => {}} // يمكن إضافة وظيفة للتفاعل مع البرامج المحددة
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryChannels;
