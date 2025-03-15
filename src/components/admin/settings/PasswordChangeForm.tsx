
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { updateAdminPassword } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PasswordChangeForm: React.FC = () => {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "كلمة مرور غير صالحة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "كلمتا المرور غير متطابقتين",
        description: "يرجى التأكد من تطابق كلمتي المرور",
        variant: "destructive",
      });
      return;
    }
    
    try {
      updateAdminPassword(newPassword);
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "تعذر تغيير كلمة المرور",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form className="space-y-4" onSubmit={handleChangePassword}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">كلمة المرور الجديدة</label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            dir="rtl"
          />
          <p className="text-xs text-muted-foreground">كلمة المرور يجب أن تكون 6 أحرف على الأقل</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">تأكيد كلمة المرور</label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور"
            dir="rtl"
          />
        </div>
      </div>
      <Button type="submit" className="w-full">تغيير كلمة المرور</Button>
    </form>
  );
};

export default PasswordChangeForm;
