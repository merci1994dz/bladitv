
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Brush, 
  Sliders, 
  HardDrive, 
  Shield, 
  Globe,
  Tv 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import InterfaceSettings from '@/components/settings/InterfaceSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDeviceType } from '@/hooks/use-tv';
import { Card, CardContent } from '@/components/ui/card';

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isTV, isMobile } = useDeviceType();
  const [activeTab, setActiveTab] = useState('interface');
  
  const handleSaveSettings = (settings: any) => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تطبيق الإعدادات الجديدة بنجاح",
      duration: 2000,
    });
  };

  return (
    <div className="container mx-auto pb-24 pt-4 min-h-screen">
      <header className="flex items-center mb-6 px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className={`text-2xl font-bold ${isTV ? 'tv-text' : ''}`}>الإعدادات</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 px-4">
        {/* شريط التنقل الجانبي للإعدادات (يظهر كعلامات تبويب على الأجهزة المحمولة) */}
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="interface" className={isTV ? 'tv-focus-item text-lg py-3' : ''}>
                <Brush className="w-4 h-4 mr-2" />
                <span>الواجهة</span>
              </TabsTrigger>
              <TabsTrigger value="playback" className={isTV ? 'tv-focus-item text-lg py-3' : ''}>
                <Sliders className="w-4 h-4 mr-2" />
                <span>التشغيل</span>
              </TabsTrigger>
              <TabsTrigger value="tv" className={isTV ? 'tv-focus-item text-lg py-3' : ''}>
                <Tv className="w-4 h-4 mr-2" />
                <span>التلفزيون</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <Card className="h-fit border shadow-sm">
            <CardContent className="p-0">
              <ul className="divide-y">
                <li>
                  <Button 
                    variant={activeTab === 'interface' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'interface' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('interface')}
                  >
                    <Brush className="w-4 h-4 mr-2" />
                    <span>الواجهة والمظهر</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'playback' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'playback' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('playback')}
                  >
                    <Sliders className="w-4 h-4 mr-2" />
                    <span>إعدادات التشغيل</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'account' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'account' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('account')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span>الحساب</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'storage' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'storage' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('storage')}
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    <span>التخزين والبيانات</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'security' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'security' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    <span>الأمان والخصوصية</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'remote' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'remote' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('remote')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    <span>المزامنة عن بعد</span>
                  </Button>
                </li>
                <li>
                  <Button 
                    variant={activeTab === 'tv' ? 'secondary' : 'ghost'} 
                    className={`w-full justify-start px-4 py-3 rounded-none ${isTV && activeTab === 'tv' ? 'tv-focus-item' : ''}`}
                    onClick={() => setActiveTab('tv')}
                  >
                    <Tv className="w-4 h-4 mr-2" />
                    <span>إعدادات التلفزيون</span>
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* محتوى الإعدادات النشطة */}
        <div className="bg-card/30 rounded-lg p-4">
          {activeTab === 'interface' && (
            <InterfaceSettings onSave={handleSaveSettings} />
          )}
          
          {activeTab !== 'interface' && (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-6xl mb-4 opacity-30">⚙️</div>
              <h3 className="text-xl font-medium mb-2 text-center">الإعدادات قيد التطوير</h3>
              <p className="text-muted-foreground text-center">
                سيتم توفير إعدادات {activeTab === 'playback' ? 'التشغيل' : 
                  activeTab === 'account' ? 'الحساب' :
                  activeTab === 'storage' ? 'التخزين والبيانات' :
                  activeTab === 'security' ? 'الأمان والخصوصية' :
                  activeTab === 'remote' ? 'المزامنة عن بعد' :
                  'التلفزيون'} قريباً
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
