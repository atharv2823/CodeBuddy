"use client";

import { useEffect, useState, useRef } from "react";
import { Bot, User, Sparkles } from "lucide-react";

const CONVERSATION = [
  {
    role: "user" as const,
    text: "Can you explain what this useEffect does?",
  },
  {
    role: "ai" as const,
    text: "This `useEffect` hook sets up a WebSocket connection when the component mounts. It subscribes to real-time events from the server and updates local state. The cleanup function closes the connection on unmount to prevent memory leaks.",
  },
  {
    role: "user" as const,
    text: "Fix the bug where it reconnects infinitely",
  },
  {
    role: "ai" as const,
    text: "The issue is the missing dependency array causing re-renders. Here's the fix:",
    code: `useEffect(() => {\n  const ws = new WebSocket(url);\n  ws.onmessage = handleMessage;\n  return () => ws.close();\n- }, [url, handleMessage]);\n+ }, [url]); // Remove handleMessage`,
  },
];

export function AiDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [currentAiText, setCurrentAiText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    function showNext(index: number) {
      if (index >= CONVERSATION.length) {
        // Reset after a pause
        timeout = setTimeout(() => {
          setVisibleMessages(0);
          setCurrentAiText("");
          showNext(0);
        }, 4000);
        return;
      }

      const msg = CONVERSATION[index];
      if (!msg) return;

      if (msg.role === "user") {
        setVisibleMessages(index + 1);
        timeout = setTimeout(() => showNext(index + 1), 1200);
      } else {
        // AI typing animation
        setIsAiTyping(true);
        const fullText = msg.text + (msg.code ? "\n" + msg.code : "");
        let charIdx = 0;

        function typeChar() {
          if (charIdx < fullText.length) {
            setCurrentAiText(fullText.substring(0, charIdx + 1));
            charIdx++;
            timeout = setTimeout(typeChar, 15);
          } else {
            setIsAiTyping(false);
            setVisibleMessages(index + 1);
            setCurrentAiText("");
            timeout = setTimeout(() => showNext(index + 1), 2000);
          }
        }

        timeout = setTimeout(typeChar, 800);
      }
    }

    showNext(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            AI Assistant
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Your AI pair{" "}
            <span className="gradient-text">programmer</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Ask questions, fix bugs, generate components, and optimize queries — all within your editor.
          </p>
        </div>

        {/* Demo chat */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl shadow-brand/5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand/15">
                <Sparkles className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-xs text-muted-foreground">Powered by CodeBuddy AI</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={containerRef} className="p-5 space-y-4 min-h-87.5 max-h-100 overflow-y-auto scrollbar-thin">
              {CONVERSATION.slice(0, visibleMessages).map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "ai" && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-brand" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand text-white rounded-br-md"
                        : "bg-muted/60 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                    {msg.code && (
                      <pre className="mt-2 p-3 rounded-lg bg-[#1e1e2e] text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">
                        {msg.code}
                      </pre>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Currently typing AI message */}
              {isAiTyping && (
                <div className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-muted/60 text-sm leading-relaxed">
                    {currentAiText}
                    <span className="inline-block w-0.5 h-4 bg-brand ml-0.5 animate-typing-cursor align-text-bottom" />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="px-5 py-4 border-t border-border/50">
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-2.5">
                <input
                  type="text"
                  placeholder="Ask AI anything..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  disabled
                />
                <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-white hover:bg-brand/90 transition-colors">
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
