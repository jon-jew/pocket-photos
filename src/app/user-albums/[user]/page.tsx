'use server';
import { User } from "firebase/auth";

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import UserAlbums from "@/views/userAlbums"

export default async function Page({
  params,
}: {
  params: Promise<{ user: string }>
}) {
  const { user } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  return <UserAlbums userId={user} currentUser={currentUser?.toJSON() as User} />
};
