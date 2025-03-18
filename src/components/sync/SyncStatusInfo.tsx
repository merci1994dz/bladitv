
import React from 'react';
import { Shield, Wifi, WifiOff } from 'lucide-react';

interface SyncStatusInfoProps {
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess: boolean;
  };
  isChecking: boolean;
}

const SyncStatusInfo: React.FC<SyncStatusInfoProps> = ({
  networkStatus,
  isChecking
}) => {
  return (
    <div className="flex items-center space-x-4 space-x-reverse">
      <div className="flex items-center">
        {networkStatus.hasInternet ? (
          <Wifi className="h-5 w-5 text-green-500" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-500" />
        )}
        <span className="mr-2">
          {networkStatus.hasInternet ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت'}
        </span>
      </div>
      
      <div className="flex items-center">
        <Shield className={`h-5 w-5 ${networkStatus.hasServerAccess ? 'text-green-500' : 'text-red-500'}`} />
        <span className="mr-2">
          {networkStatus.hasServerAccess ? 'متصل بالخادم' : 'لا يمكن الوصول للخادم'}
        </span>
      </div>
      
      {isChecking && (
        <div className="animate-pulse text-muted-foreground">
          جاري فحص الاتصال...
        </div>
      )}
    </div>
  );
};

export default SyncStatusInfo;
