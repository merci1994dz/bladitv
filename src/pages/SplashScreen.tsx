
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '@/components/LoadingIndicator';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // تأخير الانتقال للصفحة الرئيسية لعرض شاشة البداية
    console.log('تهيئة شاشة البداية...');
    
    const checkInitialRequirements = async () => {
      try {
        console.log('التحقق من متطلبات التشغيل الأساسية...');
        // تحقق من الاتصال إذا كان ذلك ممكنًا
        const onlineStatus = navigator.onLine;
        console.log('حالة الاتصال بالإنترنت:', onlineStatus ? 'متصل' : 'غير متصل');
        
        // محاكاة عملية التحميل
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // الانتقال إلى الشاشة الرئيسية
        setIsLoading(false);
        navigate('/home', { replace: true });
      } catch (err) {
        console.error('خطأ أثناء تهيئة التطبيق:', err);
        setError('حدث خطأ أثناء تحميل التطبيق. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
      }
    };
    
    checkInitialRequirements();
    
    // تعيين وقت أقصى للانتظار
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('تجاوز وقت التحميل، الانتقال للرئيسية...');
        setIsLoading(false);
        navigate('/home', { replace: true });
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, isLoading]);

  return (
    <div className="splash-screen min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <div className="logo-container mb-8">
        <img src="/placeholder.svg" alt="Bladi TV" className="h-24 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Bladi TV</h1>
        <p className="text-gray-400">شاهد قنوات التلفزيون المباشرة</p>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <LoadingIndicator text="جاري التحميل..." />
        </div>
      ) : error ? (
        <div className="error-container text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="bg-primary px-4 py-2 rounded hover:bg-primary/80 transition-colors"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SplashScreen;
