"use client";

import { useEffect, useState, useRef } from "react";

const TERMINAL_LINES = [
  { text: "$ pnpm install", color: "#98c379", delay: 800 },
  { text: "Resolving dependencies...", color: "#abb2bf", delay: 400 },
  { text: "Packages: +247", color: "#abb2bf", delay: 300 },
  { text: "████████████████████████████ 100%", color: "#61afef", delay: 600 },
  { text: "✓ Installed in 3.2s", color: "#98c379", delay: 500 },
  { text: "", color: "", delay: 200 },
  { text: "$ pnpm run build", color: "#98c379", delay: 800 },
  { text: "▲ Next.js 16.1.6 (Turbopack)", color: "#abb2bf", delay: 300 },
  { text: "  Creating optimized build...", color: "#abb2bf", delay: 600 },
  { text: "  ✓ Compiled successfully in 4.1s", color: "#98c379", delay: 400 },
  { text: "  ✓ Generating static pages (13/13)", color: "#98c379", delay: 300 },
  { text: "  ✓ Build completed", color: "#98c379", delay: 500 },
  { text: "", color: "", delay: 200 },
  { text: "$ pnpm deploy --prod", color: "#98c379", delay: 800 },
  { text: "Deploying to production...", color: "#abb2bf", delay: 600 },
  { text: "  Uploading artifacts ████████ 100%", color: "#61afef", delay: 500 },
  { text: "  ✓ Deployed to https://codebuddy.app", color: "#98c379", delay: 400 },
  { text: "  ✓ SSL certificate valid", color: "#98c379", delay: 200 },
  { text: "", color: "", delay: 200 },
  { text: "Ready! 🚀", color: "#e5c07b", delay: 0 },
];

const SHARED_USERS = [
  { name: "Sarah", color: "#a78bfa", initial: "S" },
  { name: "Alex", color: "#34d399", initial: "A" },
  { name: "Jamie", color: "#f472b6", initial: "J" },
];

export function TerminalDemo() {
  const [lines, setLines] = useState<typeof TERMINAL_LINES>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    let currentIndex = 0;

    function addLine() {
      if (currentIndex >= TERMINAL_LINES.length) {
        // Reset after pause
        setTimeout(() => {
          setLines([]);
          currentIndex = 0;
          setTimeout(addLine, 800);
        }, 5000);
        return;
      }

      const line = TERMINAL_LINES[currentIndex];
      if (!line) return;
      setLines((prev) => [...prev, line]);
      currentIndex++;

      // Auto scroll
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }

      setTimeout(addLine, line.delay + 100);
    }

    setTimeout(addLine, 1000);
  }, []);

  return (
    <section className="relative py-24 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            Shared Terminal
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Build and deploy{" "}
            <span className="gradient-text">together</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A shared terminal where your entire team can run commands, view logs, and deploy — all in real time.
          </p>
        </div>

        {/* Terminal */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border/50 bg-[#0d1117] shadow-2xl shadow-brand/5 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-white/30 font-mono">
                Terminal — shared session
              </span>
              {/* Shared users */}
              <div className="flex -space-x-1.5">
                {SHARED_USERS.map((u) => (
                  <div
                    key={u.name}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border-2 border-[#161b22]"
                    style={{ backgroundColor: u.color }}
                    title={u.name}
                  >
                    {u.initial}
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal output */}
            <div
              ref={containerRef}
              className="p-5 min-h-[320px] max-h-[400px] overflow-y-auto scrollbar-thin font-mono text-sm leading-7"
            >
              {lines.map((line, i) => (
                <div key={i}>
                  {line.text ? (
                    <span style={{ color: line.color }}>{line.text}</span>
                  ) : (
                    <br />
                  )}
                </div>
              ))}
              {/* Blinking cursor */}
              <span className="inline-block w-2 h-4 bg-green-400 animate-typing-cursor" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
