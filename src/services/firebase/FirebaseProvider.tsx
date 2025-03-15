
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

// إنشاء سياق Firebase
interface FirebaseContextType {
  currentUser: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  currentUser: null,
  loading: true
});

// مُزوِّد Firebase للتطبيق
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // الاستماع للتغييرات في حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // تنظيف المستمع عند إزالة المكون
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ currentUser, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Hook لاستخدام سياق Firebase
export const useFirebase = () => useContext(FirebaseContext);
