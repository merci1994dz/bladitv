
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecentlyWatchedChannels } from '@/services/api';
import { Channel } from '@/types';
import { History, Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RecentlyWatchedChannelsProps {
  onChannelClick: (channel: Channel) => void;
}

const RecentlyWatchedChannels: React.FC<RecentlyWatchedChannelsProps> = ({ onChannelClick }) => {
  const { 
    data: recentChannels,
    isLoading 
  } = useQuery({
    queryKey: ['recentlyWatched'],
    queryFn: getRecentlyWatchedChannels,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading || !recentChannels || recentChannels.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-primary/80 to-primary rounded-full p-2 mr-2 shadow-sm">
            <History className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">شوهدت مؤخراً</h2>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 space-x-reverse pb-2">
            {recentChannels.map((channel) => (
              <div 
                key={channel.id} 
                className="w-28 shrink-0 transition-all hover:scale-105 cursor-pointer"
                onClick={() => onChannelClick(channel)}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg border border-border/50 shadow-md bg-card">
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="object-contain w-full h-full p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/dark/light?text=TV';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 text-white opacity-70 mr-1" />
                      <span className="text-xs text-white truncate">
                        {new Date(channel.lastWatched || Date.now()).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-medium text-foreground truncate text-center">{channel.name}</h3>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default RecentlyWatchedChannels;
