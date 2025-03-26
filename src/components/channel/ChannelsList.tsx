
import React from 'react';
import { Channel, Country } from '@/types';
import ChannelCard from '@/components/ChannelCard';
import CountryDetails from '../country/CountryDetails';
import EmptyChannelsList from './EmptyChannelsList';
import { useDeviceType } from '@/hooks/use-tv';

interface ChannelsListProps {
  channels: Channel[] | undefined;
  countries: Country[] | undefined;
  activeCountry: string | null;
  isLoading: boolean;
  onPlayChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const ChannelsList: React.FC<ChannelsListProps> = ({
  channels,
  countries,
  activeCountry,
  isLoading,
  onPlayChannel,
  onToggleFavorite
}) => {
  const { isTV } = useDeviceType();
  const activeCountryData = countries?.find(c => c.id === activeCountry);
  
  return (
    <section className="px-2 mb-10 animate-fade-in">
      <div className="mx-auto">
        {/* تفاصيل البلد النشط */}
        {activeCountryData && (
          <CountryDetails 
            country={activeCountryData} 
            channelsCount={channels?.length || 0}
            isTV={isTV}
          />
        )}
        
        {/* حالة التحميل */}
        {isLoading ? (
          <div className="py-10 flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-muted-foreground">جاري تحميل قنوات {activeCountryData?.name}...</p>
          </div>
        ) : (
          <div className="tv-channel-grid">
            {channels && channels.length > 0 ? (
              channels.map(channel => (
                <div key={channel.id} className="transition-all duration-300">
                  <div className="tv-channel-card">
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="tv-channel-logo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'public/lovable-uploads/7767e4e3-bb19-4d88-905f-ca592b2eca1e.png';
                      }}
                    />
                    <div className="tv-channel-name">
                      {channel.name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyChannelsList 
                countryName={activeCountryData?.name || ''}
                countryFlag={activeCountryData?.flag || ''}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ChannelsList;
