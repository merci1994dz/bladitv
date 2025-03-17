
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SyncIndicatorsProps {
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess?: boolean;
  };
  syncError: string | null;
  cacheCleared: boolean;
}

const SyncIndicators: React.FC<SyncIndicatorsProps> = ({ 
  networkStatus, 
  syncError, 
  cacheCleared 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* مؤشر حالة الشبكة */}
      <Badge variant={networkStatus.hasInternet ? "outline" : "destructive"} className="gap-1 px-2">
        {networkStatus.hasInternet ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>متصل</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>غير متصل</span>
          </>
        )}
      </Badge>
      
      {/* مؤشر حالة المزامنة */}
      <Badge 
        variant={syncError ? "destructive" : "outline"} 
        className="gap-1 px-2"
      >
        {syncError ? (
          <>
            <XCircle className="h-3 w-3" />
            <span>خطأ</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3 w-3" />
            <span>متزامن</span>
          </>
        )}
      </Badge>
      
      {/* مؤشر التخزين المؤقت */}
      <Badge 
        variant={cacheCleared ? "outline" : "secondary"} 
        className="gap-1 px-2"
      >
        {cacheCleared ? (
          <>
            <CheckCircle2 className="h-3 w-3" />
            <span>تم مسح التخزين المؤقت</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3" />
            <span>التخزين المؤقت</span>
          </>
        )}
      </Badge>
    </div>
  );
};

export default SyncIndicators;
