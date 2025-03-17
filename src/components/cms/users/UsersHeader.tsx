
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';

interface UsersHeaderProps {
  setIsAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
}

const UsersHeader: React.FC<UsersHeaderProps> = ({ setIsAddingUser }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>إدارة المستخدمين</CardTitle>
        <CardDescription>إدارة مستخدمي النظام وصلاحياتهم</CardDescription>
      </div>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2" onClick={() => setIsAddingUser(true)}>
          <UserPlus className="h-4 w-4" />
          <span>إضافة مستخدم</span>
        </Button>
      </DialogTrigger>
    </div>
  );
};

export default UsersHeader;
