
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      // إضافة معلمات لتجنب التخزين المؤقت
      const urlWithCacheBuster = `${remoteUrl}${remoteUrl.includes('?') ? '&' : '?'}_=${Date.now()}&nocache=${Math.random()}`;
      
      console.log('بدء التزامن مع:', urlWithCacheBuster);
        
      const success = await syncWithRemoteSource(urlWithCacheBuster, forceRefresh);
      
      if (success) {
        toast({
          title: "تم التزامن بنجاح",
          description: "تم التزامن مع bladi-info.com بنجاح وستظهر القنوات للمستخدمين فورًا",
        });
        
        onSyncComplete();
        
        // للتأكيد البصري للمستخدم
        setTimeout(() => {
          // إعادة تحميل الصفحة لضمان ظهور التغييرات
          if (forceRefresh) {
            window.location.reload();
          }
        }, 2000);
      } else {
        toast({
          title: "فشل التزامن",
          description: "حدث خطأ أثناء محاولة التزامن مع bladi-info.com",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('خطأ في التزامن:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بـ bladi-info.com",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleDirectSync = async () => {
    setIsSyncing(true);
    
    try {
      // استخدام الرابط المباشر لـ bladi-info.com
      const directUrl = `https://bladi-info.com/api/channels.json?_=${Date.now()}&direct=true`;
      
      console.log('بدء التزامن المباشر مع bladi-info.com:', directUrl);
      
      const success = await syncWithRemoteSource(directUrl, true);
      
      if (success) {
        toast({
          title: "تم التزامن بنجاح",
          description: "تم التزامن مباشرة مع bladi-info.com ونشر القنوات للمستخدمين",
        });
        
        onSyncComplete();
        
        // إعادة تحميل الصفحة للتأكد من ظهور التغييرات
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error("فشل التزامن المباشر مع bladi-info.com");
      }
    } catch (error) {
      console.error('خطأ في التزامن المباشر:', error);
      toast({
        title: "خطأ في التزامن المباشر",
        description: "حدث خطأ أثناء التزامن مباشرة مع bladi-info.com",
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
          <span>التزامن مع bladi-info.com</span>
        </CardTitle>
        <CardDescription>
          يمكنك التزامن مباشرة مع موقع bladi-info.com وستظهر القنوات للمستخدمين فورًا
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="bg-amber-50 text-amber-900 border-amber-200">
          <Globe className="h-4 w-4 text-amber-500" />
          <AlertTitle>تزامن مباشر مع bladi-info.com</AlertTitle>
          <AlertDescription>
            للحصول على أفضل تجربة، يمكنك الضغط على زر "تزامن مباشر مع bladi-info.com" أدناه للحصول على أحدث القنوات فورًا.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="remoteUrl">رابط API القنوات (يستخدم bladi-info.com افتراضيًا)</Label>
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
            فرض تحديث البيانات وإعادة تحميل الصفحة بعد التزامن
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
          onClick={handleDirectSync}
          variant="default"
          disabled={isSyncing}
          className="flex items-center gap-2 w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>جاري التزامن...</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span>تزامن مباشر مع bladi-info.com</span>
            </>
          )}
        </Button>
        
        <Button
          onClick={handleSyncNow}
          disabled={isSyncing}
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>جاري التزامن...</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="h-4 w-4" />
              <span>تزامن من الرابط المخصص</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RemoteSourceForm;
