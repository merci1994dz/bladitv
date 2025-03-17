
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CMSUser } from '@/services/cms/types';
import { CMS_CONFIG } from '@/services/config';

interface UserFormProps {
  user: Partial<CMSUser>;
  onUserChange: (user: Partial<CMSUser>) => void;
  onSubmit: () => void;
  submitLabel: string;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  onUserChange, 
  onSubmit, 
  submitLabel,
  isEdit = false
}) => {
  // تغيير الأذونات
  const togglePermission = (permission: string) => {
    if (!user.permissions) return;
    
    const updatedPermissions = user.permissions.includes(permission)
      ? user.permissions.filter(p => p !== permission)
      : [...user.permissions, permission];
    
    onUserChange({ ...user, permissions: updatedPermissions });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={`${isEdit ? 'edit-' : ''}username`}>اسم المستخدم</Label>
        <Input 
          id={`${isEdit ? 'edit-' : ''}username`}
          value={user.username || ''} 
          onChange={(e) => onUserChange({...user, username: e.target.value})}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isEdit ? 'edit-' : ''}email`}>البريد الإلكتروني</Label>
        <Input 
          id={`${isEdit ? 'edit-' : ''}email`}
          type="email" 
          value={user.email || ''} 
          onChange={(e) => onUserChange({...user, email: e.target.value})}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${isEdit ? 'edit-' : ''}role`}>الدور</Label>
        <Select 
          value={user.role} 
          onValueChange={(value: any) => onUserChange({...user, role: value})}
        >
          <SelectTrigger id={`${isEdit ? 'edit-' : ''}role`}>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">مسؤول</SelectItem>
            <SelectItem value="editor">محرر</SelectItem>
            <SelectItem value="viewer">مشاهد</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isEdit && (
        <div className="space-y-2">
          <Label>الصلاحيات</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CMS_CONFIG.PERMISSIONS).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id={`permission-${key}`}
                  checked={user.permissions?.includes(value) || false}
                  onCheckedChange={() => togglePermission(value)}
                />
                <Label htmlFor={`permission-${key}`}>
                  {value === 'create' ? 'إنشاء' : 
                  value === 'read' ? 'قراءة' : 
                  value === 'update' ? 'تحديث' : 
                  value === 'delete' ? 'حذف' : 'نشر'}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2 space-x-reverse">
        <Switch 
          id={`${isEdit ? 'edit-' : ''}active`}
          checked={user.active !== undefined ? user.active : true} 
          onCheckedChange={(checked) => onUserChange({...user, active: checked})}
        />
        <Label htmlFor={`${isEdit ? 'edit-' : ''}active`}>حساب نشط</Label>
      </div>
      
      <div className="mt-4">
        <Button type="submit" onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
};

export default UserForm;
