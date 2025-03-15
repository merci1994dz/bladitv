
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save, Globe, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { syncWithBladiInfo } from '@/services/sync';

interface RemoteConfigFormProps {
  remoteUrl: string;
  setRemoteUrl: (url: string) => void;
  lastSync: string | null;
  isSyncing: boolean;
  onSaveConfig: () => void;
  onSyncNow: () => void;
}

const RemoteConfigForm: React.FC<RemoteConfigFormProps> = ({
  remoteUrl,
  setRemoteUrl,
  lastSync,
  isSyncing,
  onSaveConfig,
  onSyncNow
}) => {
  const { toast } = useToast();
  const [isSyncingBladiInfo, setIsSyncingBladiInfo] = useState(false);
  
  const handleSyncWithBladiInfo = async () => {
    if (isSyncingBladiInfo) return;
    
    setIsSyncingBladiInfo(true);
    toast({
      title: "جاري المزامنة",
      description: "جاري المزامنة مع مواقع Bladi Info...",
    });
    
    try {
      const success = await syncWithBladiInfo(true);
      if (success) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث البيانات من مواقع Bladi Info بنجاح",
        });
      } else {
        toast({
          title: "تعذر المزامنة",
          description: "فشلت المزامنة مع مواقع Bladi Info، يرجى التحقق من اتصالك بالإنترنت",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('خطأ في المزامنة مع مواقع Bladi Info:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء المزامنة مع مواقع Bladi Info",
        variant: "destructive",
      });
    } finally {
      setIsSyncingBladiInfo(false);
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <span>إعداد المصدر الخارجي</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="remoteUrl" className="text-sm font-medium">
            رابط ملف JSON للبيانات الخارجية
          </label>
          <Input
            id="remoteUrl"
            value={remoteUrl}
            onChange={(e) => setRemoteUrl(e.target.value)}
            placeholder="https://example.com/api/data.json"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            يجب أن يكون الرابط لملف JSON يحتوي على حقول "channels" و "countries" و "categories"
          </p>
        </div>
        
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            آخر تحديث: {new Date(lastSync).toLocaleString()}
          </div>
        )}
        
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium mb-2 text-amber-800 dark:text-amber-400">مزامنة سريعة مع Bladi Info</p>
          <p className="text-xs mb-3 text-amber-700 dark:text-amber-500">
            يمكنك مزامنة القنوات تلقائيًا من مواقع Bladi Info دون الحاجة لإدخال رابط
          </p>
          <Button
            variant="secondary"
            className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center gap-2 mt-2"
            onClick={handleSyncWithBladiInfo}
            disabled={isSyncingBladiInfo}
          >
            {isSyncingBladiInfo ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <span>{isSyncingBladiInfo ? 'جاري المزامنة...' : 'مزامنة تلقائية من Bladi Info'}</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          onClick={onSaveConfig}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Save className="h-4 w-4" />
          <span>حفظ التكوين</span>
        </Button>
        <Button
          onClick={onSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RemoteConfigForm;
