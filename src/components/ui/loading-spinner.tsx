
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "جاري تحميل البيانات..." }) => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-primary font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
