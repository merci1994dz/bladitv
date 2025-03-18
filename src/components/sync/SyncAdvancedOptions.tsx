
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { resetAppData } from '@/services/sync/forceRefresh';
import { toast } from '@/hooks/use-toast';

interface SyncAdvancedOptionsProps {
  showAdvanced: boolean;
  availableSource: string | null;
}

const SyncAdvancedOptions: React.FC<SyncAdvancedOptionsProps> = ({ 
  showAdvanced, 
  availableSource 
}) => {
  // معالجة إعادة ضبط التطبيق
  const handleResetApp = async () => {
    const confirmReset = window.confirm("هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم مسح جميع البيانات المخزنة محليًا.");
    
    if (confirmReset) {
      toast({
        title: "جاري إعادة ضبط التطبيق",
        description: "جاري مسح جميع البيانات المخزنة وإعادة تحميل الصفحة...",
        duration: 3000,
      });
      
      await resetAppData();
      
      // إعادة تحميل الصفحة بعد مهلة قصيرة
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname + 
          `?reset=${Date.now()}&nocache=true`;
      }, 2000);
    }
  };

  if (!showAdvanced) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">خيارات متقدمة</h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">المصدر المتاح:</span>
            {availableSource ? (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                {availableSource}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                غير متاح
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              إعادة ضبط التطبيق:
            </span>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleResetApp}
              className="h-7 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              إعادة ضبط
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncAdvancedOptions;
