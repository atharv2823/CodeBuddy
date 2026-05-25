import { useEffect, useState } from "react";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket initialization will go here
    setIsConnected(true);
    return () => {
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
}
