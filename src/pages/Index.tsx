
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../components/LoadingIndicator';

/**
 * صفحة المدخل الرئيسية التي توجه المستخدم إلى الصفحة المناسبة
 */
const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // التوجيه الفوري إلى الصفحة الرئيسية بدون تأخير
    console.log('التوجيه إلى الصفحة الرئيسية فوراً...');
    navigate('/home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <LoadingIndicator text="جاري التحميل..." />
    </div>
  );
};

export default Index;
