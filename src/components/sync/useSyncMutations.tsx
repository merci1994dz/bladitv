
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncWithSupabase } from '@/services/sync/supabaseSync';
import { forceDataRefresh } from '@/services/sync';
import { checkBladiInfoAvailability } from '@/services/sync/remote/syncOperations';
import { useToast } from '@/hooks/use-toast';

export const useSyncMutations = (refetchLastSync: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // تشغيل المزامنة مع Supabase مع تحسين معالجة الأخطاء
  const { mutate: runSync, isPending: isSyncing } = useMutation({
    mutationFn: () => syncWithSupabase(true),
    onMutate: () => {
      // إظهار رسالة جاري المعالجة للمستخدم
      toast({
        title: "جاري المزامنة",
        description: "جاري تحديث البيانات من Supabase...",
      });
    },
    onSuccess: () => {
      // إبطال التخزين المؤقت لجميع البيانات ذات الصلة
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
      console.error('خطأ في المزامنة:', error);
      
      // رسالة خطأ أكثر تفصيلاً وفائدة
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التحديث";
      
      toast({
        title: "فشلت المزامنة",
        description: errorMessage.includes('network') || errorMessage.includes('connection')
          ? "تعذر الاتصال بـ Supabase. يرجى التحقق من اتصالك بالإنترنت."
          : errorMessage,
        variant: "destructive",
      });
      
      // إعادة المحاولة تلقائيًا بعد تأخير إذا كان الخطأ متعلقًا بالشبكة
      if (
        (errorMessage.includes('network') || 
         errorMessage.includes('connection') || 
         errorMessage.includes('timeout')) && 
        navigator.onLine
      ) {
        setTimeout(() => {
          console.log('إعادة محاولة المزامنة بعد فشل الشبكة...');
          runSync();
        }, 10000);
      }
    },
    retry: 2, // محاولة مرتين إضافيتين في حالة الفشل
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // زيادة التأخير بين المحاولات
  });

  // تشغيل المزامنة القسرية (للمشرفين فقط) مع تحسينات في معالجة الأخطاء
  const { mutate: runForceSync, isPending: isForceSyncing } = useMutation({
    mutationFn: forceDataRefresh,
    onMutate: () => {
      toast({
        title: "جاري التحديث القسري",
        description: "جاري مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات...",
      });
    },
    onSuccess: () => {
      // إبطال التخزين المؤقت لجميع الاستعلامات
      queryClient.invalidateQueries();
      
      toast({
        title: "تم إعادة التحميل القسري",
        description: "تم مسح ذاكرة التخزين المؤقت وإعادة تحميل البيانات بنجاح",
      });
    },
    onError: (error) => {
      console.error('خطأ في التحديث القسري:', error);
      
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إعادة التحميل";
      
      toast({
        title: "فشلت عملية إعادة التحميل",
        description: errorMessage,
        variant: "destructive",
      });
    },
    retry: 1, // محاولة واحدة إضافية فقط للتحديث القسري
  });
  
  return {
    runSync,
    isSyncing,
    runForceSync,
    isForceSyncing,
    checkAvailableSource: checkBladiInfoAvailability
  };
};
