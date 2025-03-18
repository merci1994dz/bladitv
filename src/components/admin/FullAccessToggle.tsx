
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enableFullAccess, disableFullAccess, hasFullAccess } from '@/services/adminService';

interface FullAccessToggleProps {
  hasFullAccessEnabled: boolean;
  setHasFullAccessEnabled: (value: boolean) => void;
}

const FullAccessToggle: React.FC<FullAccessToggleProps> = ({ 
  hasFullAccessEnabled, 
  setHasFullAccessEnabled 
}) => {
  const { toast } = useToast();

  // وظيفة للتحكم في الصلاحيات الكاملة
  const toggleFullAccess = () => {
    try {
      if (hasFullAccessEnabled) {
        disableFullAccess();
        setHasFullAccessEnabled(false);
        toast({
          title: "تم إلغاء الصلاحيات الكاملة",
          description: "تم إلغاء وضع المسؤول بصلاحيات كاملة",
        });
      } else {
        enableFullAccess();
        setHasFullAccessEnabled(true);
        toast({
          title: "تم تفعيل الصلاحيات الكاملة",
          description: "تم تمكين وضع المسؤول بصلاحيات كاملة لمدة 6 أشهر",
        });
      }
    } catch (error) {
      console.error("Error toggling full access:", error);
      toast({
        title: "خطأ في تغيير الصلاحيات",
        description: "حدث خطأ أثناء محاولة تغيير صلاحيات المسؤول",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* زر تفعيل الصلاحيات الكاملة */}
      <div className="flex justify-center my-4">
        <Button
          onClick={toggleFullAccess}
          variant={hasFullAccessEnabled ? "destructive" : "default"}
          className="flex items-center gap-2 transform hover:scale-105 transition-all duration-300 shadow-md"
        >
          {hasFullAccessEnabled ? (
            <>
              <ShieldX className="h-5 w-5" />
              <span>إلغاء الصلاحيات الكاملة</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <span>تفعيل الصلاحيات الكاملة</span>
            </>
          )}
        </Button>
      </div>
      
      {/* رسالة تنبيه عند تفعيل الصلاحيات الكاملة */}
      {hasFullAccessEnabled && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md p-3 mb-4 text-center animate-pulse">
          <div className="flex justify-center items-center gap-2 mb-1 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            <span className="font-bold">الصلاحيات الكاملة مفعلة</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">تم تفعيل صلاحيات المسؤول الكاملة. لا يلزم إعادة تسجيل الدخول لمدة 6 أشهر.</p>
        </div>
      )}
    </>
  );
};

export default FullAccessToggle;
