
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Key, Lock, Save, Check } from 'lucide-react';
import { verifyPassword, updateAdminPassword } from '@/services/adminService';

interface ChangePasswordFormProps {
  onBackClick: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onBackClick }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور الحالية",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const isCurrentPasswordValid = verifyPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الحالية غير صحيحة",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      try {
        updateAdminPassword(newPassword);
        setPasswordChanged(true);
        toast({
          title: "تم بنجاح",
          description: "تم تغيير كلمة المرور بنجاح",
        });
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          onBackClick();
          setPasswordChanged(false);
        }, 2000);
        
      } catch (error) {
        toast({
          title: "خطأ",
          description: error instanceof Error ? error.message : "حدث خطأ أثناء تغيير كلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "خطأ في المصادقة",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (passwordChanged) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">تم تغيير كلمة المرور بنجاح</h3>
        <p className="text-gray-500 dark:text-gray-400">
          سيتم توجيهك إلى شاشة تسجيل الدخول...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="current-password" className="text-right block">
          كلمة المرور الحالية
        </Label>
        <div className="relative">
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الحالية"
            dir="rtl"
            autoComplete="current-password"
            className="pl-10 pr-4 py-6 text-lg"
          />
          <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="new-password" className="text-right block">
          كلمة المرور الجديدة
        </Label>
        <div className="relative">
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="أدخل كلمة المرور الجديدة"
            dir="rtl"
            className="pl-10 pr-4 py-6 text-lg"
          />
          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 text-right mt-1">
          يجب أن تكون كلمة المرور 6 أحرف على الأقل
        </p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="confirm-password" className="text-right block">
          تأكيد كلمة المرور
        </Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أدخل كلمة المرور مرة أخرى"
            dir="rtl"
            className="pl-10 pr-4 py-6 text-lg"
          />
          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full py-6 text-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="mr-2">جاري التغيير</span>
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </>
        ) : (
          <>
            <Save className="h-5 w-5 mr-2" />
            حفظ كلمة المرور الجديدة
          </>
        )}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
