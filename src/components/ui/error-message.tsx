
import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = "حدث خطأ أثناء تحميل البيانات", 
  message = "يرجى المحاولة مرة أخرى لاحقاً" 
}) => {
  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl shadow-xl border border-red-200 dark:border-red-800 animate-fade-in">
        <p className="text-2xl text-red-600 dark:text-red-400 mb-3 font-bold">{title}</p>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
