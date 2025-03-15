
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChannelFormActionsProps {
  onManualSync?: () => Promise<void>;
  isSyncing: boolean;
  isSubmitDisabled?: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
}

const ChannelFormActions: React.FC<ChannelFormActionsProps> = ({
  onManualSync,
  isSyncing,
  isSubmitDisabled = false,
  submitLabel = "إضافة القناة",
  submitIcon = <PlusCircle className="h-4 w-4" />
}) => {
  // إضافة معالج خطأ في حالة فشل المزامنة
  const handleSyncClick = async () => {
    if (!onManualSync || isSyncing) return;
    
    try {
      await onManualSync();
    } catch (error) {
      console.error("Error during manual sync:", error);
      toast({
        title: "فشل المزامنة",
        description: "حدث خطأ أثناء مزامنة القنوات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          type="submit" 
          className="w-full sm:w-auto gap-1.5"
          disabled={isSubmitDisabled}
        >
          {submitIcon}
          <span>{submitLabel}</span>
        </Button>
        
        {onManualSync && (
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'جاري المزامنة...' : 'مزامنة القنوات ونشرها للمستخدمين'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelFormActions;
