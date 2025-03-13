
import React from 'react';
import { Channel, Country } from '@/types';
import ChannelCard from '@/components/ChannelCard';
import { Globe } from 'lucide-react';

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
  return (
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
        
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {channels && channels.length > 0 ? (
              channels.map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onPlay={onPlayChannel}
                  onToggleFavorite={onToggleFavorite}
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
  );
};

export default ChannelsList;
