
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

// إنشاء عميل استعلام معزز مع تقليل زمن التخزين المؤقت لضمان الحصول على البيانات المحدثة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // تقليل إلى دقيقتين (كان 5 دقائق)
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnMount: true,     // إضافة خاصية جديدة
      refetchOnReconnect: true, // إضافة خاصية جديدة
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
        // فحص حالة المزامنة وتنفيذها إذا لزم الأمر
        const lastSync = getLastSyncTime();
        const now = Date.now();
        
        if (!lastSync || (now - new Date(lastSync).getTime() > 5 * 60 * 1000)) {
          console.log('بدء المزامنة الأولية عند تشغيل التطبيق...');
          
          // محاولة المزامنة مع معالجة الأخطاء
          try {
            await syncAllData();
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
        } else {
          console.log('آخر مزامنة حديثة، تخطي المزامنة الأولية');
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
    
    // إعداد مستمع التغييرات في الإعدادات والبيانات
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
  }, [toast]); // إضافة toast إلى مصفوفة التبعيات
  
  // ننتظر اكتمال تهيئة التطبيق قبل عرض المحتوى الرئيسي
  // لكن لا نظهر شاشة تحميل إضافية حتى لا نربك المستخدم، نستمر بعرض SplashScreen العادية
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
              {/* مسار صفحة الإعدادات */}
              <Route path="/settings" element={
                <>
                  <UserSettings />
                  <Navigation />
                </>
              } />
              {/* مسار المشرف */}
              <Route path="/admin" element={
                <>
                  <Admin />
                  <Navigation />
                </>
              } />
              {/* مسار الالتقاط لجميع المسارات غير الموجودة */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
