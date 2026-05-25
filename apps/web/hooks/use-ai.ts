import { useState } from "react";

export function useAi() {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askAi = async (prompt: string) => {
    setIsLoading(true);
    // AI request logic will go here
    setResponse(`AI response to: "${prompt}"`);
    setIsLoading(false);
  };

  return {
    response,
    isLoading,
    askAi,
  };
}
