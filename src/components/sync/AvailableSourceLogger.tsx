
import React, { useEffect } from 'react';

interface AvailableSourceLoggerProps {
  availableSource: string | null;
}

const AvailableSourceLogger: React.FC<AvailableSourceLoggerProps> = ({ availableSource }) => {
  // Log available source in development mode
  useEffect(() => {
    if (availableSource && process.env.NODE_ENV === 'development') {
      console.log(`المصدر المتاح للبيانات: ${availableSource}`);
    }
  }, [availableSource]);
  
  // This is a logging component with no UI of its own
  return null;
};

export default AvailableSourceLogger;
