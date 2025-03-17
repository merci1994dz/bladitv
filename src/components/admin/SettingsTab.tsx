
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChannelsSync } from '@/hooks/channelAdmin/useChannelsSync';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clipboard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getChannels } from '@/services/api';

const SettingsTab: React.FC = () => {
  const { data: channels, refetch: refetchChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels
  });
  
  const { manualSyncChannels, getProjectLinks } = useChannelsSync(refetchChannels);
  const { toast } = useToast();
  const projectLinks = getProjectLinks();
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "تم النسخ",
          description: `تم نسخ ${description} إلى الحافظة`,
        });
      })
      .catch((error) => {
        console.error('فشل في نسخ النص:', error);
        toast({
          title: "فشل النسخ",
          description: "تعذر نسخ النص إلى الحافظة",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>الروابط المرتبطة بالمشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              فيما يلي قائمة بالروابط المرتبطة بمشروع بلادي تي في.
            </p>
            
            {projectLinks.map((link, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg mb-2 bg-card">
                <div className="mb-2 md:mb-0">
                  <h3 className="font-medium">{link.name}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.url, link.name)}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    نسخ
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      فتح
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <CheckCircle className="h-5 w-5" />
              تحديث ونشر القنوات
            </h3>
            <p className="text-sm my-2 text-amber-700 dark:text-amber-500">
              يمكنك نشر وتحديث القنوات يدويًا لجميع المستخدمين. سيتم تحديث القنوات في جميع الأجهزة المتصلة.
            </p>
            <Button
              className="w-full mt-2 bg-amber-200 hover:bg-amber-300 text-amber-900"
              onClick={manualSyncChannels}
            >
              نشر القنوات للمستخدمين
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            إجمالي عدد القنوات المتاحة: <span className="font-bold">{channels?.length || 0}</span>
          </p>
          <p className="text-sm mb-4">
            آخر تحديث: <span className="font-bold">{new Date().toLocaleString()}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
