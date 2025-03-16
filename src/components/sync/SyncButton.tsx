
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncButtonProps {
  onClick: () => void;
  isLoading: boolean;
  tooltipText: string;
  variant?: 'default' | 'ghost' | 'amber';
}

const SyncButton: React.FC<SyncButtonProps> = ({ 
  onClick, 
  isLoading, 
  tooltipText,
  variant = 'ghost' 
}) => {
  // Define button class based on variant
  const buttonClass = variant === 'amber' 
    ? "h-6 w-6 rounded-full bg-amber-50 hover:bg-amber-100" 
    : "h-6 w-6 rounded-full";
  
  // Define icon class based on variant
  const iconClass = variant === 'amber'
    ? `h-3 w-3 text-amber-600 ${isLoading ? 'animate-spin' : ''}`
    : `h-3 w-3 ${isLoading ? 'animate-spin' : ''}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={buttonClass}
            onClick={onClick}
            disabled={isLoading}
          >
            <RefreshCw className={iconClass} />
            <span className="sr-only">تحديث</span>
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
