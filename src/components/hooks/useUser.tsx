import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface User {
  uid: string;
  displayName: string | null;
}

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, userLoading, isLoggedIn: !!user };
};

export default useUser;