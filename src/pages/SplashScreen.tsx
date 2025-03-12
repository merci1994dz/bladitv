
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000); // تحويل بعد 3 ثوان

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-blue-700 flex flex-col items-center justify-center">
      <div className="animate-bounce mb-8">
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
          <div className="text-primary text-5xl font-bold">TV</div>
        </div>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">بلادي TV</h1>
      <p className="text-white/80 text-lg">شاهد قنواتك المفضلة مجاناً</p>
      
      <div className="mt-12 relative w-64 h-2 bg-white/30 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-white animate-[progress_3s_linear]"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
