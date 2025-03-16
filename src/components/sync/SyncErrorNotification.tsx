
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncErrorNotificationProps {
  syncError: string | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({ syncError }) => {
  const { toast } = useToast();
  
  // Display error toast if sync error persists
  useEffect(() => {
    if (syncError) {
      const errorTimeout = setTimeout(() => {
        toast({
          title: "خطأ في المزامنة",
          description: "تعذر تحديث البيانات من Supabase. سيتم إعادة المحاولة تلقائيًا.",
          variant: "destructive",
          duration: 5000,
        });
      }, 5000);
      
      return () => clearTimeout(errorTimeout);
    }
  }, [syncError, toast]);
  
  // This is a notification component with no UI of its own
  return null;
};

export default SyncErrorNotification;
