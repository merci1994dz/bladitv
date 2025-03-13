
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCountries, getChannelsByCountry, toggleFavoriteChannel } from '@/services/api';
import { Channel } from '@/types';
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import ChannelsList from '@/components/channel/ChannelsList';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CountryChannels: React.FC = () => {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
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
    data: channels,
    isLoading: isLoadingChannels,
  } = useQuery({
    queryKey: ['channelsByCountry', countryId],
    queryFn: () => countryId ? getChannelsByCountry(countryId) : Promise.resolve([]),
    enabled: !!countryId,
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

  const countryName = countries?.find(c => c.id === countryId)?.name || 'البلد';

  if (isLoadingCountries) {
    return <LoadingSpinner />;
  }

  if (countriesError) {
    return <ErrorMessage />;
  }

  return (
    <div className="pb-24 min-h-screen bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <header className="bg-gradient-to-b from-background to-muted p-4 shadow-sm">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/home')}
          >
            <ArrowRight className="mr-2" />
            العودة
          </Button>
          
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/home')}>
                  <Home className="h-4 w-4 mr-1" />
                  <span>الرئيسية</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {countries?.find(c => c.id === countryId)?.flag} {countryName}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <h1 className="text-2xl font-bold mt-4 flex items-center">
            <span className="text-4xl mr-2">{countries?.find(c => c.id === countryId)?.flag}</span>
            <span>قنوات {countryName}</span>
          </h1>
        </div>
      </header>

      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {countryId && (
        <ChannelsList 
          channels={channels}
          countries={countries}
          activeCountry={countryId}
          isLoading={isLoadingChannels}
          onPlayChannel={handlePlayChannel}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default CountryChannels;
