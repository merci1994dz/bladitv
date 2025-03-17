
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getCMSUsers, saveCMSUsers } from '@/services/cms/storage';
import { CMSUser } from '@/services/cms/types';
import { addUser, updateUser, deleteUser } from '@/services/cms/managers/userManager';

export const useUsersManager = () => {
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

    try {
      const createdUser = addUser(newUser);
      setUsers([...users, createdUser]);
      
      toast({
        title: "تم إضافة المستخدم",
        description: "تمت إضافة المستخدم بنجاح",
      });
      
      // إعادة تعيين النموذج
      setNewUser({
        username: '',
        email: '',
        role: 'editor',
        permissions: ['read'],
        active: true
      });
      
      setIsAddingUser(false);
    } catch (error) {
      toast({
        title: "خطأ في إضافة المستخدم",
        description: "تعذرت إضافة المستخدم",
        variant: "destructive",
      });
    }
  };

  // تحديث مستخدم
  const handleUpdateUser = () => {
    if (!editingUser) return;

    try {
      const updatedUser = updateUser(editingUser);
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      
      toast({
        title: "تم تحديث المستخدم",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });
      
      setIsEditingUser(null);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "خطأ في تحديث المستخدم",
        description: "تعذر تحديث بيانات المستخدم",
        variant: "destructive",
      });
    }
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

    try {
      const success = deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
        
        toast({
          title: "تم حذف المستخدم",
          description: "تم حذف المستخدم بنجاح",
        });
      }
      setIsConfirmingDelete(null);
    } catch (error) {
      toast({
        title: "خطأ في حذف المستخدم",
        description: "تعذر حذف المستخدم",
        variant: "destructive",
      });
      setIsConfirmingDelete(null);
    }
  };

  // بدء تحرير مستخدم
  const startEditingUser = (user: CMSUser) => {
    setEditingUser({ ...user });
    setIsEditingUser(user.id);
  };

  return {
    users,
    newUser,
    setNewUser,
    isAddingUser,
    setIsAddingUser,
    isEditingUser,
    setIsEditingUser,
    isConfirmingDelete,
    setIsConfirmingDelete,
    editingUser,
    setEditingUser,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    startEditingUser,
  };
};
