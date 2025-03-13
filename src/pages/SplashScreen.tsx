
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Radio, Play, Star, ArrowRight } from 'lucide-react';
import { APP_VERSION } from '@/services/config';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // تحسين تحميل التطبيق باستخدام مؤقت للتحديث التدريجي لشريط التقدم
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 70);

    // توجيه المستخدم بعد اكتمال التحميل
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-primary flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyIiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmZmZmYxMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      
      <div className="relative animate-bounce mb-8 z-10">
        <div className="relative w-36 h-36 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/50">
          <div className="text-primary text-5xl font-bold flex items-center relative">
            <Tv className="h-14 w-14" />
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 rounded-full animate-pulse"></span>
          </div>
          
          <div className="absolute -top-4 -right-4 w-14 h-14 bg-red-500/80 rounded-full animate-pulse-slow opacity-80 glass"></div>
          <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-yellow-400/80 rounded-full animate-pulse-slow opacity-80 glass delay-75"></div>
        </div>
        
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
      </div>
      
      <div className="z-10 text-center">
        <h1 className="text-6xl font-bold text-white mb-2 animate-scale shadow-text">بلادي TV</h1>
        <p className="text-white/90 text-2xl mb-4 shadow-text">شاهد قنواتك المفضلة مجاناً</p>
        <p className="text-white/70 text-lg mb-6 shadow-text">أكثر من 1000 قناة مباشرة</p>
      </div>
      
      <div className="flex gap-8 mb-10 z-10">
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform cursor-pointer shadow-lg">
          <Radio className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">راديو</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform cursor-pointer shadow-lg">
          <Play className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">بث مباشر</span>
        </div>
        <div className="flex flex-col items-center glass-dark p-5 rounded-xl transform hover:scale-105 transition-transform cursor-pointer shadow-lg">
          <Star className="h-7 w-7 text-white mb-2" />
          <span className="text-white/90 text-sm">مفضلة</span>
        </div>
      </div>
      
      <div className="relative mt-6 w-64 h-3 bg-white/20 rounded-full overflow-hidden z-10">
        <div 
          className="absolute top-0 left-0 h-full bg-white/80 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <button 
        onClick={() => navigate('/home')}
        className="mt-8 bg-white/20 hover:bg-white/30 text-white rounded-full py-2.5 px-7 flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/10 z-10 shadow-lg hover:shadow-xl"
      >
        <span>ابدأ الآن</span>
        <ArrowRight className="h-4 w-4" />
      </button>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <p className="text-white/70 text-xs">{APP_VERSION} © 2024 بلادي TV</p>
      </div>
      
      {/* إضافة عناصر زخرفية للخلفية */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-40 h-40 bg-indigo-500/20 rounded-full filter blur-3xl animate-float"></div>
    </div>
  );
};

export default SplashScreen;
