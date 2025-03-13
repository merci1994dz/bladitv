
import React from 'react';

const TVRemoteHelp: React.FC = () => {
  return (
    <div className="absolute bottom-20 left-0 right-0 flex justify-center">
      <div className="bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm flex flex-wrap gap-4 shadow-lg border border-white/10 animate-fade-in">
        <div className="flex items-center">
          <span className="border rounded px-2 py-1 mx-1 bg-white/10">◄</span>
          <span className="border rounded px-2 py-1 mx-1 bg-white/10">►</span>
          <span className="mr-1">تنقل</span>
        </div>
        <div className="flex items-center">
          <span className="border rounded px-2 py-1 mx-1 bg-white/10">OK</span>
          <span className="mr-1">اختيار</span>
        </div>
        <div className="flex items-center">
          <span className="border rounded px-2 py-1 mx-1 bg-white/10">مسافة</span>
          <span className="mr-1">تشغيل/إيقاف</span>
        </div>
        <div className="flex items-center">
          <span className="border rounded px-2 py-1 mx-1 bg-white/10">0-9</span>
          <span className="mr-1">اختيار قناة</span>
        </div>
      </div>
    </div>
  );
};

export default TVRemoteHelp;
