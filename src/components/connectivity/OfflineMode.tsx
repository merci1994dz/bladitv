
import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineModeProps {
  isOffline: boolean;
  onReconnect?: () => Promise<void>;
  isReconnecting?: boolean;
  minimal?: boolean;
  hasLocalData?: boolean;
}

const OfflineMode: React.FC<OfflineModeProps> = ({
  isOffline,
  onReconnect,
  isReconnecting = false,
  minimal = false,
  hasLocalData = false
}) => {
  if (!isOffline) {
    return null;
  }

  // النسخة المصغرة لاستخدامها في الأماكن المحدودة المساحة
  if (minimal) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 mb-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <WifiOff size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">أنت الآن في وضع عدم الاتصال</span>
          {onReconnect && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReconnect}
              disabled={isReconnecting}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isReconnecting ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // النسخة الكاملة مع رسائل أكثر تفصيلاً
  return (
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 mb-4">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
            <WifiOff size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">أنت الآن في وضع عدم الاتصال</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasLocalData 
                ? 'يتم عرض البيانات المخزنة محليًا. بعض الميزات قد لا تعمل.' 
                : 'لا يمكن الوصول إلى بياناتك حتى تستعيد الاتصال.'}
            </p>
          </div>
        </div>
        {onReconnect && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReconnect}
            disabled={isReconnecting}
            className="whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReconnecting ? 'animate-spin' : ''}`} />
            إعادة الاتصال
          </Button>
        )}
      </div>
    </div>
  );
};

export default OfflineMode;
