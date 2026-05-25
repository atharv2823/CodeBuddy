interface WorkspaceParams {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function WorkspaceRoomPage({ params }: WorkspaceParams) {
  const { roomId } = await params;

  return (
    <div className="flex h-svh flex-col p-6">
      <h1 className="text-2xl font-bold mb-4">Workspace Room</h1>
      <p className="text-muted-foreground">
        Active Room ID: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm">{roomId}</code>
      </p>
    </div>
  );
}
