
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel, playChannel } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Channel, Country } from '@/types';

export const useCountryChannels = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const location = useLocation();
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
      description: "يرجى الانتظار قليلاً...",
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

  return {
    countryId,
    country,
    channels,
    selectedChannel,
    setSelectedChannel,
    showProgramGuide,
    setShowProgramGuide,
    isLoadingCountry,
    isLoadingChannels,
    countryError,
    channelsError,
    handleChannelClick,
    handleToggleFavorite
  };
};
