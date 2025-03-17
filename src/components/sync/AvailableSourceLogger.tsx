
import React, { useEffect, useCallback } from 'react';

interface AvailableSourceLoggerProps {
  availableSource: string | null;
}

const AvailableSourceLogger: React.FC<AvailableSourceLoggerProps> = ({ availableSource }) => {
  // استخدام useCallback لتحسين الأداء ومنع إعادة الإنشاء غير الضرورية
  const logAvailability = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      if (availableSource) {
        console.log(`المصدر المتاح للبيانات: ${availableSource}`);
      } else {
        console.warn('تنبيه: لم يتم العثور على أي مصدر متاح للبيانات');
      }
    }
    
    // إضافة معلومات مصدر البيانات إلى تخزين الجلسة للاستخدام في معالجة الأخطاء
    try {
      if (availableSource) {
        sessionStorage.setItem('last_available_source', availableSource);
        sessionStorage.setItem('last_source_check_time', Date.now().toString());
      }
    } catch (e) {
      // تجاهل أخطاء التخزين
    }
  }, [availableSource]);
  
  // تسجيل مصدر البيانات المتاح عند التغيير فقط
  useEffect(() => {
    logAvailability();
  }, [availableSource, logAvailability]);
  
  // هذا مكون تسجيل بدون واجهة مستخدم خاصة به
  return null;
};

export default AvailableSourceLogger;
