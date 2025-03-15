
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "./hooks/use-toast";
import { syncAllData } from "./services/sync";
import { setupSettingsListener } from "./services/sync/settingsSync";
import AutoSyncProvider from "./components/AutoSyncProvider";
import AppRoutes from "./AppRoutes";
import Navigation from "./components/Navigation";

// تكوين عميل الاستعلام مع إعدادات محسّنة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // دقيقة واحدة
      gcTime: 1000 * 60 * 5, // 5 دقائق (تم تغييره من cacheTime)
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnMount: true,     
      refetchOnReconnect: true, 
      refetchInterval: 1000 * 60 * 10, // كل 10 دقائق
    },
  },
});

const App = () => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // تحسين دالة التهيئة وتقليل التعقيد
  useEffect(() => {
    console.log('تهيئة التطبيق والمستمعات...');
    
    let mounted = true;
    
    // وظيفة مبسطة للتهيئة
    const initialize = async () => {
      try {
        // مزامنة البيانات عند بدء التشغيل مع تبسيط العملية
        console.log('بدء المزامنة عند تشغيل التطبيق...');
        
        try {
          await syncAllData(true);
          if (mounted) {
            toast({
              title: "تم تحديث البيانات",
              description: "تم تحديث البيانات بنجاح",
              duration: 3000,
            });
            setIsInitialized(true);
          }
        } catch (syncError) {
          console.error('خطأ أثناء المزامنة الأولية:', syncError);
          if (mounted) {
            toast({
              title: "تعذر تحديث البيانات",
              description: "سيتم إعادة المحاولة لاحقًا",
              variant: "destructive",
              duration: 4000,
            });
            // نستمر في التطبيق حتى مع وجود خطأ
            setIsInitialized(true);
          }
        }
      } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };
    
    // إعداد مستمع التغييرات في الإعدادات
    const cleanupSettingsListener = setupSettingsListener();
    
    // بدء عملية التهيئة
    initialize();
    
    // إضافة علامة زمنية لبدء التطبيق
    localStorage.setItem('app_started', Date.now().toString());
    
    // التنظيف عند إزالة المكون
    return () => {
      mounted = false;
      cleanupSettingsListener();
    };
  }, [toast]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AutoSyncProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </AutoSyncProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
