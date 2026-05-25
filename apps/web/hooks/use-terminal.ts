import { useState } from "react";

export function useTerminal() {
  const [history, setHistory] = useState<string[]>([]);

  const executeCommand = (command: string) => {
    setHistory((prev) => [...prev, command]);
  };

  return {
    history,
    executeCommand,
  };
}
