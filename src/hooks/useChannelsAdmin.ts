
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChannels, updateChannel, deleteChannel, addChannel as apiAddChannel } from '@/services/api';
import { Channel, AdminChannel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers } from '@/services/sync';
import { saveChannelsToStorage } from '@/services/dataStore';

interface UseChannelsAdminProps {
  autoPublish?: boolean;
}

export const useChannelsAdmin = ({ autoPublish = true }: UseChannelsAdminProps = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  
  // Add channel mutation
  const addChannelMutation = useMutation({
    mutationFn: apiAddChannel,
    onSuccess: async (newChannel) => {
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      
      // ضمان النشر للجميع
      await saveChannelsToStorage();
      
      // إظهار إشعار للمستخدم
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تمت إضافة قناة "${newChannel.name}" ${autoPublish ? 'ونشرها للمستخدمين' : ''}`,
      });
      
      // نشر القنوات لجميع المستخدمين (إذا كان التلقائي مفعل)
      if (autoPublish) {
        publishChannelsToAllUsers().catch(error => {
          console.error('خطأ في نشر القنوات للمستخدمين:', error);
          
          toast({
            title: "تنبيه",
            description: "تم إضافة القناة، لكن قد يكون هناك مشكلة في النشر التلقائي",
            variant: "destructive",
          });
        });
      }
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر إضافة القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update mutation - محسنة لضمان ظهور التغييرات
  const updateChannelMutation = useMutation({
    mutationFn: updateChannel,
    onSuccess: async (updatedChannel) => {
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      
      // ضمان النشر للجميع
      await saveChannelsToStorage();
      
      // إظهار إشعار للمستخدم
      toast({
        title: "تم التحديث",
        description: `تم تحديث بيانات قناة "${updatedChannel.name}" ${autoPublish ? 'ونشرها للمستخدمين' : ''}`,
      });
      
      // نشر التغييرات لجميع المستخدمين (إذا كان التلقائي مفعل)
      if (autoPublish) {
        publishChannelsToAllUsers().catch(error => {
          console.error('خطأ في نشر التغييرات للمستخدمين:', error);
          
          toast({
            title: "تنبيه",
            description: "تم تحديث القناة، لكن قد يكون هناك مشكلة في النشر التلقائي",
            variant: "destructive",
          });
        });
      }
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر تحديث القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete mutation - محسنة لضمان تحديث القنوات
  const deleteChannelMutation = useMutation({
    mutationFn: deleteChannel,
    onSuccess: async () => {
      // إعادة تحميل البيانات
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      
      // ضمان تحديث القائمة
      await saveChannelsToStorage();
      
      // إظهار إشعار للمستخدم
      toast({
        title: "تم الحذف",
        description: `تم حذف القناة بنجاح ${autoPublish ? 'ونشر التغييرات للمستخدمين' : ''}`,
      });
      
      // نشر التغييرات لجميع المستخدمين (إذا كان التلقائي مفعل)
      if (autoPublish) {
        publishChannelsToAllUsers().catch(error => {
          console.error('خطأ في نشر التغييرات للمستخدمين بعد الحذف:', error);
          
          toast({
            title: "تنبيه",
            description: "تم حذف القناة، لكن قد يكون هناك مشكلة في النشر التلقائي",
            variant: "destructive",
          });
        });
      }
    },
    onError: (error) => {
      toast({
        title: "حدث خطأ",
        description: `تعذر حذف القناة: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // وظيفة إضافة قناة
  const addChannel = (channelData: Omit<Channel, 'id'>) => {
    addChannelMutation.mutate(channelData);
  };
  
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
  
  // وظيفة مزامنة القنوات يدويًا وضمان نشرها للمستخدمين
  const manualSyncChannels = async () => {
    toast({
      title: "جاري المزامنة",
      description: "جاري تحديث قائمة القنوات ونشرها للمستخدمين...",
    });
    
    try {
      // نشر التغييرات مع إجبار إعادة تحميل الصفحة
      await publishChannelsToAllUsers();
      await refetchChannels();
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث القنوات بنجاح ونشرها للمستخدمين",
      });
    } catch (error) {
      console.error('خطأ في مزامنة القنوات:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء مزامنة القنوات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
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
