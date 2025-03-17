
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CMSUser } from '@/services/cms/types';
import UserForm from './UserForm';

interface UserDialogsProps {
  newUser: Partial<CMSUser>;
  setNewUser: React.Dispatch<React.SetStateAction<Partial<CMSUser>>>;
  isAddingUser: boolean;
  setIsAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddUser: () => void;
  editingUser: CMSUser | null;
  setEditingUser: React.Dispatch<React.SetStateAction<CMSUser | null>>;
  isEditingUser: string | null;
  setIsEditingUser: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdateUser: () => void;
  isConfirmingDelete: string | null;
  setIsConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  handleDeleteUser: (userId: string) => void;
}

export const AddUserDialog: React.FC<Pick<UserDialogsProps, 'newUser' | 'setNewUser' | 'isAddingUser' | 'setIsAddingUser' | 'handleAddUser'>> = ({
  newUser,
  setNewUser,
  isAddingUser,
  setIsAddingUser,
  handleAddUser
}) => {
  return (
    <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المستخدم الجديد
          </DialogDescription>
        </DialogHeader>
        <UserForm 
          user={newUser} 
          onUserChange={setNewUser} 
          onSubmit={handleAddUser} 
          submitLabel="إضافة"
        />
      </DialogContent>
    </Dialog>
  );
};

export const EditUserDialog: React.FC<Pick<UserDialogsProps, 'editingUser' | 'setEditingUser' | 'isEditingUser' | 'setIsEditingUser' | 'handleUpdateUser'>> = ({
  editingUser,
  setEditingUser,
  isEditingUser,
  setIsEditingUser,
  handleUpdateUser
}) => {
  return (
    <Dialog open={!!isEditingUser} onOpenChange={(open) => !open && setIsEditingUser(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تحرير المستخدم</DialogTitle>
          <DialogDescription>
            تعديل تفاصيل وصلاحيات المستخدم
          </DialogDescription>
        </DialogHeader>
        {editingUser && (
          <UserForm 
            user={editingUser} 
            onUserChange={setEditingUser} 
            onSubmit={handleUpdateUser} 
            submitLabel="حفظ التغييرات"
            isEdit={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export const DeleteUserDialog: React.FC<Pick<UserDialogsProps, 'isConfirmingDelete' | 'setIsConfirmingDelete' | 'handleDeleteUser'>> = ({
  isConfirmingDelete,
  setIsConfirmingDelete,
  handleDeleteUser
}) => {
  return (
    <Dialog open={!!isConfirmingDelete} onOpenChange={(open) => !open && setIsConfirmingDelete(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تأكيد الحذف</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsConfirmingDelete(null)}>إلغاء</Button>
          <Button 
            variant="destructive" 
            onClick={() => isConfirmingDelete && handleDeleteUser(isConfirmingDelete)}
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
