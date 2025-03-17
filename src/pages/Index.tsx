
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';

/**
 * صفحة المدخل الرئيسية التي توجه المستخدم إلى الصفحة المناسبة
 */
const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد تأخير قصير
    const timer = setTimeout(() => {
      console.log('التوجيه إلى الصفحة الرئيسية...');
      navigate('/home', { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <LoadingIndicator text="جاري التحميل..." />
    </div>
  );
};

export default Index;
