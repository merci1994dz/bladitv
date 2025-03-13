
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Channel } from '@/types';
import { getEnabledProviders, buildExternalStreamingUrl } from '@/services/externalStreamingConfig';
import { useToast } from '@/hooks/use-toast';

interface ExternalStreamingButtonProps {
  channel: Channel;
  isTV?: boolean;
  isFocused?: boolean;
}

const ExternalStreamingButton: React.FC<ExternalStreamingButtonProps> = ({
  channel,
  isTV = false,
  isFocused = false
}) => {
  const { toast } = useToast();
  const enabledProviders = getEnabledProviders();
  
  // تحقق مما إذا كانت القناة لديها روابط خارجية
  const hasExternalLinks = !!channel.externalLinks && channel.externalLinks.length > 0;
  
  if (!hasExternalLinks) return null;
  
  const handleExternalStreamingClick = (providerId: string, channelId: string) => {
    const url = buildExternalStreamingUrl(providerId, channelId);
    
    if (!url) {
      toast({
        title: "خطأ",
        description: "تعذر فتح الرابط الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    // فتح الرابط في نافذة جديدة
    window.open(url, '_blank');
    
    toast({
      title: "فتح في خدمة خارجية",
      description: `تم فتح القناة في الخدمة الخارجية`,
      duration: 3000,
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          id="external-streaming-button"
          variant="ghost" 
          size="icon"
          className={`rounded-full text-white hover:bg-white/20 h-9 w-9 backdrop-blur-sm ${isFocused ? 'ring-2 ring-primary' : ''}`}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/80 backdrop-blur-md border-white/10 text-white min-w-52">
        {channel.externalLinks?.map((link) => {
          const provider = enabledProviders.find(p => p.id === link.serviceId);
          if (!provider) return null;
          
          return (
            <DropdownMenuItem 
              key={link.serviceId} 
              onClick={() => handleExternalStreamingClick(link.serviceId, link.channelId)}
              className="cursor-pointer focus:bg-white/10 hover:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span>{provider.name}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExternalStreamingButton;
