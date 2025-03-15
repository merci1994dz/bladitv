
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Link, Globe, Save, ArrowDownToLine } from 'lucide-react';
import { syncWithRemoteSource } from '@/services/sync/remote';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import JsonFormatHelp from '@/components/remoteConfig/JsonFormatHelp';

interface RemoteSourceFormProps {
  onSyncComplete: () => void;
}

const RemoteSourceForm: React.FC<RemoteSourceFormProps> = ({ onSyncComplete }) => {
  const { toast } = useToast();
  const [remoteUrl, setRemoteUrl] = useState('https://bladi-info.com/api/channels.json');
  const [isSyncing, setIsSyncing] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(true);

  const handleSyncNow = async () => {
    if (!remoteUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صالح للمصدر الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Add cache-busting parameter to URL
      const urlWithCacheBuster = remoteUrl.includes('?') 
        ? `${remoteUrl}&_=${Date.now()}` 
        : `${remoteUrl}?_=${Date.now()}`;
        
      const success = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
      
      if (success) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم استيراد القنوات من bladi-info.com بنجاح",
        });
        
        onSyncComplete();
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "حدث خطأ أثناء محاولة استيراد القنوات",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('خطأ في مزامنة البيانات:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالمصدر الخارجي",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card className="border border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <span>استيراد القنوات من bladi-info.com</span>
        </CardTitle>
        <CardDescription>
          يمكنك استيراد قائمة القنوات مباشرة من موقع bladi-info.com
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="remoteUrl">رابط API القنوات</Label>
          <div className="flex gap-2">
            <Input
              id="remoteUrl"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="https://bladi-info.com/api/channels.json"
              dir="ltr"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            تأكد من أن الرابط يشير إلى ملف JSON يتوافق مع تنسيق القنوات المطلوب
          </p>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="forceRefresh"
            checked={forceRefresh}
            onCheckedChange={(checked) => setForceRefresh(checked as boolean)}
          />
          <Label htmlFor="forceRefresh" className="text-sm cursor-pointer">
            فرض تحديث البيانات وإعادة تحميل الصفحة بعد المزامنة
          </Label>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="format-help">
            <AccordionTrigger className="text-sm font-medium">
              التنسيق المطلوب لملف JSON
            </AccordionTrigger>
            <AccordionContent>
              <JsonFormatHelp />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>جاري المزامنة...</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="h-4 w-4" />
              <span>استيراد القنوات الآن</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RemoteSourceForm;
