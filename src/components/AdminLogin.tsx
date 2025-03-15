import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifyPassword, updateAdminPassword } from '@/services/adminService';
import { Lock, Key, ShieldAlert, Save, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const lockUntil = localStorage.getItem('admin_lock_until');
    if (lockUntil && Number(lockUntil) > Date.now()) {
      const remainingMinutes = Math.ceil((Number(lockUntil) - Date.now()) / 60000);
      setLoginError(`تم قفل الحساب مؤقتًا. يرجى المحاولة بعد ${remainingMinutes} دقيقة`);
    } else {
      setLoginError(null);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
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
          setLoginError(error.message);
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
          setShowChangePassword(false);
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
        setLoginError(error.message);
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

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg transition-all duration-300">
        {showChangePassword ? (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowChangePassword(false)}
                  className="absolute left-4 top-4 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
                  <Key className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                أدخل كلمة المرور الحالية وكلمة المرور الجديدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordChanged ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">تم تغيير كلمة المرور بنجاح</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    سيتم توجيهك إلى شاشة تسجيل الدخول...
                  </p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </>
        ) : (
          <>
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
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => setShowChangePassword(true)}
                className="text-primary hover:text-primary/80"
                disabled={!!loginError}
              >
                تغيير كلمة المرور
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminLogin;
