
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Server, Database, Globe, ShieldAlert } from 'lucide-react';
import { resetAppData } from '@/services/sync/forceRefresh';
import { toast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { syncWithSupabase } from '@/services/sync/supabaseSync';

interface SyncAdvancedOptionsProps {
  showAdvanced: boolean;
  availableSource: string | null;
}

const SyncAdvancedOptions: React.FC<SyncAdvancedOptionsProps> = ({ 
  showAdvanced, 
  availableSource 
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  
  // وظيفة محسنة لمزامنة البيانات مع Supabase مع معالجة أفضل للأخطاء
  const syncWithSupabaseDb = async () => {
    try {
      setIsSyncing(true);
      setSupabaseStatus('checking');
      
      toast({
        title: "جاري المزامنة مع Supabase",
        description: "جاري تحديث البيانات من قاعدة البيانات...",
      });

      const result = await syncWithSupabase(true);
      
      if (result) {
        setSupabaseStatus('connected');
        toast({
          title: "تمت المزامنة",
          description: "تم تحديث البيانات بنجاح من Supabase",
          variant: "default",
        });
        
        return true;
      } else {
        setSupabaseStatus('error');
        toast({
          title: "فشلت المزامنة",
          description: "تعذر مزامنة البيانات مع Supabase. تحقق من وجود اتصال بالإنترنت.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('خطأ في المزامنة مع Supabase:', error);
      setSupabaseStatus('error');
      
      // تحديد رسائل خطأ أكثر تحديدًا
      let errorMessage = "تعذر الاتصال بـ Supabase";
      
      if (error instanceof Error) {
        if (error.message.includes('409') || error.message.includes('تعارض') || error.message.includes('conflict')) {
          errorMessage = "وجود تعارض في البيانات. يرجى محاولة إعادة ضبط التطبيق.";
        } else if (error.message.includes('duplicate key') || error.message.includes('23505')) {
          errorMessage = "مفاتيح مكررة في البيانات. جاري محاولة تصحيح المشكلة...";
          
          // محاولة تنظيف البيانات المكررة
          await handleDuplicateKeyError();
          return false;
        }
      }
      
      toast({
        title: "فشل الاتصال",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // وظيفة جديدة لمعالجة أخطاء المفاتيح المكررة
  const handleDuplicateKeyError = async () => {
    try {
      toast({
        title: "جاري محاولة إصلاح المفاتيح المكررة",
        description: "قد تستغرق هذه العملية بضع ثوانٍ...",
        duration: 5000,
      });
      
      // مسح بيانات المزامنة المخزنة مؤقتًا قبل المحاولة مرة أخرى
      clearCacheData();
      
      // التأخير قبل محاولة المزامنة مرة أخرى
      setTimeout(() => {
        toast({
          title: "يرجى إعادة المزامنة",
          description: "تم مسح البيانات المخزنة مؤقتًا. يرجى النقر على 'مزامنة الآن' مرة أخرى.",
          duration: 5000,
        });
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('خطأ في معالجة المفاتيح المكررة:', error);
      return false;
    }
  };
  
  // وظيفة لإعادة ضبط التطبيق مع تأكيد أفضل
  const handleResetApp = async () => {
    const confirmReset = window.confirm("هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم مسح جميع البيانات المخزنة محليًا.");
    
    if (confirmReset) {
      toast({
        title: "جاري إعادة ضبط التطبيق",
        description: "جاري مسح جميع البيانات المخزنة وإعادة تحميل الصفحة...",
        duration: 3000,
      });
      
      try {
        await resetAppData();
        
        // إعادة تحميل الصفحة بعد مهلة قصيرة
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname + 
            `?reset=${Date.now()}&nocache=true`;
        }, 2000);
      } catch (error) {
        console.error('خطأ في إعادة ضبط التطبيق:', error);
        toast({
          title: "خطأ في إعادة الضبط",
          description: "حدث خطأ أثناء محاولة إعادة ضبط التطبيق. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };
  
  // وظيفة محسنة لمسح معلومات التخزين المؤقت
  const clearCacheData = () => {
    try {
      const cacheKeys = [
        'last_sync_time', 'last_sync', 'sync_start_time',
        'sync_error', 'sync_status', 'sync_state',
        'channel_last_update', 'data_version',
        'vercel_sync_count', 'vercel_last_sync',
        'vercel_realtime_update', 'vercel_realtime_count'
      ];
      
      let clearedCount = 0;
      cacheKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      
      toast({
        title: "تم مسح بيانات المزامنة",
        description: `تم مسح ${clearedCount} من عناصر التخزين المؤقت للمزامنة`,
      });
      
      // إعادة تحميل الصفحة بعد مهلة قصيرة
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('خطأ في مسح بيانات التخزين المؤقت:', error);
      
      toast({
        title: "خطأ في مسح التخزين المؤقت",
        description: "حدث خطأ أثناء محاولة مسح بيانات التخزين المؤقت. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  };

  if (!showAdvanced) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          خيارات متقدمة للمزامنة مع Supabase
        </h3>
        
        <Accordion type="single" collapsible className="w-full">
          {/* معلومات حالة الاتصال بـ Supabase */}
          <AccordionItem value="connection-status">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                حالة الاتصال بـ Supabase
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2 bg-muted rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        supabaseStatus === 'connected' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : supabaseStatus === 'error'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {supabaseStatus === 'connected' 
                        ? 'متصل' 
                        : supabaseStatus === 'error' 
                          ? 'خطأ في الاتصال' 
                          : supabaseStatus === 'checking'
                            ? 'جاري الفحص...'
                            : availableSource ? 'جاهز للمزامنة' : 'غير متصل'}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={syncWithSupabaseDb}
                      disabled={isSyncing}
                    >
                      {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    يمكنك مزامنة البيانات مباشرة مع قاعدة بيانات Supabase لضمان الحصول على أحدث البيانات
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* خيارات الصيانة */}
          <AccordionItem value="maintenance">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                خيارات الصيانة
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCacheData}
                  className="w-full justify-between text-xs"
                >
                  <span>مسح بيانات المزامنة</span>
                  <RefreshCw className="h-3 w-3 ml-1" />
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleResetApp}
                  className="w-full justify-between text-xs"
                >
                  <span>إعادة ضبط التطبيق</span>
                  <ShieldAlert className="h-3 w-3 ml-1" />
                </Button>
                
                <div className="text-xs text-muted-foreground mt-2">
                  <p>- استخدم <strong>مسح بيانات المزامنة</strong> لحل مشاكل المزامنة البسيطة</p>
                  <p>- استخدم <strong>إعادة ضبط التطبيق</strong> لحل مشاكل المفاتيح المكررة والتعارضات</p>
                  <p className="text-destructive font-semibold mt-1">تحذير: سيؤدي إعادة ضبط التطبيق إلى مسح جميع البيانات المخزنة محليًا</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SyncAdvancedOptions;
