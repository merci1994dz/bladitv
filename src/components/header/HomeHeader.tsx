
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useDeviceType } from '@/hooks/use-tv';
import SyncStatus from '../SyncStatus';
import ConnectivityIndicator from '../sync/ConnectivityIndicator';
import { syncWithBladiInfo } from '@/services/sync';
import { useToast } from '@/hooks/use-toast';

interface HomeHeaderProps {
  isSimple?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ isSimple = false }) => {
  const { isTV } = useDeviceType();
  const { toast } = useToast();
  
  const handleConnectivityRefresh = async () => {
    toast({
      title: "جاري إعادة المزامنة",
      description: "جاري فحص المصادر المتاحة وتحديث البيانات...",
      duration: 3000,
    });
    
    try {
      const success = await syncWithBladiInfo(true);
      if (success) {
        toast({
          title: "تمت المزامنة بنجاح",
          description: "تم تحديث البيانات من المصدر المتاح",
          duration: 3000,
        });
      } else {
        toast({
          title: "تنبيه",
          description: "لا يوجد مصادر خارجية متاحة. يتم استخدام البيانات المحلية.",
          duration: 5000,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في المزامنة",
        description: "حدث خطأ أثناء محاولة المزامنة. يرجى المحاولة مرة أخرى.",
        duration: 5000,
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="py-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className={`font-bold ${isTV ? 'text-3xl' : 'text-2xl'}`}>
              <span className="text-primary">Bladi</span>
              <span>TV</span>
            </h1>
          </Link>
          
          <ConnectivityIndicator 
            onRefresh={handleConnectivityRefresh}
            className="hidden md:flex" 
          />
        </div>
        
        {!isSimple && (
          <div className="flex flex-col md:flex-row items-center gap-4">
            <SyncStatus />
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  الإعدادات
                </Button>
              </Link>
              
              <ThemeToggle />
            </div>
          </div>
        )}
        
        {/* مؤشر الاتصال للشاشات الصغيرة */}
        <ConnectivityIndicator 
          onRefresh={handleConnectivityRefresh}
          className="md:hidden" 
        />
      </div>
    </header>
  );
};

export default HomeHeader;
