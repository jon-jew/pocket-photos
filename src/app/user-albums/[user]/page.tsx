import UserAlbums from "@/views/userAlbums"

export default async function Page({
  params,
}: {
  params: Promise<{ user: string }>
}) {
  const { user } = await params;
  return <UserAlbums userId={user} />
};
