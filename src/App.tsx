import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Countries from "./pages/Countries";
import CountryChannels from "./pages/CountryChannels";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Admin from "./pages/Admin";
import Navigation from "./components/Navigation";
import NotFound from "./pages/NotFound";
import UserSettings from "./pages/UserSettings";
import { useEffect, useState } from "react";
import { setupSettingsListener, forceAppReloadForAllUsers } from "./services/sync/settingsSync";
import { syncAllData, getLastSyncTime } from "./services/sync";
import { useToast } from "./hooks/use-toast";
import AutoSyncProvider from "./components/AutoSyncProvider";

// إنشاء عميل استعلام معزز مع تقليل زمن التخزين المؤقت لضمان الحصول على البيانات المحدثة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // تقليل إلى دقيقة واحدة فقط
      cacheTime: 1000 * 60 * 5, // تخزين مؤقت للبيانات لمدة 5 دقائق
      retry: 3, // زيادة عدد المحاولات
      refetchOnWindowFocus: true,
      refetchOnMount: true,     
      refetchOnReconnect: true, 
      refetchInterval: 1000 * 60 * 10, // إعادة جلب البيانات كل 10 دقائق
    },
  },
});

const App = () => {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // دالة محسنة للتهيئة
  useEffect(() => {
    console.log('تهيئة التطبيق والمستمعات...');
    
    let mounted = true;
    
    // وظيفة التهيئة
    const initialize = async () => {
      try {
        // إجبار تحديث البيانات عند كل بدء تشغيل (تعديل مهم)
        console.log('بدء المزامنة الإجبارية عند تشغيل التطبيق...');
        
        try {
          await syncAllData(true); // إجبار المزامنة
          if (mounted) {
            toast({
              title: "تم تحديث البيانات",
              description: "تم تحديث البيانات بنجاح",
              duration: 3000,
            });
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
          }
        }
        
        if (mounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        if (mounted) {
          setIsInitialized(true); // نستمر في التطبيق حتى مع وجود خطأ
        }
      }
    };
    
    // إعداد مستمع التغييرات في الإعدادات والبيانات - محسن
    const cleanupSettingsListener = setupSettingsListener();
    
    // بدء عملية التهيئة
    initialize();
    
    // حل مشكلة التخزين المؤقت عن طريق إضافة معلمة عشوائية إلى عنوان URL
    const currentUrl = window.location.href;
    if (!currentUrl.includes('nocache=') && !currentUrl.includes('refresh=')) {
      const separator = currentUrl.includes('?') ? '&' : '?';
      const newUrl = `${currentUrl}${separator}nocache=${Date.now()}`;
      window.history.replaceState(null, document.title, newUrl);
    }
    
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
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/home" element={
                  <>
                    <Home />
                    <Navigation />
                  </>
                } />
                <Route path="/categories" element={
                  <>
                    <Categories />
                    <Navigation />
                  </>
                } />
                <Route path="/countries" element={
                  <>
                    <Countries />
                    <Navigation />
                  </>
                } />
                <Route path="/country/:countryId" element={
                  <>
                    <CountryChannels />
                    <Navigation />
                  </>
                } />
                <Route path="/search" element={
                  <>
                    <Search />
                    <Navigation />
                  </>
                } />
                <Route path="/favorites" element={
                  <>
                    <Favorites />
                    <Navigation />
                  </>
                } />
                <Route path="/settings" element={
                  <>
                    <UserSettings />
                    <Navigation />
                  </>
                } />
                <Route path="/admin" element={
                  <>
                    <Admin />
                    <Navigation />
                  </>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AutoSyncProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
