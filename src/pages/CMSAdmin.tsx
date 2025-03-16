
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Settings, 
  Users, 
  Calendar, 
  Layers, 
  Home, 
  LogOut 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { initializeCMS, getCMSSettings } from '@/services/cms';
import { verifyAdminSession, logoutAdmin } from '@/services/adminService';
import AdminLogin from '@/components/AdminLogin';
import { useToast } from '@/hooks/use-toast';

// سيتم إنشاء هذه المكونات لاحقًا
import CMSSettings from '@/components/cms/CMSSettings';
import CMSUsers from '@/components/cms/CMSUsers';
import CMSLayouts from '@/components/cms/CMSLayouts';
import CMSContentBlocks from '@/components/cms/CMSContentBlocks';
import CMSSchedules from '@/components/cms/CMSSchedules';

const CMSAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('layouts');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // التحقق من حالة المصادقة عند تحميل الصفحة
  useEffect(() => {
    const checkAuth = () => {
      const isValid = verifyAdminSession();
      setIsAuthenticated(isValid);
      
      if (isValid) {
        // تهيئة نظام إدارة المحتوى إذا لم يكن مهيأ بالفعل
        if (!localStorage.getItem('cms_initialized')) {
          initializeCMS();
        }
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: "أهلاً بك في نظام إدارة المحتوى",
    });
    
    // تهيئة CMS بعد تسجيل الدخول
    initializeCMS();
  };
  
  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  };
  
  const handleGoToMainAdmin = () => {
    navigate('/admin');
  };
  
  const handleGoToWebsite = () => {
    navigate('/');
  };
  
  // عرض شاشة تسجيل الدخول إذا لم يكن المستخدم مصادقًا
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  
  return (
    <div className="container max-w-7xl mx-auto px-4 pb-32 pt-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">نظام إدارة المحتوى</h1>
          <p className="text-muted-foreground">
            قم بإدارة محتوى الموقع وتخصيص تجربة المستخدم
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleGoToMainAdmin}>
            لوحة المشرف الرئيسية
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoToWebsite}>
            <Home className="h-4 w-4 mr-2" />
            العودة للموقع
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full mb-8">
          <TabsTrigger value="layouts" className="flex-1">
            <LayoutGrid className="h-4 w-4 mr-2" />
            <span>التخطيطات</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1">
            <Layers className="h-4 w-4 mr-2" />
            <span>كتل المحتوى</span>
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            <span>الجداول</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            <span>المستخدمون</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            <span>الإعدادات</span>
          </TabsTrigger>
        </TabsList>
        
        <Card className="border shadow mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">
              {activeTab === 'layouts' && 'إدارة تخطيطات الصفحات'}
              {activeTab === 'content' && 'إدارة كتل المحتوى'}
              {activeTab === 'schedules' && 'جداول عرض المحتوى'}
              {activeTab === 'users' && 'إدارة المستخدمين'}
              {activeTab === 'settings' && 'إعدادات النظام'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'layouts' && 'قم بتصميم تخطيطات مخصصة للصفحات المختلفة في الموقع'}
              {activeTab === 'content' && 'إنشاء وتعديل كتل المحتوى التي يمكن استخدامها في التخطيطات'}
              {activeTab === 'schedules' && 'تحديد جداول زمنية لعرض تخطيطات معينة في أوقات مختلفة'}
              {activeTab === 'users' && 'إدارة مستخدمي نظام إدارة المحتوى وصلاحياتهم'}
              {activeTab === 'settings' && 'تخصيص إعدادات النظام والموقع'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <TabsContent value="layouts">
              <CMSLayouts />
            </TabsContent>
            
            <TabsContent value="content">
              <CMSContentBlocks />
            </TabsContent>
            
            <TabsContent value="schedules">
              <CMSSchedules />
            </TabsContent>
            
            <TabsContent value="users">
              <CMSUsers />
            </TabsContent>
            
            <TabsContent value="settings">
              <CMSSettings />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      <div className="mt-12 text-center">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 hover:bg-red-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
};

export default CMSAdmin;
