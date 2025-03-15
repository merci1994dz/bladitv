
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tv, Globe, History, Settings, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [isHosted, setIsHosted] = useState(false);
  
  useEffect(() => {
    // التحقق مما إذا كان التطبيق مستضافًا
    setIsHosted(window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1'));
    
    // تسجيل معلومات الاستضافة للتصحيح
    console.log('معلومات الاستضافة:', {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      fullUrl: window.location.href
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-4">IPTV Streaming</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            شاهد قنواتك المفضلة مباشرة بجودة عالية
          </p>
          {isHosted && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              تم استضافة التطبيق بنجاح!
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* الصفحة الرئيسية */}
          <Link to="/home">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Tv className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>الصفحة الرئيسية</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500 dark:text-gray-400">
                تصفح جميع القنوات المتاحة وشاهد بثها المباشر
              </CardContent>
            </Card>
          </Link>
          
          {/* البلدان */}
          <Link to="/countries">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>البلدان</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500 dark:text-gray-400">
                تصفح القنوات حسب البلد
              </CardContent>
            </Card>
          </Link>
          
          {/* المفضلة */}
          <Link to="/favorites">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>المفضلة</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500 dark:text-gray-400">
                عرض قنواتك المفضلة
              </CardContent>
            </Card>
          </Link>
          
          {/* المشاهدات الأخيرة */}
          <Link to="/history">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>المشاهدات الأخيرة</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500 dark:text-gray-400">
                تاريخ القنوات التي شاهدتها مؤخراً
              </CardContent>
            </Card>
          </Link>
          
          {/* الإعدادات */}
          <Link to="/settings">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>الإعدادات</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-500 dark:text-gray-400">
                ضبط إعدادات التطبيق وتخصيصه
              </CardContent>
            </Card>
          </Link>
          
          {/* لوحة التحكم */}
          <Link to="/admin">
            <Card className="h-full hover:border-primary/50 transition-all cursor-pointer bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-800/30 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                </div>
                <CardTitle className="text-amber-800 dark:text-amber-500">لوحة التحكم</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-amber-600 dark:text-amber-400">
                إدارة القنوات وإعدادات التطبيق (للمسؤولين فقط)
              </CardContent>
            </Card>
          </Link>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            تم تطوير هذا التطبيق للعمل على استضافة Namecheap بشكل مثالي
          </p>
          
          {isHosted ? (
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✓ تم تثبيت التطبيق بنجاح على الاستضافة
            </div>
          ) : (
            <Button onClick={() => window.location.reload()}>
              اختبار توافق الاستضافة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
