
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifyAdminPassword } from '@/services/api';
import { Lock, Key, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
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
    
    // إضافة تأخير بسيط لمحاكاة المصادقة
    setTimeout(() => {
      const isPasswordValid = verifyAdminPassword(password);
      
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
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            تسجيل الدخول للوحة التحكم
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            أدخل كلمة المرور للوصول إلى لوحة التحكم وإدارة القنوات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-medium block text-right">
                كلمة المرور الإدارية
              </label>
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
                />
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                كلمة المرور الافتراضية هي: "admin123"
              </p>
            </div>
            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={isLoading}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
