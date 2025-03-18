
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enableFullAccess, disableFullAccess } from '@/services/adminService';

interface FullAccessToggleProps {
  hasFullAccessEnabled: boolean;
  setHasFullAccessEnabled: (value: boolean) => void;
}

const FullAccessToggle: React.FC<FullAccessToggleProps> = ({ 
  hasFullAccessEnabled, 
  setHasFullAccessEnabled 
}) => {
  const { toast } = useToast();

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
  );
};

export default FullAccessToggle;
