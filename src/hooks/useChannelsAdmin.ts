
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChannels, updateChannel, deleteChannel } from '@/services/api';
import { Channel, AdminChannel } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useChannelsAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editableChannels, setEditableChannels] = useState<AdminChannel[]>([]);
  
  // Query channels data
  const { 
    data: channels,
    isLoading: isLoadingChannels
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
  
  // Update mutation
  const updateChannelMutation = useMutation({
    mutationFn: updateChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات القناة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر تحديث القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete mutation
  const deleteChannelMutation = useMutation({
    mutationFn: deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف القناة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر حذف القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
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
  
  const saveChannelChanges = (channel: AdminChannel) => {
    const { isEditing, ...channelData } = channel;
    updateChannelMutation.mutate(channelData as Channel);
    toggleEditChannel(channel.id);
  };
  
  const handleDeleteChannel = (id: string) => {
    deleteChannelMutation.mutate(id);
  };
  
  return {
    editableChannels,
    isLoadingChannels,
    toggleEditChannel,
    updateEditableChannel,
    saveChannelChanges,
    handleDeleteChannel
  };
};
