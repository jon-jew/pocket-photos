import Album from "@/views/album";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>
}) {
  const { albumId } = await params;
  return (
    <Album albumId={albumId} />
  );
}