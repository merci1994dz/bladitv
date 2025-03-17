
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Pencil, Trash2, User, AlertTriangle } from 'lucide-react';
import { getCMSUsers, saveCMSUsers } from '@/services/cms/storage';
import { CMSUser } from '@/services/cms/types';
import { CMS_CONFIG } from '@/services/config';

const CMSUsers: React.FC = () => {
  const [users, setUsers] = useState<CMSUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // نموذج المستخدم الجديد
  const [newUser, setNewUser] = useState<Omit<CMSUser, 'id'>>({
    username: '',
    email: '',
    role: 'editor',
    permissions: ['read'],
    active: true
  });

  // حالة للمستخدم الذي يتم تحريره
  const [editingUser, setEditingUser] = useState<CMSUser | null>(null);

  // جلب المستخدمين عند تحميل المكون
  useEffect(() => {
    const loadUsers = () => {
      try {
        const loadedUsers = getCMSUsers();
        setUsers(loadedUsers);
      } catch (error) {
        toast({
          title: "خطأ في تحميل المستخدمين",
          description: "تعذر تحميل قائمة المستخدمين",
          variant: "destructive",
        });
      }
    };

    loadUsers();
  }, [toast]);

  // حفظ المستخدمين
  const saveUsers = (updatedUsers: CMSUser[]) => {
    try {
      saveCMSUsers(updatedUsers);
      setUsers(updatedUsers);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ التغييرات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "تعذر حفظ التغييرات",
        variant: "destructive",
      });
    }
  };

  // إضافة مستخدم جديد
  const handleAddUser = () => {
    // التحقق من صحة البيانات
    if (!newUser.username || !newUser.email) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال اسم المستخدم والبريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (users.some(user => user.email === newUser.email)) {
      toast({
        title: "البريد الإلكتروني مستخدم",
        description: "هذا البريد الإلكتروني مستخدم بالفعل",
        variant: "destructive",
      });
      return;
    }

    const userToAdd: CMSUser = {
      ...newUser,
      id: `user-${Date.now()}`,
    };

    const updatedUsers = [...users, userToAdd];
    saveUsers(updatedUsers);
    
    // إعادة تعيين النموذج
    setNewUser({
      username: '',
      email: '',
      role: 'editor',
      permissions: ['read'],
      active: true
    });
    
    setIsAddingUser(false);
  };

  // تحديث مستخدم
  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );

    saveUsers(updatedUsers);
    setIsEditingUser(null);
    setEditingUser(null);
  };

  // حذف مستخدم
  const handleDeleteUser = (userId: string) => {
    // منع حذف المستخدم الوحيد بدور المسؤول
    const adminUsers = users.filter(user => user.role === 'admin');
    const userToDelete = users.find(user => user.id === userId);
    
    if (adminUsers.length === 1 && userToDelete?.role === 'admin') {
      toast({
        title: "لا يمكن الحذف",
        description: "لا يمكن حذف المستخدم المسؤول الوحيد",
        variant: "destructive",
      });
      setIsConfirmingDelete(null);
      return;
    }

    const updatedUsers = users.filter(user => user.id !== userId);
    saveUsers(updatedUsers);
    setIsConfirmingDelete(null);
  };

  // بدء تحرير مستخدم
  const startEditingUser = (user: CMSUser) => {
    setEditingUser({ ...user });
    setIsEditingUser(user.id);
  };

  // تغيير الأذونات
  const togglePermission = (permission: string) => {
    if (!editingUser) return;
    
    const updatedPermissions = editingUser.permissions.includes(permission)
      ? editingUser.permissions.filter(p => p !== permission)
      : [...editingUser.permissions, permission];
    
    setEditingUser({ ...editingUser, permissions: updatedPermissions });
  };

  // رسائل الحالة
  let statusMessage = null;
  if (users.length === 0) {
    statusMessage = (
      <div className="text-center py-8">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">لا يوجد مستخدمون</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">ابدأ بإضافة مستخدم جديد لإدارة التطبيق.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>إدارة مستخدمي النظام وصلاحياتهم</CardDescription>
            </div>
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>إضافة مستخدم</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل المستخدم الجديد
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">اسم المستخدم</Label>
                    <Input 
                      id="username" 
                      value={newUser.username} 
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={newUser.email} 
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">الدور</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value: any) => setNewUser({...newUser, role: value})}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مسؤول</SelectItem>
                        <SelectItem value="editor">محرر</SelectItem>
                        <SelectItem value="viewer">مشاهد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch 
                      id="active" 
                      checked={newUser.active} 
                      onCheckedChange={(checked) => setNewUser({...newUser, active: checked})}
                    />
                    <Label htmlFor="active">حساب نشط</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddUser}>إضافة</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {statusMessage || (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <Shield className="h-4 w-4 text-primary" />}
                          <span className="capitalize">
                            {user.role === 'admin' ? 'مسؤول' : user.role === 'editor' ? 'محرر' : 'مشاهد'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.active ? 'نشط' : 'غير نشط'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => startEditingUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setIsConfirmingDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تحرير المستخدم */}
      <Dialog open={!!isEditingUser} onOpenChange={(open) => !open && setIsEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تحرير المستخدم</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل وصلاحيات المستخدم
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-username">اسم المستخدم</Label>
                <Input 
                  id="edit-username" 
                  value={editingUser.username} 
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">الدور</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value: any) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مسؤول</SelectItem>
                    <SelectItem value="editor">محرر</SelectItem>
                    <SelectItem value="viewer">مشاهد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الصلاحيات</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CMS_CONFIG.PERMISSIONS).map((permission) => (
                    <div key={permission} className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id={`permission-${permission}`}
                        checked={editingUser.permissions.includes(permission)}
                        onCheckedChange={() => togglePermission(permission)}
                      />
                      <Label htmlFor={`permission-${permission}`}>
                        {permission === 'create' ? 'إنشاء' : 
                         permission === 'read' ? 'قراءة' : 
                         permission === 'update' ? 'تحديث' : 
                         permission === 'delete' ? 'حذف' : 'نشر'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch 
                  id="edit-active" 
                  checked={editingUser.active} 
                  onCheckedChange={(checked) => setEditingUser({...editingUser, active: checked})}
                />
                <Label htmlFor="edit-active">حساب نشط</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateUser}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
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
    </div>
  );
};

export default CMSUsers;
