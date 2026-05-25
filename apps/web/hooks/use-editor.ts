import { useState } from "react";

export function useEditor() {
  const [content, setContent] = useState("");

  const updateContent = (newContent: string) => {
    setContent(newContent);
  };

  return {
    content,
    updateContent,
  };
}
