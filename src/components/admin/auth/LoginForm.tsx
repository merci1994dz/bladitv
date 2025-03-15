
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Key, Lock } from 'lucide-react';
import { verifyPassword } from '@/services/adminService';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onChangePasswordClick: () => void;
  loginError: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  onChangePasswordClick, 
  loginError 
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const isPasswordValid = verifyPassword(password);
        
        if (isPasswordValid) {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحبًا بك في لوحة التحكم"
          });
          onLoginSuccess();
        } else {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: "كلمة المرور غير صحيحة",
            variant: "destructive",
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <>
      {loginError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 ml-2" />
          <div className="text-sm text-red-600 dark:text-red-400">{loginError}</div>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="password" className="text-right block">
            كلمة المرور الإدارية
          </Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              dir="rtl"
              autoComplete="current-password"
              className="pl-10 pr-4 py-6 text-lg"
              disabled={!!loginError}
            />
            <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full py-6 text-lg"
          disabled={isLoading || !!loginError}
        >
          {isLoading ? (
            <>
              <span className="mr-2">جاري تسجيل الدخول</span>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 mr-2" />
              تسجيل الدخول
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
