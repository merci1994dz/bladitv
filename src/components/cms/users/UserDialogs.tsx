
import React from 'react';
import { CMSUser } from '@/services/cms/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// مكون إضافة مستخدم جديد
interface AddUserDialogProps {
  newUser: CMSUser;
  setNewUser: (user: Partial<CMSUser>) => void;
  isAddingUser: boolean;
  setIsAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddUser: () => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  newUser,
  setNewUser,
  isAddingUser,
  setIsAddingUser,
  handleAddUser,
}) => {
  const handleChange = (field: keyof CMSUser, value: string | boolean) => {
    setNewUser({ ...newUser, [field]: value });
  };

  return (
    <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
          <DialogDescription>أدخل معلومات المستخدم الجديد.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">اسم المستخدم</Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
            <Input
              id="email"
              value={newUser.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">الدور</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">مسؤول</SelectItem>
                <SelectItem value="editor">محرر</SelectItem>
                <SelectItem value="viewer">مشاهد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">نشط</Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="active"
                checked={newUser.active}
                onCheckedChange={(checked) => handleChange('active', checked)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddingUser(false)}>إلغاء</Button>
          <Button onClick={handleAddUser}>إضافة</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// مكون تعديل مستخدم
interface EditUserDialogProps {
  editingUser: CMSUser | null;
  setEditingUser: (user: Partial<CMSUser> | null) => void;
  isEditingUser: boolean;
  setIsEditingUser: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateUser: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  editingUser,
  setEditingUser,
  isEditingUser,
  setIsEditingUser,
  handleUpdateUser,
}) => {
  if (!editingUser) return null;

  const handleChange = (field: keyof CMSUser, value: string | boolean) => {
    setEditingUser({ ...editingUser, [field]: value });
  };

  return (
    <Dialog open={isEditingUser} onOpenChange={setIsEditingUser}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المستخدم</DialogTitle>
          <DialogDescription>قم بتحديث معلومات المستخدم.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-username" className="text-right">اسم المستخدم</Label>
            <Input
              id="edit-username"
              value={editingUser.username}
              onChange={(e) => handleChange('username', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">البريد الإلكتروني</Label>
            <Input
              id="edit-email"
              value={editingUser.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-role" className="text-right">الدور</Label>
            <Select
              value={editingUser.role}
              onValueChange={(value) => handleChange('role', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">مسؤول</SelectItem>
                <SelectItem value="editor">محرر</SelectItem>
                <SelectItem value="viewer">مشاهد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-active" className="text-right">نشط</Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="edit-active"
                checked={editingUser.active}
                onCheckedChange={(checked) => handleChange('active', checked)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditingUser(false)}>إلغاء</Button>
          <Button onClick={handleUpdateUser}>حفظ التغييرات</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// مكون حذف مستخدم
interface DeleteUserDialogProps {
  isConfirmingDelete: string | null;
  setIsConfirmingDelete: React.Dispatch<React.SetStateAction<string | null>>;
  handleDeleteUser: () => void;
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  isConfirmingDelete,
  setIsConfirmingDelete,
  handleDeleteUser,
}) => {
  return (
    <Dialog open={!!isConfirmingDelete} onOpenChange={(open) => !open && setIsConfirmingDelete(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف المستخدم</DialogTitle>
          <DialogDescription>هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsConfirmingDelete(null)}>إلغاء</Button>
          <Button variant="destructive" onClick={handleDeleteUser}>حذف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
