'use server';
import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import Login from "@/views/login";

export default async function LoginPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  return <Login initialUser={currentUser?.toJSON()} />;
};
