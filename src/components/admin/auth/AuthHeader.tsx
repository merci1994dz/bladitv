
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Key, ShieldAlert } from 'lucide-react';

interface AuthHeaderProps {
  showChangePassword: boolean;
  onBackClick?: () => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ 
  showChangePassword, 
  onBackClick 
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center">
        {showChangePassword && onBackClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick}
            className="absolute left-4 top-4 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
          {showChangePassword ? (
            <Key className="h-10 w-10 text-primary" />
          ) : (
            <ShieldAlert className="h-10 w-10 text-primary" />
          )}
        </div>
      </div>
      <CardTitle className="text-2xl font-bold">
        {showChangePassword ? "تغيير كلمة المرور" : "تسجيل الدخول للوحة التحكم"}
      </CardTitle>
      <CardDescription className="text-gray-500 dark:text-gray-400">
        {showChangePassword 
          ? "أدخل كلمة المرور الحالية وكلمة المرور الجديدة" 
          : "أدخل كلمة المرور للوصول إلى لوحة التحكم وإدارة القنوات"}
      </CardDescription>
    </div>
  );
};

export default AuthHeader;
