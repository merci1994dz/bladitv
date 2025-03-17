
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, RefreshCw, ServerIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdvancedOptionsProps {
  showAdvanced: boolean;
  handleResetApp: () => void;
  availableSource: string | null;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  showAdvanced,
  handleResetApp,
  availableSource
}) => {
  if (!showAdvanced) return null;
  
  return (
    <div className="mt-2 p-2 border rounded bg-muted/50">
      <div className="flex flex-col space-y-2">
        <p className="text-xs text-muted-foreground mb-2">
          الخيارات المتقدمة للصيانة. استخدم بحذر.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            {/* زر إعادة تشغيل التطبيق */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  إعادة تشغيل التطبيق
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>إعادة تحميل التطبيق بدون مسح البيانات</p>
              </TooltipContent>
            </Tooltip>
            
            {/* زر إعادة ضبط التطبيق */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleResetApp}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  إعادة ضبط التطبيق
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>مسح جميع البيانات المحلية وإعادة تعيين التطبيق. استخدم هذا الخيار فقط إذا كنت تواجه مشاكل خطيرة.</p>
              </TooltipContent>
            </Tooltip>
            
            {/* زر تحديث من الخادم */}
            {window.location.hostname.includes('vercel.app') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem('force_server_update', 'true');
                      localStorage.setItem('update_timestamp', Date.now().toString());
                      window.location.reload();
                    }}
                  >
                    <ServerIcon className="h-4 w-4 mr-1" />
                    تحديث من Vercel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>تحديث من خادم Vercel مباشرة</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
        
        {/* معلومات المصدر المتاح */}
        {availableSource && (
          <div className="mt-2 text-xs bg-muted p-2 rounded overflow-hidden">
            <span className="font-semibold">المصدر المتاح: </span>
            <span className="opacity-70 text-[10px] break-all">{availableSource}</span>
          </div>
        )}
        
        {/* معلومات الخادم */}
        <div className="mt-1 text-xs bg-muted p-2 rounded overflow-hidden">
          <span className="font-semibold">الخادم: </span>
          <span className="opacity-70 text-[10px]">
            {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              ? 'محلي (خادم التطوير)'
              : window.location.hostname.includes('vercel.app')
              ? 'Vercel (إنتاج)'
              : window.location.hostname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptions;
