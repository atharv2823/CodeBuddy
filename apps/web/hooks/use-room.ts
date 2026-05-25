import { useState } from "react";

export function useRoom() {
  const [roomId, setRoomId] = useState<string | null>(null);

  const joinRoom = (id: string) => {
    setRoomId(id);
  };

  const leaveRoom = () => {
    setRoomId(null);
  };

  return {
    roomId,
    joinRoom,
    leaveRoom,
  };
}
