
import { useState, useEffect } from 'react';
import { CMSUser } from '@/services/cms/types';
import { useToast } from '@/hooks/use-toast';
import { publishChannelsToAllUsers } from '@/services/sync';
import { saveChannelsToStorage } from '@/services/dataStore';
import { forceDataRefresh } from '@/services/sync/forceRefresh';

// Hook للتعامل مع المستخدمين
export const useUsersManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<CMSUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<CMSUser | null>(null);
  const [newUser, setNewUser] = useState<CMSUser>({
    id: '',
    username: '',
    email: '',
    role: 'viewer',
    active: true,
    permissions: [] // أضفنا خاصية الصلاحيات المطلوبة
  });

  // تحميل المستخدمين من التخزين المحلي
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('cms_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // إضافة مستخدم افتراضي إذا لم يكن هناك مستخدمين
        const defaultUser: CMSUser = {
          id: 'admin-1',
          username: 'مدير النظام',
          email: 'admin@example.com',
          role: 'admin',
          active: true,
          permissions: ['create', 'read', 'update', 'delete', 'publish'] // أضفنا صلاحيات للمستخدم الافتراضي
        };
        setUsers([defaultUser]);
        localStorage.setItem('cms_users', JSON.stringify([defaultUser]));
      }
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: "تعذر تحميل بيانات المستخدمين",
        variant: "destructive",
      });
    }
  }, [toast]);

  // إضافة مستخدم جديد
  const handleAddUser = () => {
    if (!newUser.username || !newUser.email) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال اسم المستخدم والبريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = {
        ...newUser,
        id: `user-${Date.now()}`,
      };
      
      const updatedUsers = [...users, updatedUser];
      setUsers(updatedUsers);
      localStorage.setItem('cms_users', JSON.stringify(updatedUsers));
      
      // مسح نموذج المستخدم الجديد
      setNewUser({
        id: '',
        username: '',
        email: '',
        role: 'viewer',
        active: true,
        permissions: [] // أضفنا خاصية الصلاحيات المطلوبة
      });
      
      setIsAddingUser(false);
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: `تم إضافة المستخدم ${updatedUser.username} بنجاح`,
      });
      
      // نشر التحديثات للمستخدمين
      publishUpdates();
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      toast({
        title: "خطأ في إضافة المستخدم",
        description: "تعذر إضافة المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // بدء تحرير مستخدم
  const startEditingUser = (user: CMSUser) => {
    setEditingUser({ ...user });
    setIsEditingUser(true);
  };

  // تحديث مستخدم
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    if (!editingUser.username || !editingUser.email) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال اسم المستخدم والبريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? editingUser : user
      );
      
      setUsers(updatedUsers);
      localStorage.setItem('cms_users', JSON.stringify(updatedUsers));
      setIsEditingUser(false);
      setEditingUser(null);
      
      toast({
        title: "تم التحديث بنجاح",
        description: `تم تحديث بيانات المستخدم ${editingUser.username} بنجاح`,
      });
      
      // نشر التحديثات للمستخدمين
      publishUpdates();
    } catch (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      toast({
        title: "خطأ في تحديث المستخدم",
        description: "تعذر تحديث بيانات المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  // حذف مستخدم
  const handleDeleteUser = () => {
    if (!isConfirmingDelete) return;
    
    try {
      const userId = isConfirmingDelete;
      const userToDelete = users.find(user => user.id === userId);
      
      if (!userToDelete) {
        throw new Error('المستخدم غير موجود');
      }
      
      // التحقق من عدم حذف آخر مستخدم مسؤول
      const admins = users.filter(user => user.role === 'admin');
      if (admins.length === 1 && admins[0].id === userId) {
        toast({
          title: "لا يمكن حذف المستخدم",
          description: "لا يمكن حذف آخر مستخدم بدور مسؤول",
          variant: "destructive",
        });
        setIsConfirmingDelete(null);
        return;
      }
      
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('cms_users', JSON.stringify(updatedUsers));
      setIsConfirmingDelete(null);
      
      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف المستخدم ${userToDelete.username} بنجاح`,
      });
      
      // نشر التحديثات للمستخدمين
      publishUpdates();
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      toast({
        title: "خطأ في حذف المستخدم",
        description: "تعذر حذف المستخدم، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
      setIsConfirmingDelete(null);
    }
  };

  // نشر التحديثات للجميع
  const publishUpdates = async () => {
    try {
      // حفظ وحدة التخزين
      await saveChannelsToStorage();
      
      // نشر القنوات للمستخدمين
      await publishChannelsToAllUsers();
      
      // تطبيق تحديث قسري لجميع المتصفحات
      await forceDataRefresh();
      
      console.log('تم نشر التحديثات لجميع المستخدمين');
    } catch (error) {
      console.error('خطأ في نشر التحديثات:', error);
    }
  };

  return {
    users,
    newUser,
    setNewUser: (user: Partial<CMSUser>) => setNewUser({ ...newUser, ...user }),
    isAddingUser,
    setIsAddingUser,
    isEditingUser,
    setIsEditingUser,
    isConfirmingDelete,
    setIsConfirmingDelete,
    editingUser,
    setEditingUser: (user: Partial<CMSUser> | null) => {
      if (user === null) {
        setEditingUser(null);
      } else if (editingUser) {
        setEditingUser({ ...editingUser, ...user });
      }
    },
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    startEditingUser,
  };
};
