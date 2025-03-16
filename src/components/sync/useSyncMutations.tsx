
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncWithSupabase } from '@/services/sync/supabaseSync';
import { forceDataRefresh } from '@/services/sync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { useToast } from '@/hooks/use-toast';

export const useSyncMutations = (refetchLastSync: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // تشغيل المزامنة مع Supabase
  const { mutate: runSync, isPending: isSyncing } = useMutation({
    mutationFn: () => syncWithSupabase(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastSync'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      refetchLastSync();
      
      toast({
        title: "تمت المزامنة",
        description: "تم تحديث البيانات بنجاح من Supabase",
      });
    },
    onError: (error) => {
      toast({
        title: "فشلت المزامنة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء التحديث",
        variant: "destructive",
      });
    }
  });

  // تشغيل المزامنة القسرية (للمشرفين فقط)
  const { mutate: runForceSync, isPending: isForceSyncing } = useMutation({
    mutationFn: forceDataRefresh,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "تم إعادة التحميل القسري",
        description: "تم مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات",
      });
    },
    onError: (error) => {
      toast({
        title: "فشلت عملية إعادة التحميل",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إعادة التحميل",
        variant: "destructive",
      });
    }
  });
  
  return {
    runSync,
    isSyncing,
    runForceSync,
    isForceSyncing,
    checkAvailableSource: checkBladiInfoAvailability
  };
};
