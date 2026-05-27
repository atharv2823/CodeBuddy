import WorkspaceClient from "./WorkspaceClient";

interface WorkspaceParams {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function WorkspaceRoomPage({ params }: WorkspaceParams) {
  const { roomId } = await params;

  return <WorkspaceClient roomId={roomId} />;
}
