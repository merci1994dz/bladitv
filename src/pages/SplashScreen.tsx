
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Radio, Play, Star, ArrowRight } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3500); // تحويل بعد 3.5 ثوان

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-blue-600 to-blue-800 flex flex-col items-center justify-center overflow-hidden">
      <div className="animate-bounce mb-8 relative">
        <div className="w-36 h-36 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl">
          <div className="text-primary text-5xl font-bold flex items-center relative">
            <Tv className="h-14 w-14" />
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full animate-pulse"></span>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-14 h-14 bg-red-500 rounded-full animate-pulse-slow opacity-80 glass"></div>
        <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-yellow-400 rounded-full animate-pulse-slow opacity-80 glass delay-75"></div>
      </div>
      
      <h1 className="text-6xl font-bold text-white mb-2 animate-scale shadow-text">بلادي TV</h1>
      <p className="text-white/90 text-2xl mb-4 shadow-text">شاهد قنواتك المفضلة مجاناً</p>
      <p className="text-white/70 text-lg mb-12 shadow-text">أكثر من 1000 قناة مباشرة</p>
      
      <div className="flex gap-8 mb-12">
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform">
          <Radio className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">راديو</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform">
          <Play className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">بث مباشر</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform">
          <Star className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">مفضلة</span>
        </div>
      </div>
      
      <div className="relative mt-8 w-64 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-white animate-[progress_3.5s_linear]"></div>
      </div>
      
      <button 
        onClick={() => navigate('/home')}
        className="mt-8 bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-6 flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10"
      >
        <span>ابدأ الآن</span>
        <ArrowRight className="h-4 w-4" />
      </button>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <p className="text-white/70 text-xs">v1.2.0 © 2024 بلادي TV</p>
      </div>
    </div>
  );
};

export default SplashScreen;
