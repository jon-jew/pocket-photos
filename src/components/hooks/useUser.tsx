import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/library/firebase/clientApp';

interface User {
  uid: string;
  displayName: string | null;
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, userLoading, isLoggedIn: !!user };
};

export default useUser;
