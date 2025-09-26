"use client";
import { redirect } from "next/navigation";
import {
  RecaptchaVerifier,
  onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
  signOut,
  ConfirmationResult,
  NextOrObserver,
  User,
} from "firebase/auth";
import { toast } from "react-toastify";

import { auth } from "./clientApp";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }

  interface UserInfo extends User {
    stsTokenManager: {
      accessToken: string;
      expirationTime: number;
      refreshToken: string;
    };
  }
};

export function onIdTokenChanged(cb: NextOrObserver<User | undefined>) {
  return _onIdTokenChanged(auth, cb);
}

export const logoutUser = () => {
  signOut(auth).then(() => {
    window.location.reload();
    toast.info('Logged out');
    redirect('/');
  }).catch((error) => {
    console.error(error);
  });
};

export const getUser = (cb: (user: string | null) => void) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      cb(uid)
      // ...
    } else {
      // User is signed out
      // ...
      cb(null)
    }
  });
};
export const isUserLoggedIn = async (): Promise<{ loggedIn: boolean; uid?: string }> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve({ loggedIn: true, uid: user.uid });
      } else {
        resolve({ loggedIn: false });
      }
    });
  });
};