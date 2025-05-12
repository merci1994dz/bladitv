
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  tooltipText?: string;
  variant?: 'default' | 'amber' | 'primary' | 'ghost';
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
}

const SyncButton: React.FC<SyncButtonProps> = ({ 
  onClick, 
  isLoading = false,
  tooltipText = "تحديث البيانات",
  variant = 'default',
  disabled = false,
  size = 'default',
  className = '',
  showText = false
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
    case 'ghost':
      buttonClass = "text-primary hover:bg-background/80";
      break;
    default:
      buttonClass = "text-primary hover:text-primary/80";
  }
  
  // Adjust button size classes
  const buttonSize = size === 'sm' ? 'p-1' : (size === 'lg' ? 'p-3' : 'p-2');
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : (size === 'lg' ? 'h-5 w-5' : 'h-4 w-4');
  
  const content = (
    <>
      <RefreshCw 
        className={`${iconSize} ${isLoading ? 'animate-spin' : ''}`} 
      />
      {showText && <span className="mr-2">{isLoading ? "جاري التحديث..." : "تحديث"}</span>}
    </>
  );
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" 
            size={showText ? 'default' : 'icon'}
            className={`${buttonClass} ${buttonSize} ${className} transition-all duration-200`}
            onClick={onClick}
            disabled={isLoading || disabled}
          >
            {content}
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
