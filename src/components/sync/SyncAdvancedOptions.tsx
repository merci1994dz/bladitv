
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Server, Database, Globe, List } from 'lucide-react';
import { resetAppData } from '@/services/sync/forceRefresh';
import { toast } from '@/hooks/use-toast';
import { BLADI_INFO_SOURCES } from '@/services/sync/remote/sync/sources';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SyncAdvancedOptionsProps {
  showAdvanced: boolean;
  availableSource: string | null;
}

const SyncAdvancedOptions: React.FC<SyncAdvancedOptionsProps> = ({ 
  showAdvanced, 
  availableSource 
}) => {
  const [showAllSources, setShowAllSources] = useState(false);
  
  // وظيفة لاختبار توفر المصدر
  const testSource = async (source: string) => {
    try {
      toast({
        title: "جاري اختبار المصدر",
        description: `محاولة الاتصال بـ ${source}`,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // إضافة معلمات منع التخزين المؤقت
      const testUrl = source + (source.includes('?') ? '&' : '?') + '_nocache=' + Date.now();
      
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        toast({
          title: "المصدر متاح",
          description: "يمكن الوصول إلى المصدر بنجاح",
          variant: "success",
        });
        
        // حفظ هذا المصدر كمصدر مفضل
        localStorage.setItem('preferred_source', source);
        
        return true;
      } else {
        toast({
          title: "المصدر غير متاح",
          description: `الخادم استجاب برمز: ${response.status}`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "فشل الاختبار",
        description: "تعذر الاتصال بالمصدر",
        variant: "destructive",
      });
      return false;
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
  
  // وظيفة لتعيين المصدر الافتراضي
  const setDefaultSource = (source: string) => {
    localStorage.setItem('default_source', source);
    toast({
      title: "تم تعيين المصدر الافتراضي",
      description: "سيتم استخدام هذا المصدر في المزامنات القادمة",
    });
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
          خيارات متقدمة للمزامنة
        </h3>
        
        <Accordion type="single" collapsible className="w-full">
          {/* معلومات المصدر الحالي */}
          <AccordionItem value="current-source">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                المصدر الحالي
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-2 bg-muted rounded-md">
                {availableSource ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 truncate max-w-[200px]">
                        {availableSource}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => testSource(availableSource)}
                      >
                        اختبار
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="w-full mt-2 h-7 text-xs"
                      onClick={() => setDefaultSource(availableSource)}
                    >
                      تعيين كمصدر افتراضي
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    غير متاح
                  </Badge>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* قائمة جميع المصادر */}
          <AccordionItem value="all-sources">
            <AccordionTrigger className="text-sm py-2">
              <span className="flex items-center gap-2">
                <List className="h-4 w-4" />
                قائمة المصادر المتاحة
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">اختر أحد المصادر لاختباره أو تعيينه كمصدر افتراضي</span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-6 text-xs"
                    onClick={() => setShowAllSources(!showAllSources)}
                  >
                    {showAllSources ? "عرض المصادر الرئيسية" : "عرض جميع المصادر"}
                  </Button>
                </div>
                
                {/* عرض المصادر - إما الرئيسية فقط أو الكل حسب الحالة */}
                <div className="max-h-40 overflow-y-auto space-y-2 bg-muted/50 p-2 rounded-md">
                  {(showAllSources ? BLADI_INFO_SOURCES : BLADI_INFO_SOURCES.slice(0, 5)).map((source, index) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-card p-2 rounded">
                      <span className="truncate max-w-[180px]">{source}</span>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => testSource(source)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => setDefaultSource(source)}
                        >
                          <Server className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SyncAdvancedOptions;
