'use client';

import { useEffect } from 'react';
import Cookies from 'universal-cookie';
import { onIdTokenChanged } from '@/library/firebase/auth';

export default function useUserSession(initialUser: any) {
  const cookies = new Cookies(null, { path: '/' });
  
  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        await cookies.set("__session", idToken);
      } else {
        await cookies.remove("__session");
      }
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // window.location.reload();
    });
  }, [initialUser]);

  return initialUser;
}
