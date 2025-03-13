
import React from 'react';
import { Tv, Globe, MapPin } from 'lucide-react';

const HomeHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary/20 via-primary/15 to-primary/5 py-8 mb-8 shadow-md relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          {/* App Logo with animation */}
          <div className="flex items-center mb-5 animate-float">
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-3 mr-3 shadow-lg transform transition-all hover:scale-105">
              <Tv className="text-white h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
              بلادي TV
            </h1>
          </div>
          
          <div className="flex items-center mt-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-primary rounded-full p-2 mr-2 shadow-md">
              <Globe className="text-white h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300">
              تصفح حسب البلد
            </h2>
          </div>
          
          <p className="text-center text-muted-foreground mt-2 text-sm flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 px-4 py-2 rounded-full shadow-sm">
            <MapPin className="h-4 w-4 text-primary" />
            اختر البلد لمشاهدة القنوات المتاحة
          </p>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
