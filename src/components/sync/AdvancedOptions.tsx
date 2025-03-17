
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

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
          {/* زر إعادة ضبط التطبيق */}
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleResetApp}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            إعادة ضبط التطبيق
          </Button>
        </div>
        
        {/* معلومات المصدر المتاح */}
        {availableSource && (
          <div className="mt-2 text-xs bg-muted p-2 rounded overflow-hidden">
            <span className="font-semibold">المصدر المتاح: </span>
            <span className="opacity-70 text-[10px] break-all">{availableSource}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOptions;
