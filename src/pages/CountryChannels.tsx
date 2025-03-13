
import React from 'react';
import { useDeviceType } from '@/hooks/use-tv';
import { useCountryChannels } from '@/hooks/useCountryChannels';
import ChannelsList from '@/components/channel/ChannelsList';
import CountryPageHeader from '@/components/country/CountryPageHeader';
import CountryProgramGuide from '@/components/country/CountryProgramGuide';
import VideoPlayer from '@/components/VideoPlayer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';

const CountryChannels: React.FC = () => {
  const { isTV } = useDeviceType();
  const {
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
  } = useCountryChannels();

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
      <CountryPageHeader 
        countryName={country?.name || ''}
        selectedChannelId={selectedChannel?.id}
        showProgramGuide={showProgramGuide}
        setShowProgramGuide={setShowProgramGuide}
      />

      {/* مشغل الفيديو للقناة المحددة */}
      {selectedChannel && (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setSelectedChannel(null)} 
        />
      )}

      {/* عرض القنوات ودليل البرامج */}
      <div className="flex flex-col md:flex-row">
        <div className={`w-full ${showProgramGuide && isTV ? 'md:w-2/3' : 'w-full'}`}>
          <ChannelsList 
            channels={channels}
            countries={country ? [country] : []}
            activeCountry={country?.id || null}
            isLoading={isLoadingChannels}
            onPlayChannel={handleChannelClick}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
        
        {/* دليل البرامج - يظهر فقط على أجهزة التلفزيون عند الطلب */}
        <CountryProgramGuide 
          show={showProgramGuide && isTV} 
          channelId={selectedChannel?.id} 
        />
      </div>
    </div>
  );
};

export default CountryChannels;
