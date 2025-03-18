
import React from 'react';

const AdminLoading: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto px-4 pb-32 pt-4 flex justify-center items-center h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground">جاري التحقق من الجلسة...</p>
      </div>
    </div>
  );
};

export default AdminLoading;
