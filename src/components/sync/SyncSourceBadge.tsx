
import React from 'react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SyncSourceBadgeProps {
  availableSource: string | null;
}

const SyncSourceBadge: React.FC<SyncSourceBadgeProps> = ({ availableSource }) => {
  if (!availableSource) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="flex items-center gap-1 h-5 text-[10px] px-1 text-green-600 border-green-200 bg-green-50">
            <Check className="w-2 h-2" />
            <span>متصل</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>متصل بمصدر البيانات: {availableSource}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncSourceBadge;
