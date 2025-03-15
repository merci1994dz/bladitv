
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/admin/auth/LoginForm';
import ChangePasswordForm from '@/components/admin/auth/ChangePasswordForm';
import AuthHeader from '@/components/admin/auth/AuthHeader';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const lockUntil = localStorage.getItem('admin_lock_until');
    if (lockUntil && Number(lockUntil) > Date.now()) {
      const remainingMinutes = Math.ceil((Number(lockUntil) - Date.now()) / 60000);
      setLoginError(`تم قفل الحساب مؤقتًا. يرجى المحاولة بعد ${remainingMinutes} دقيقة`);
    } else {
      setLoginError(null);
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg transition-all duration-300">
        <CardHeader className="pb-6">
          <AuthHeader 
            showChangePassword={showChangePassword} 
            onBackClick={() => setShowChangePassword(false)} 
          />
        </CardHeader>
        
        <CardContent>
          {showChangePassword ? (
            <ChangePasswordForm onBackClick={() => setShowChangePassword(false)} />
          ) : (
            <LoginForm 
              onLoginSuccess={onLoginSuccess}
              onChangePasswordClick={() => setShowChangePassword(true)}
              loginError={loginError}
            />
          )}
        </CardContent>
        
        {!showChangePassword && (
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
        )}
      </Card>
    </div>
  );
};

export default AdminLogin;
