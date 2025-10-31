'use server';
import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import Home from "@/views/home";

export default async function HomePage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  return <Home initialUser={currentUser?.toJSON() as UserInfo} />;
};

