
import React from 'react';
import { Channel } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ChannelCard from '@/components/ChannelCard';

interface HistoryChannelListProps {
  isLoading: boolean;
  channels: Channel[];
  onPlayChannel: (channel: Channel) => void;
  onToggleFavorite: (channelId: string) => void;
}

const HistoryChannelList: React.FC<HistoryChannelListProps> = ({
  isLoading,
  channels,
  onPlayChannel,
  onToggleFavorite
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-center my-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-3 w-20 h-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onPlay={onPlayChannel}
          onToggleFavorite={onToggleFavorite}
          lastWatched={(channel as any).lastWatched}
        />
      ))}
    </div>
  );
};

export default HistoryChannelList;
