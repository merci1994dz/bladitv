
import React from 'react';
import { Tv, Globe } from 'lucide-react';

const HomeHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary/20 via-primary/15 to-primary/5 py-6 mb-8 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          {/* شعار التطبيق */}
          <div className="flex items-center mb-3">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-3 mr-3 shadow-lg">
              <Tv className="text-white h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              بلادي TV
            </h1>
          </div>
          <div className="flex items-center mt-2">
            <div className="bg-gradient-to-r from-blue-600 to-primary rounded-full p-2 mr-2 shadow-md">
              <Globe className="text-white h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300">
              تصفح حسب البلد
            </h2>
          </div>
          <p className="text-center text-muted-foreground mt-2 text-sm">اختر البلد لمشاهدة القنوات المتاحة</p>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
