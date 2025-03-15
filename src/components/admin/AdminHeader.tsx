
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RefreshCw, Globe } from 'lucide-react';
import { forceSync } from '@/services/api';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const AdminHeader: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const success = await forceSync();
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['channels'] });
        queryClient.invalidateQueries({ queryKey: ['countries'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast({
          title: "تم المزامنة بنجاح",
          description: "تم تحديث البيانات من الخادم",
        });
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "تعذر تحديث البيانات من الخادم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "تعذر الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">لوحة الإدارة</h1>
      <p className="text-muted-foreground">إدارة القنوات والبلدان في التطبيق</p>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={handleForceSync}
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة مع الخادم'}</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          asChild
        >
          <Link to="/remote-config">
            <Globe className="h-4 w-4" />
            <span>إعدادات التحديث عن بُعد</span>
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
