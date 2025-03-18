
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
    <section className="px-4 mb-10 animate-fade-in">
      <div className="mx-auto">
        {/* Active country details */}
        {activeCountryData && (
          <CountryDetails 
            country={activeCountryData} 
            channelsCount={channels?.length || 0}
            isTV={isTV}
          />
        )}
        
        {/* Loading state */}
        {isLoading ? (
          <div className="py-10 flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500">جاري تحميل قنوات {activeCountryData?.name}...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-${isTV ? '6' : '5'}`}>
            {channels && channels.length > 0 ? (
              channels.map(channel => (
                <div key={channel.id} className="transform hover:scale-105 transition-all duration-200">
                  <ChannelCard 
                    channel={channel} 
                    onPlay={onPlayChannel}
                    onToggleFavorite={onToggleFavorite}
                  />
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
