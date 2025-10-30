import { initializeServerApp, getApps } from "firebase/app";
import { firebaseConfig } from "./config";
import { cookies } from "next/headers";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
export const firebaseApp =
  getApps().length === 0 ? initializeServerApp(firebaseConfig, {}) : getApps()[0];
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export async function getAuthenticatedAppForUser() {
  const authIdToken = (await cookies()).get("__session")?.value;

  const firebaseServerApp = initializeServerApp(
    firebaseConfig,
    authIdToken ? { authIdToken, } : {},
  );

  const auth = getAuth(firebaseServerApp);
  await auth.authStateReady();

  return {
    firebaseServerApp,
    currentUser: auth.currentUser,
    db: getFirestore(firebaseApp),
    storage: getStorage(firebaseServerApp),
  };
}
