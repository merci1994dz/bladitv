
import React from 'react';
import { Button } from './button';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  code?: string | number;
  showRefresh?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = "حدث خطأ أثناء تحميل البيانات", 
  message = "يرجى المحاولة مرة أخرى لاحقاً",
  code,
  showRefresh = true,
  showHome = true,
  onRetry
}) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-[50vh] flex justify-center items-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-xl shadow-xl border border-red-200 dark:border-red-800 animate-fade-in max-w-md w-full">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500 dark:text-red-400" />
        </div>
        
        <p className="text-2xl text-red-600 dark:text-red-400 mb-3 font-bold">{title}</p>
        
        {code && (
          <div className="bg-red-100 dark:bg-red-800/30 px-3 py-1 rounded-md mb-3 inline-block">
            <span className="text-sm font-mono text-red-600 dark:text-red-400">خطأ {code}</span>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-center flex-wrap">
          {showRefresh && (
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>إعادة المحاولة</span>
            </Button>
          )}
          
          {showHome && (
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span>الصفحة الرئيسية</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
