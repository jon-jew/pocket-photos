'use server';
import { User } from "firebase/auth";

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import Home from "@/views/home";

export default async function HomePage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  return <Home currentUser={currentUser?.toJSON() as User} />;
};

