
import { useChannelsList, useChannelsMutations, useChannelsSync } from './channelAdmin';
import { AdminChannel } from '@/types';
import { Channel } from '@/types';

interface UseChannelsAdminProps {
  autoPublish?: boolean;
}

export const useChannelsAdmin = ({ autoPublish = true }: UseChannelsAdminProps = {}) => {
  // Use the channel list hook
  const {
    editableChannels,
    isLoadingChannels,
    refetchChannels,
    toggleEditChannel,
    updateEditableChannel
  } = useChannelsList();
  
  // Use the channel mutations hook
  const {
    addChannel,
    saveChannelChanges,
    handleDeleteChannel
  } = useChannelsMutations({
    autoPublish,
    toggleEditChannel
  });
  
  // Use the channel sync hook
  const {
    manualSyncChannels
  } = useChannelsSync(refetchChannels);
  
  return {
    editableChannels,
    isLoadingChannels,
    addChannel,
    toggleEditChannel,
    updateEditableChannel,
    saveChannelChanges,
    handleDeleteChannel,
    manualSyncChannels
  };
};
