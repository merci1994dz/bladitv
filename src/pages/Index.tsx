
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';

/**
 * صفحة المدخل الرئيسية التي توجه المستخدم إلى صفحة البداية
 */
const Index: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // التحقق من وجود بيانات البدء المخزنة
    const hasStartupData = localStorage.getItem('startup_completed');
    
    // إعداد مهلة زمنية لمنع تعليق التطبيق
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('تم تجاوز وقت انتظار التحميل، توجيه المستخدم إلى الصفحة الرئيسية');
        navigate('/home', { replace: true });
      }
    }, 5000);
    
    try {
      // التوجيه الفوري إلى صفحة البداية
      console.log('التوجيه إلى صفحة البداية...');
      
      // إذا تم إكمال عملية البدء من قبل، التوجيه مباشرة إلى الصفحة الرئيسية
      if (hasStartupData) {
        navigate('/home', { replace: true });
      } else {
        navigate('/splash', { replace: true });
      }
    } catch (err) {
      console.error('خطأ أثناء التوجيه:', err);
      setError('حدث خطأ أثناء تحميل التطبيق. يرجى تحديث الصفحة.');
      // في حالة الخطأ، حاول التوجيه للصفحة الرئيسية بعد تأخير
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 2000);
    } finally {
      setIsLoading(false);
      clearTimeout(timeout);
    }
    
    return () => clearTimeout(timeout);
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="bg-destructive/10 p-6 rounded-xl text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-2">خطأ في التحميل</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <LoadingIndicator text="جاري التحميل..." />
    </div>
  );
};

export default Index;
