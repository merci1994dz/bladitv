
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface SyncErrorNotificationProps {
  syncError: string | null;
  onRetry?: () => void;
  errorDetails?: {
    type: string;
    message: string;
    errorCode?: string;
    timestamp?: number;
  } | null;
}

const SyncErrorNotification: React.FC<SyncErrorNotificationProps> = ({
  syncError,
  onRetry,
  errorDetails
}) => {
  if (!syncError) return null;

  // تحديد نوع الخطأ لعرض رسالة مناسبة
  const isDatabaseError = errorDetails?.type?.includes('duplicate') || 
                         syncError.includes('duplicate key') || 
                         syncError.includes('constraint');
  
  const isConnectionError = errorDetails?.type === 'connection' || 
                           syncError.includes('network') || 
                           syncError.includes('connection') ||
                           syncError.includes('timeout');

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="text-sm font-medium">
          {isDatabaseError ? 'خطأ في قاعدة البيانات:' : 
           isConnectionError ? 'خطأ في الاتصال:' : 'خطأ في المزامنة:'}
        </div>
        <div className="text-xs">
          {syncError}
        </div>
        
        {/* زر إعادة المحاولة إذا كان متاحًا */}
        {onRetry && (
          <div className="flex justify-end mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>إعادة المحاولة</span>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SyncErrorNotification;
