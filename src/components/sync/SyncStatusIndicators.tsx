
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ServerIcon, 
  ServerOffIcon 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface SyncStatusIndicatorsProps {
  networkStatus: {
    hasInternet: boolean;
    hasServerAccess?: boolean;
  };
  syncError: string | null;
  cacheCleared: boolean;
  deploymentPlatform?: string;
}

export const SyncStatusIndicators: React.FC<SyncStatusIndicatorsProps> = ({ 
  networkStatus, 
  syncError, 
  cacheCleared,
  deploymentPlatform = 'vercel'
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* مؤشر حالة الشبكة */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>{networkStatus.hasInternet ? 'متصل بالإنترنت' : 'غير متصل بالإنترنت. سيتم استخدام البيانات المخزنة محلياً'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* مؤشر حالة المزامنة */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>{syncError ? `خطأ في المزامنة: ${syncError}` : 'البيانات متزامنة'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* مؤشر التخزين المؤقت */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <p>{cacheCleared ? 'تم مسح التخزين المؤقت. البيانات محدثة' : 'قد تكون البيانات مخزنة مؤقتًا'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* مؤشر بيئة النشر */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="gap-1 px-2"
            >
              {networkStatus.hasServerAccess ? (
                <>
                  <ServerIcon className="h-3 w-3" />
                  <span>{deploymentPlatform}</span>
                </>
              ) : (
                <>
                  <ServerOffIcon className="h-3 w-3" />
                  <span>وضع محلي</span>
                </>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{networkStatus.hasServerAccess 
              ? `تم نشر التطبيق على ${deploymentPlatform}` 
              : 'يعمل التطبيق في وضع عدم الاتصال'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
