
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OfflineMode } from '@/components/connectivity';
import { useConnectivityContext } from '@/components/connectivity/ConnectivityProvider';
import { useToast } from '@/hooks/use-toast';

interface HomeConnectivityBannerProps {
  refetchChannels: () => Promise<any>;
}

const HomeConnectivityBanner: React.FC<HomeConnectivityBannerProps> = ({ 
  refetchChannels 
}) => {
  const { toast } = useToast();
  const { 
    isOnline, 
    connectionType,
    isOffline,
    checkStatus,
    isChecking
  } = useConnectivityContext();

  // Handle retry connection
  const handleRetryConnection = async () => {
    toast({
      title: "جاري التحقق من الاتصال",
      description: "جاري محاولة إعادة الاتصال والتحقق من المصادر...",
      duration: 3000,
    });
    
    await checkStatus();
    
    if (!isOffline) {
      refetchChannels();
    }
  };

  // Limited connection banner
  if (!isOffline && connectionType === 'limited') {
    return (
      <div className="bg-amber-500/10 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md p-2 mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-amber-700 dark:text-amber-300">
            متصل بالإنترنت لكن تعذر الوصول إلى مصادر البيانات. يتم عرض البيانات المخزنة محليًا.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetryConnection}
            className="bg-background/80 text-xs h-7"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }
  
  // Offline mode banner
  if (isOffline) {
    return (
      <div className="px-4 pt-2">
        <OfflineMode 
          isOffline={isOffline} 
          onReconnect={handleRetryConnection}
          hasLocalData={true}
        />
      </div>
    );
  }
  
  return null;
};

export default HomeConnectivityBanner;
