
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  tooltipText?: string;
  variant?: 'default' | 'amber' | 'primary';
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const SyncButton: React.FC<SyncButtonProps> = ({ 
  onClick, 
  isLoading = false,
  tooltipText = "تحديث البيانات",
  variant = 'default',
  disabled = false,
  size = 'default',
  className = ''
}) => {
  // تحديد فئة الزر بناءً على المتغير
  let buttonClass = '';
  
  switch (variant) {
    case 'amber':
      buttonClass = "border border-amber-500 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded";
      break;
    case 'primary':
      buttonClass = "border border-primary bg-primary/10 hover:bg-primary/20 text-primary rounded";
      break;
    default:
      buttonClass = "text-primary hover:text-primary/80";
  }
  
  const buttonSize = size === 'sm' ? 'p-1' : 'p-2';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" 
            size="icon"
            className={`${buttonClass} ${buttonSize} ${className}`}
            onClick={onClick}
            disabled={isLoading || disabled}
          >
            <RefreshCw 
              className={`${iconSize} ${isLoading ? 'animate-spin' : ''}`} 
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
