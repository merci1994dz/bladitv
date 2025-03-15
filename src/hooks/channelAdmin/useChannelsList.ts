
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChannels } from '@/services/api';
import { AdminChannel } from '@/types';

/**
 * Hook for managing the list of editable channels
 */
export const useChannelsList = () => {
  const [editableChannels, setEditableChannels] = useState<AdminChannel[]>([]);
  
  // Query channels data
  const { 
    data: channels,
    isLoading: isLoadingChannels,
    refetch: refetchChannels
  } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels
  });

  // Use useEffect to handle the data
  useEffect(() => {
    if (channels) {
      setEditableChannels(channels.map(channel => ({ ...channel, isEditing: false })));
    }
  }, [channels]);
  
  // Channel editing functions
  const toggleEditChannel = (id: string) => {
    setEditableChannels(channels => channels.map(channel => 
      channel.id === id 
        ? { ...channel, isEditing: !channel.isEditing } 
        : channel
    ));
  };
  
  const updateEditableChannel = (id: string, field: keyof AdminChannel, value: string) => {
    setEditableChannels(channels => channels.map(channel => 
      channel.id === id 
        ? { ...channel, [field]: value } 
        : channel
    ));
  };
  
  return {
    editableChannels,
    isLoadingChannels,
    refetchChannels,
    toggleEditChannel,
    updateEditableChannel,
    setEditableChannels
  };
};
