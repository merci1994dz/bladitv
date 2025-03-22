
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Server, Database, Globe } from 'lucide-react';
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
  
  // وظيفة لمزامنة البيانات مع Supabase
  const syncWithSupabaseDb = async () => {
    try {
      setIsSyncing(true);
      
      toast({
        title: "جاري المزامنة مع Supabase",
        description: "جاري تحديث البيانات من قاعدة البيانات...",
      });

      const result = await syncWithSupabase(true);
      
      if (result) {
        toast({
          title: "تمت المزامنة",
          description: "تم تحديث البيانات بنجاح من Supabase",
          variant: "default",
        });
        
        return true;
      } else {
        toast({
          title: "فشلت المزامنة",
          description: "تعذر مزامنة البيانات مع Supabase",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "فشل الاتصال",
        description: "تعذر الاتصال بـ Supabase",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  // وظيفة لإعادة ضبط التطبيق
  const handleResetApp = async () => {
    const confirmReset = window.confirm("هل أنت متأكد من إعادة ضبط التطبيق؟ سيتم مسح جميع البيانات المخزنة محليًا.");
    
    if (confirmReset) {
      toast({
        title: "جاري إعادة ضبط التطبيق",
        description: "جاري مسح جميع البيانات المخزنة وإعادة تحميل الصفحة...",
        duration: 3000,
      });
      
      await resetAppData();
      
      // إعادة تحميل الصفحة بعد مهلة قصيرة
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname + 
          `?reset=${Date.now()}&nocache=true`;
      }, 2000);
    }
  };
  
  // وظيفة لمسح معلومات التخزين المؤقت
  const clearCacheData = () => {
    const cacheKeys = [
      'last_sync_time', 'last_sync', 'sync_start_time',
      'sync_error', 'sync_status', 'sync_state',
      'channel_last_update', 'data_version'
    ];
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "تم مسح بيانات المزامنة",
      description: "تم مسح معلومات التخزين المؤقت للمزامنة",
    });
    
    // إعادة تحميل الصفحة بعد مهلة قصيرة
    setTimeout(() => {
        window.location.reload();
    }, 1000);
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
          {/* معلومات حالة الاتصال */}
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
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {availableSource ? 'متصل' : 'غير متصل'}
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
                  <AlertTriangle className="h-3 w-3 ml-1" />
                </Button>
                
                <div className="text-xs text-muted-foreground mt-2">
                  تحذير: سيؤدي إعادة ضبط التطبيق إلى مسح جميع البيانات المخزنة محليًا وإعادة تحميل الصفحة
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
