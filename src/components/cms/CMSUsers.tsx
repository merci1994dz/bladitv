
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useUsersManager } from './users/useUsersManager';
import UsersHeader from './users/UsersHeader';
import UsersList from './users/UsersList';
import EmptyUsersList from './users/EmptyUsersList';
import { AddUserDialog, EditUserDialog, DeleteUserDialog } from './users/UserDialogs';

const CMSUsers: React.FC = () => {
  const {
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
  } = useUsersManager();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <UsersHeader setIsAddingUser={setIsAddingUser} />
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyUsersList />
          ) : (
            <UsersList 
              users={users}
              onEdit={startEditingUser}
              onDelete={(userId) => setIsConfirmingDelete(userId)}
            />
          )}
        </CardContent>
      </Card>

      {/* نوافذ الحوار */}
      <AddUserDialog 
        newUser={newUser}
        setNewUser={setNewUser}
        isAddingUser={isAddingUser}
        setIsAddingUser={setIsAddingUser}
        handleAddUser={handleAddUser}
      />

      <EditUserDialog 
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        isEditingUser={isEditingUser}
        setIsEditingUser={setIsEditingUser}
        handleUpdateUser={handleUpdateUser}
      />

      <DeleteUserDialog 
        isConfirmingDelete={isConfirmingDelete}
        setIsConfirmingDelete={setIsConfirmingDelete}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default CMSUsers;
