
import React from 'react';
import { Button } from "@/components/ui/button";
import { checkSupabaseConnection } from '@/services/sync/supabase/connection/connectionCheck';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseTableStats } from '@/services/sync/supabase/connection/connectionCheck';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface SupabaseConnectionStatusProps {
  onConnectionCheck?: () => void;
  showDetails?: boolean;
}

const SupabaseConnectionStatus: React.FC<SupabaseConnectionStatusProps> = ({ 
  onConnectionCheck,
  showDetails = false
}) => {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [tableStats, setTableStats] = React.useState<Record<string, number> | null>(null);
  const [lastChecked, setLastChecked] = React.useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setIsChecking(true);
      const isConnected = await checkSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected && showDetails) {
        const stats = await getSupabaseTableStats();
        setTableStats(stats);
      }
      
      setLastChecked(new Date());
      
      if (onConnectionCheck) {
        onConnectionCheck();
      }
      
      toast({
        title: isConnected ? "تم الاتصال بنجاح" : "فشل الاتصال",
        description: isConnected 
          ? "تم الاتصال بقاعدة البيانات Supabase بنجاح" 
          : "تعذر الاتصال بقاعدة البيانات Supabase، يرجى التحقق من اتصالك",
        variant: isConnected ? "default" : "destructive",
      });
    } catch (error) {
      console.error('خطأ أثناء التحقق من الاتصال بـ Supabase:', error);
      setConnectionStatus('disconnected');
      
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء محاولة الاتصال بـ Supabase",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    // فحص الاتصال عند تحميل المكون
    checkConnection();
  }, []);

  return (
    <div className="rounded-lg border p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : connectionStatus === 'disconnected' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          )}
          <h3 className="font-medium">حالة الاتصال بـ Supabase</h3>
        </div>
        
        <Badge 
          variant={
            connectionStatus === 'connected' ? "outline" : 
            connectionStatus === 'disconnected' ? "destructive" : 
            "outline"
          }
          className={
            connectionStatus === 'connected' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""
          }
        >
          {connectionStatus === 'connected' ? 'متصل' : 
           connectionStatus === 'disconnected' ? 'غير متصل' : 
           'جاري الفحص...'}
        </Badge>
      </div>
      
      {showDetails && tableStats && (
        <div className="mb-4 text-sm grid grid-cols-2 gap-2">
          <div className="flex justify-between px-2 py-1 rounded bg-muted/50">
            <span>القنوات:</span>
            <span className="font-medium">{tableStats.channels || 0}</span>
          </div>
          <div className="flex justify-between px-2 py-1 rounded bg-muted/50">
            <span>البلدان:</span>
            <span className="font-medium">{tableStats.countries || 0}</span>
          </div>
          <div className="flex justify-between px-2 py-1 rounded bg-muted/50">
            <span>الفئات:</span>
            <span className="font-medium">{tableStats.categories || 0}</span>
          </div>
          <div className="flex justify-between px-2 py-1 rounded bg-muted/50">
            <span>الإعدادات:</span>
            <span className="font-medium">{tableStats.settings || 0}</span>
          </div>
        </div>
      )}
      
      {lastChecked && (
        <div className="text-xs text-muted-foreground mb-4">
          آخر فحص: {lastChecked.toLocaleTimeString()}
        </div>
      )}
      
      <Button 
        onClick={checkConnection} 
        disabled={isChecking}
        variant={connectionStatus === 'disconnected' ? "destructive" : "outline"}
        size="sm"
        className="w-full"
      >
        {isChecking ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            جاري الفحص...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة فحص الاتصال
          </>
        )}
      </Button>
    </div>
  );
};

export default SupabaseConnectionStatus;
