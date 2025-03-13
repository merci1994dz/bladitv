
import React, { useState } from 'react';
import { CheckCircle, Globe, Shield, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceType } from '@/hooks/use-tv';
import { Channel } from '@/types';

interface StreamSource {
  id: string;
  url: string;
  quality: string;
  isDefault: boolean;
  provider: string;
  reliability: number; // 1-10
}

interface StreamSourcesProps {
  channel: Channel;
  onSelectSource: (url: string) => void;
  selectedUrl?: string;
}

const StreamSources: React.FC<StreamSourcesProps> = ({ 
  channel, 
  onSelectSource,
  selectedUrl
}) => {
  const { toast } = useToast();
  const { isTV } = useDeviceType();
  
  // سنستخدم بيانات تجريبية هنا، في التطبيق الحقيقي يمكن أن تأتي من API
  const [sources] = useState<StreamSource[]>([
    {
      id: 'source1',
      url: channel.streamUrl,
      quality: 'HD',
      isDefault: true,
      provider: 'المصدر الرئيسي',
      reliability: 9
    },
    {
      id: 'source2',
      url: `${channel.streamUrl}?backup=1`,
      quality: 'HD',
      isDefault: false,
      provider: 'مصدر احتياطي 1',
      reliability: 7
    },
    {
      id: 'source3',
      url: `${channel.streamUrl}?backup=2`,
      quality: 'SD',
      isDefault: false,
      provider: 'مصدر احتياطي 2',
      reliability: 8
    }
  ]);

  const handleSelectSource = (source: StreamSource) => {
    onSelectSource(source.url);
    
    toast({
      title: "تم تغيير المصدر",
      description: `تم التبديل إلى ${source.provider} (${source.quality})`,
      duration: 3000,
    });
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={`mt-2 rounded-lg ${isTV ? 'tv-component' : ''}`}>
      <h3 className={`text-sm font-medium mb-2 flex items-center ${isTV ? 'text-base' : ''}`}>
        <Wifi className="inline-block w-4 h-4 mr-1 text-primary" />
        <span>مصادر البث ({sources.length})</span>
      </h3>
      
      <div className="space-y-2">
        {sources.map((source) => (
          <div 
            key={source.id}
            className={`flex items-center justify-between p-2 rounded-md 
              transition-colors cursor-pointer border
              ${selectedUrl === source.url ? 'bg-primary/10 border-primary' : 'bg-card/60 border-transparent hover:bg-card/80'}
              ${isTV ? 'tv-focus-item p-3' : ''}`}
            onClick={() => handleSelectSource(source)}
          >
            <div className="flex items-center">
              <div className="mr-2">
                {selectedUrl === source.url ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Globe className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="font-medium text-sm">{source.provider}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="mr-1">{source.quality}</span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <span className="ml-1">موثوقية:</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden ml-1">
                      <div 
                        className={`h-full ${getReliabilityColor(source.reliability)}`}
                        style={{ width: `${source.reliability * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {source.isDefault && (
              <div className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                <span>افتراضي</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreamSources;
