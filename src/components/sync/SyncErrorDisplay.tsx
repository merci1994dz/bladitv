
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSyncError } from '@/services/sync/status/errorHandling';

// Define SyncError type to match what's being used
export interface SyncError {
  message: string;
  time: string;
  code?: string;
  details?: {
    source?: string;
    type?: string;
    reason?: string;
    timestamp?: number;
  };
}

interface SyncErrorDisplayProps {
  error?: SyncError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const SyncErrorDisplay: React.FC<SyncErrorDisplayProps> = ({
  error = getSyncError(),
  onRetry,
  onDismiss,
  compact = false
}) => {
  if (!error) return null;
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${compact ? 'text-sm' : ''}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">خطأ في المزامنة</h4>
          <p className="text-red-700 mt-1">{error.message}</p>
          
          {error.details && !compact && (
            <div className="mt-2 text-xs text-red-600">
              {error.details.source && <div>المصدر: {error.details.source}</div>}
              {error.details.type && <div>النوع: {error.details.type}</div>}
              {error.details.reason && <div>السبب: {error.details.reason}</div>}
              {error.details.timestamp && (
                <div>الوقت: {new Date(error.details.timestamp).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {(onRetry || onDismiss) && (
        <div className="flex gap-2 mt-3 justify-end">
          {onRetry && (
            <Button 
              size="sm" 
              onClick={onRetry}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              إعادة المحاولة
            </Button>
          )}
          
          {onDismiss && (
            <Button 
              size="sm" 
              onClick={onDismiss}
              variant="ghost"
              className="text-red-700 hover:text-red-800"
            >
              تجاهل
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SyncErrorDisplay;
