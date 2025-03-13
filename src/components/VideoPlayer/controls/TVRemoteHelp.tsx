
import React from 'react';

const TVRemoteHelp: React.FC = () => {
  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center">
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs flex gap-4">
        <div className="flex items-center">
          <span className="border rounded px-1.5 mx-1">◄</span>
          <span className="border rounded px-1.5 mx-1">►</span>
          <span className="mr-1">تنقل</span>
        </div>
        <div className="flex items-center">
          <span className="border rounded px-1.5 mx-1">OK</span>
          <span className="mr-1">اختيار</span>
        </div>
        <div className="flex items-center">
          <span className="border rounded px-1.5 mx-1">مسافة</span>
          <span className="mr-1">تشغيل/إيقاف</span>
        </div>
      </div>
    </div>
  );
};

export default TVRemoteHelp;
