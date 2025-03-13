
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Radio, Play, Star } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000); // تحويل بعد 3 ثوان

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-blue-700 flex flex-col items-center justify-center overflow-hidden">
      <div className="animate-bounce mb-8 relative">
        <div className="w-32 h-32 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
          <div className="text-primary text-5xl font-bold flex items-center relative">
            <Tv className="h-12 w-12" />
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full animate-pulse"></span>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full animate-pulse-slow opacity-80 glass"></div>
        <div className="absolute -bottom-2 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse-slow opacity-80 glass delay-75"></div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-2 animate-scale shadow-text">بلادي TV</h1>
      <p className="text-white/90 text-xl mb-4 shadow-text">شاهد قنواتك المفضلة مجاناً</p>
      <p className="text-white/70 text-lg mb-10 shadow-text">أكثر من 1000 قناة مباشرة</p>
      
      <div className="flex gap-8 mb-10">
        <div className="flex flex-col items-center glass-dark p-4 rounded-lg">
          <Radio className="h-6 w-6 text-white mb-2" />
          <span className="text-white/90 text-sm">راديو</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-4 rounded-lg">
          <Play className="h-6 w-6 text-white mb-2" />
          <span className="text-white/90 text-sm">بث مباشر</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-4 rounded-lg">
          <Star className="h-6 w-6 text-white mb-2" />
          <span className="text-white/90 text-sm">مفضلة</span>
        </div>
      </div>
      
      <div className="mt-8 relative w-64 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-white animate-[progress_3s_linear]"></div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <p className="text-white/70 text-xs">v1.1.0 © 2023 بلادي TV</p>
      </div>
    </div>
  );
};

export default SplashScreen;
