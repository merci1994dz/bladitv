
import React from 'react';
import { AdminChannel } from '@/types';
import ChannelItem from './ChannelItem';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface ChannelsListProps {
  channels: AdminChannel[];
  countries: any[];
  categories: any[];
  onEdit: (channelId: string) => void;
  onSave: (channel: AdminChannel) => void;
  onDelete: (channelId: string) => void;
  onUpdateField: (id: string, field: keyof AdminChannel, value: string) => void;
}

const ChannelsList: React.FC<ChannelsListProps> = ({
  channels,
  countries,
  categories,
  onEdit,
  onSave,
  onDelete,
  onUpdateField
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const channelsPerPage = 10;
  
  // Calculate pagination
  const indexOfLastChannel = currentPage * channelsPerPage;
  const indexOfFirstChannel = indexOfLastChannel - channelsPerPage;
  const currentChannels = channels.slice(indexOfFirstChannel, indexOfLastChannel);
  const totalPages = Math.ceil(channels.length / channelsPerPage);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mt-8 mb-4">قائمة القنوات ({channels.length})</h2>
      
      {currentChannels.map(channel => (
        <ChannelItem 
          key={channel.id}
          channel={channel}
          countries={countries}
          categories={categories}
          onEdit={onEdit}
          onSave={onSave}
          onDelete={onDelete}
          onUpdateField={onUpdateField}
        />
      ))}
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => prev - 1)} 
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ChannelsList;
