"use client";

import { useEffect, useState, useRef } from "react";

const USER_A = { name: "Sarah", color: "#a78bfa" };
const USER_B = { name: "Alex", color: "#34d399" };

const TYPING_SEQUENCE = [
  { user: "a", text: "const greeting = ", delay: 60 },
  { user: "b", text: "function sayHello(", delay: 70 },
  { user: "a", text: "\"Hello, \"", delay: 50 },
  { user: "b", text: "name: string", delay: 65 },
  { user: "a", text: " + name;", delay: 55 },
  { user: "b", text: ") {", delay: 80 },
  { user: "b", text: "\n  return `Welcome, ${name}!`;", delay: 45 },
  { user: "b", text: "\n}", delay: 100 },
];

function TypingDots({ color }: { color: string }) {
  return (
    <span className="inline-flex gap-0.5 ml-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: color,
            animation: `typing-dots 1.4s infinite ${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}

export function RealtimeDemo() {
  const [lineA, setLineA] = useState("");
  const [lineB, setLineB] = useState("");
  const [typingUser, setTypingUser] = useState<"a" | "b" | null>(null);
  const seqIndex = useRef(0);
  const charIndex = useRef(0);
  const isRunning = useRef(false);

  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    function typeNext() {
      if (seqIndex.current >= TYPING_SEQUENCE.length) {
        // Reset loop
        seqIndex.current = 0;
        charIndex.current = 0;
        setLineA("");
        setLineB("");
        setTimeout(typeNext, 2000);
        return;
      }

      const step = TYPING_SEQUENCE[seqIndex.current];
      if (!step) return;
      const fullText = step.text;

      if (charIndex.current === 0) {
        setTypingUser(step.user as "a" | "b");
      }

      if (charIndex.current < fullText.length) {
        const char = fullText[charIndex.current];
        if (step.user === "a") {
          setLineA((prev) => prev + char);
        } else {
          setLineB((prev) => prev + char);
        }
        charIndex.current++;
        setTimeout(typeNext, step.delay);
      } else {
        setTypingUser(null);
        charIndex.current = 0;
        seqIndex.current++;
        setTimeout(typeNext, 400);
      }
    }

    setTimeout(typeNext, 1000);
  }, []);

  return (
    <section id="demos" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            Real-time Collaboration
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            See each other{" "}
            <span className="gradient-text">code live</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Watch as multiple developers type simultaneously — with live cursors, selections, and typing indicators.
          </p>
        </div>

        {/* Demo panel */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-[#1e1e2e] shadow-2xl shadow-brand/5 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-white/30 font-mono">collab.ts</span>
              <div className="flex items-center gap-2">
                {[USER_A, USER_B].map((u) => (
                  <div
                    key={u.name}
                    className="flex items-center gap-1.5"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name[0]}
                    </div>
                    <span className="text-[10px] text-white/40">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Two-pane editor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              {/* User A pane */}
              <div className="p-5 min-h-50">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ backgroundColor: USER_A.color }}
                  >
                    S
                  </div>
                  <span className="text-xs font-medium" style={{ color: USER_A.color }}>
                    {USER_A.name}
                  </span>
                  {typingUser === "a" && <TypingDots color={USER_A.color} />}
                </div>
                <pre className="font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {lineA}
                  {typingUser === "a" && (
                    <span
                      className="inline-block w-0.5 h-4 ml-0.5 animate-typing-cursor align-text-bottom"
                      style={{ backgroundColor: USER_A.color }}
                    />
                  )}
                </pre>
              </div>

              {/* User B pane */}
              <div className="p-5 min-h-50">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ backgroundColor: USER_B.color }}
                  >
                    A
                  </div>
                  <span className="text-xs font-medium" style={{ color: USER_B.color }}>
                    {USER_B.name}
                  </span>
                  {typingUser === "b" && <TypingDots color={USER_B.color} />}
                </div>
                <pre className="font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {lineB}
                  {typingUser === "b" && (
                    <span
                      className="inline-block w-0.5 h-4 ml-0.5 animate-typing-cursor align-text-bottom"
                      style={{ backgroundColor: USER_B.color }}
                    />
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
