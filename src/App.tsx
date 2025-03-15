
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
import { useEffect } from "react";
import { setupSettingsListener } from "./services/sync/settingsSync";
import { syncAllData } from "./services/sync";

// إنشاء عميل استعلام ثابت
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => {
  // تهيئة مستمعات التغييرات عند بدء التطبيق
  useEffect(() => {
    console.log('تهيئة التطبيق والمستمعات...');
    
    // إعداد مستمع التغييرات في الإعدادات والبيانات
    const cleanupSettingsListener = setupSettingsListener();
    
    // مزامنة البيانات عند بدء التطبيق
    syncAllData().catch(console.error);
    
    // إضافة علامة زمنية لبدء التطبيق
    localStorage.setItem('app_started', Date.now().toString());
    
    return () => {
      // تنظيف المستمعات عند إغلاق التطبيق
      cleanupSettingsListener();
    };
  }, []);

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
