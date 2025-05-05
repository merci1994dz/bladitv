
import React from 'react';
import { WifiOff, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface OfflineModeProps {
  isOffline: boolean;
  onReconnect?: () => void;
  isReconnecting?: boolean;
  className?: string;
  minimal?: boolean;
  hasLocalData?: boolean;
}

const OfflineMode: React.FC<OfflineModeProps> = ({
  isOffline,
  onReconnect,
  isReconnecting = false,
  className,
  minimal = false,
  hasLocalData = true
}) => {
  if (!isOffline) return null;

  // Minimal version (just a banner)
  if (minimal) {
    return (
      <div className={cn("bg-amber-500 dark:bg-amber-900 text-white dark:text-amber-50 text-center py-1 px-2 text-sm sticky top-0 z-50 flex items-center justify-center gap-2", className)}>
        <WifiOff className="h-3 w-3" />
        <span>أنت الآن في وضع عدم الاتصال. سيتم استخدام البيانات المخزنة محليًا.</span>
      </div>
    );
  }

  // Full version with more details
  return (
    <Alert variant="destructive" className={cn("animate-in fade-in-50 duration-300 mb-4", className)}>
      <div className="flex items-start gap-2">
        <WifiOff className="h-5 w-5 mt-0.5" />
        <div className="flex-1">
          <AlertTitle className="mb-2">أنت غير متصل بالإنترنت</AlertTitle>
          <AlertDescription className="text-sm space-y-3">
            <p>تعذر الاتصال بالإنترنت. {hasLocalData 
              ? "سيتم استخدام البيانات المخزنة محليًا." 
              : "قد لا تتمكن من الوصول إلى بعض المحتوى."}</p>
            
            {hasLocalData && (
              <div className="flex items-center gap-1.5 text-xs mt-1 bg-destructive/10 p-1.5 rounded">
                <Database className="h-3.5 w-3.5" />
                <span>البيانات المحلية متاحة</span>
              </div>
            )}
            
            {onReconnect && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReconnect}
                disabled={isReconnecting}
                className="mt-2 bg-background hover:bg-background/90"
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isReconnecting ? "animate-spin" : "")} />
                {isReconnecting ? "جاري المحاولة..." : "إعادة الاتصال"}
              </Button>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default OfflineMode;
