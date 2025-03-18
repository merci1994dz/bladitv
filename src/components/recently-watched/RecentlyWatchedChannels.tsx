
import React from 'react';
import { Channel } from '@/types';
import { History, Clock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface RecentlyWatchedChannelsProps {
  channels: Channel[];
  isLoading: boolean;
  onChannelClick?: (channel: Channel) => void;
}

const RecentlyWatchedChannels: React.FC<RecentlyWatchedChannelsProps> = ({ 
  channels, 
  isLoading,
  onChannelClick 
}) => {
  if (isLoading || !channels || channels.length === 0) {
    return null;
  }

  // Handle channel click with optional callback
  const handleChannelClick = (channel: Channel) => {
    if (onChannelClick) {
      onChannelClick(channel);
    }
  };

  return (
    <section className="mb-4">
      <div className="container mx-auto">
        <div className="flex items-center mb-4">
          <div className="bg-primary/20 rounded-full p-2.5 mr-3 shadow-inner">
            <History className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            شوهدت مؤخراً
          </h2>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-5 space-x-reverse pb-3">
            {channels.map((channel) => (
              <div 
                key={channel.id} 
                className="w-32 shrink-0 transition-all hover:scale-110 cursor-pointer duration-300"
                onClick={() => handleChannelClick(channel)}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border/30 shadow-md bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group">
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="object-contain w-full h-full p-3 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/dark/light?text=TV';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                    <div className="flex items-center bg-black/60 rounded-full px-2 py-1">
                      <Clock className="w-3 h-3 text-white opacity-80 mr-1" />
                      <span className="text-xs text-white truncate">
                        {channel.lastWatched ? new Date(channel.lastWatched).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : new Date().toLocaleTimeString('ar-SA', {
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
