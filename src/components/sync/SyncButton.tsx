
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  tooltipText?: string;
  variant?: 'default' | 'amber';
  disabled?: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({ 
  onClick, 
  isLoading = false,
  tooltipText = "تحديث البيانات",
  variant = 'default',
  disabled = false
}) => {
  const buttonClass = variant === 'amber' ? 
    "border border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-700 p-1 rounded" : 
    "text-primary hover:text-primary/80 p-1";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" 
            size="icon"
            className={buttonClass}
            onClick={onClick}
            disabled={isLoading || disabled}
          >
            <RefreshCw 
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncButton;
