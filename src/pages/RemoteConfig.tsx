
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Save, Globe, AlertTriangle } from 'lucide-react';
import { getRemoteConfig, setRemoteConfig, syncWithRemoteSource } from '@/services/syncService';
import { REMOTE_CONFIG } from '@/services/config';
import AdminLogin from '@/components/AdminLogin';

const RemoteConfig: React.FC = () => {
  const { toast } = useToast();
  const [remoteUrl, setRemoteUrl] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      // تحميل التكوين الحالي
      const config = getRemoteConfig();
      if (config) {
        setRemoteUrl(config.url);
        setLastSync(config.lastSync);
      }
    }
  }, [isAuthenticated]);
  
  const handleSaveConfig = async () => {
    // التحقق من صحة الرابط
    if (!remoteUrl) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صالح للمصدر الخارجي",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // حفظ التكوين
      setRemoteConfig(remoteUrl);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ رابط المصدر الخارجي بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التكوين",
        variant: "destructive",
      });
    }
  };
  
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
      const success = await syncWithRemoteSource(remoteUrl);
      
      if (success) {
        // تحديث وقت آخر مزامنة
        const config = getRemoteConfig();
        if (config) {
          setLastSync(config.lastSync);
        }
        
        toast({
          title: "تمت المزامنة",
          description: "تم تحديث البيانات من المصدر الخارجي بنجاح",
        });
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "حدث خطأ أثناء تحديث البيانات",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الاتصال بالمصدر الخارجي",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">إعدادات التحديث عن بُعد</h1>
        <p className="text-muted-foreground">
          إعداد مصدر خارجي لتحديث بيانات القنوات والبلدان والفئات
        </p>
      </header>
      
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
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleSaveConfig}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            <span>حفظ التكوين</span>
          </Button>
          <Button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}</span>
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            <span>هام</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800 dark:text-amber-300">
          <p className="mb-2">يجب أن يكون ملف JSON بالتنسيق التالي:</p>
          <pre className="bg-white dark:bg-black/20 p-3 rounded-md text-xs overflow-x-auto">
{`{
  "channels": [
    { 
      "id": "1", 
      "name": "اسم القناة", 
      "logo": "رابط الشعار",
      "streamUrl": "رابط البث",
      "category": "معرف الفئة",
      "country": "معرف البلد",
      "isFavorite": false
    }
  ],
  "countries": [
    {
      "id": "1",
      "name": "اسم البلد",
      "flag": "🇪🇬",
      "image": "رابط الصورة"
    }
  ],
  "categories": [
    {
      "id": "1",
      "name": "اسم الفئة",
      "icon": "رمز الفئة"
    }
  ]
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemoteConfig;
