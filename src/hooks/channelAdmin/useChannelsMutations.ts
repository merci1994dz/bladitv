
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChannel, deleteChannel, addChannel as apiAddChannel } from '@/services/api';
import { Channel, AdminChannel } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers } from '@/services/sync';
import { saveChannelsToStorage } from '@/services/dataStore';

interface UseChannelsMutationsProps {
  autoPublish: boolean;
  toggleEditChannel: (id: string) => void;
}

/**
 * Hook for handling channel mutations (add, update, delete)
 */
export const useChannelsMutations = ({ 
  autoPublish,
  toggleEditChannel
}: UseChannelsMutationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // وظيفة حفظ تغييرات القناة
  const saveChannelChanges = (channel: AdminChannel) => {
    const { isEditing, ...channelData } = channel;
    updateChannelMutation.mutate(channelData as Channel);
    toggleEditChannel(channel.id);
  };
  
  // وظيفة حذف قناة
  const handleDeleteChannel = (id: string) => {
    deleteChannelMutation.mutate(id);
  };
  
  return {
    addChannel,
    saveChannelChanges,
    handleDeleteChannel
  };
};
