
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeft, RefreshCw, Settings } from "lucide-react";
import ErrorMessage from "@/components/ui/error-message";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoToAdmin = () => {
    navigate("/admin");
  };

  const handleGoToCMS = () => {
    navigate("/cms-admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
          <p className="text-2xl font-medium text-foreground mb-1">صفحة غير موجودة</p>
          <p className="text-muted-foreground mb-6">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <p className="text-xs text-muted-foreground mb-8 px-4">
            المسار: <span dir="ltr" className="font-mono">{location.pathname}</span>
          </p>
          
          {location.pathname.includes('/admin') && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-800 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                إذا كنت تحاول الوصول إلى لوحة المشرف، يرجى التأكد من أنك مسجل الدخول أو تجربة التنقل من الصفحة الرئيسية.
              </p>
              <div className="mt-3 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleGoToAdmin}
                  className="flex items-center gap-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                >
                  <Settings className="h-4 w-4" />
                  <span>الذهاب للوحة المشرف</span>
                </Button>
              </div>
            </div>
          )}

          {location.pathname.includes('/cms') && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-md border border-emerald-200 dark:border-emerald-800 mb-6">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                إذا كنت تحاول الوصول إلى نظام إدارة المحتوى، يرجى التأكد من أنك مسجل الدخول أو تجربة التنقل من لوحة المشرف.
              </p>
              <div className="mt-3 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleGoToCMS}
                  className="flex items-center gap-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                >
                  <Settings className="h-4 w-4" />
                  <span>نظام إدارة المحتوى</span>
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>العودة</span>
          </Button>
          
          <Button 
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <HomeIcon className="h-4 w-4" />
            <span>الصفحة الرئيسية</span>
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
