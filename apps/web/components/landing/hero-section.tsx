"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

/* Simulated live cursors that float around the hero mock editor */
const CURSORS = [
  { name: "Sarah", color: "#a78bfa", x: 42, y: 35 },
  { name: "Alex", color: "#34d399", x: 68, y: 58 },
  { name: "Jamie", color: "#f472b6", x: 25, y: 72 },
];

function FloatingCursor({
  name,
  color,
  startX,
  startY,
}: {
  name: string;
  color: string;
  startX: number;
  startY: number;
}) {
  const [pos, setPos] = useState({ x: startX, y: startY });

  useEffect(() => {
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: prev.x + (Math.random() - 0.5) * 6,
        y: prev.y + (Math.random() - 0.5) * 4,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute transition-all duration-2000 ease-in-out pointer-events-none z-10"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {/* Cursor SVG */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        className="drop-shadow-lg"
      >
        <path
          d="M0.5 0.5L15.5 10.5L7.5 12.5L4.5 19.5L0.5 0.5Z"
          fill={color}
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>
      {/* Name label */}
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded-md text-[10px] font-medium text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}

/* Typing effect for the hero headline */
function TypingText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex] ?? "";

    if (!isDeleting && displayedText === currentFullText) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
    } else {
      timeoutRef.current = setTimeout(
        () => {
          setDisplayedText(
            isDeleting
              ? currentFullText.substring(0, displayedText.length - 1)
              : currentFullText.substring(0, displayedText.length + 1)
          );
        },
        isDeleting ? 40 : 80
      );
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayedText, isDeleting, currentTextIndex, texts]);

  return (
    <span className="gradient-text">
      {displayedText}
      <span className="inline-block w-0.5 h-4 ml-1 animate-typing-cursor align-text-bottom" />
    </span>
  );
}

/* Mock editor code that appears in the hero */
const CODE_LINES = [
  { indent: 0, tokens: [{ text: "import", color: "#c678dd" }, { text: " { useState } ", color: "#e5c07b" }, { text: "from", color: "#c678dd" }, { text: " 'react'", color: "#98c379" }] },
  { indent: 0, tokens: [{ text: "", color: "" }] },
  { indent: 0, tokens: [{ text: "export default function", color: "#c678dd" }, { text: " App", color: "#61afef" }, { text: "() {", color: "#abb2bf" }] },
  { indent: 1, tokens: [{ text: "const", color: "#c678dd" }, { text: " [count, setCount]", color: "#e5c07b" }, { text: " = ", color: "#abb2bf" }, { text: "useState", color: "#61afef" }, { text: "(0)", color: "#d19a66" }] },
  { indent: 1, tokens: [] },
  { indent: 1, tokens: [{ text: "return", color: "#c678dd" }, { text: " (", color: "#abb2bf" }] },
  { indent: 2, tokens: [{ text: "<div", color: "#e06c75" }, { text: " className=", color: "#d19a66" }, { text: "\"container\"", color: "#98c379" }, { text: ">", color: "#e06c75" }] },
  { indent: 3, tokens: [{ text: "<h1>", color: "#e06c75" }, { text: "Count: {count}", color: "#abb2bf" }, { text: "</h1>", color: "#e06c75" }] },
  { indent: 3, tokens: [{ text: "<button", color: "#e06c75" }, { text: " onClick=", color: "#d19a66" }, { text: "{() =>", color: "#abb2bf" }] },
  { indent: 4, tokens: [{ text: "setCount", color: "#61afef" }, { text: "(count + 1)", color: "#abb2bf" }] },
  { indent: 3, tokens: [{ text: "}>", color: "#abb2bf" }, { text: "Increment", color: "#abb2bf" }, { text: "</button>", color: "#e06c75" }] },
  { indent: 2, tokens: [{ text: "</div>", color: "#e06c75" }] },
  { indent: 1, tokens: [{ text: ")", color: "#abb2bf" }] },
  { indent: 0, tokens: [{ text: "}", color: "#abb2bf" }] },
];

function MockEditor() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Window chrome */}
      <div className="rounded-xl border border-border/50 bg-[#1e1e2e] shadow-2xl shadow-brand/10 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-white/30 font-mono">App.tsx — CodeBuddy</span>
          </div>
        </div>

        {/* Code area */}
        <div className="relative p-4 font-mono text-xs sm:text-sm leading-6 min-h-80">
          {/* Live cursors */}
          {CURSORS.map((c) => (
            <FloatingCursor
              key={c.name}
              name={c.name}
              color={c.color}
              startX={c.x}
              startY={c.y}
            />
          ))}

          {/* Code lines */}
          {CODE_LINES.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-right pr-4 text-white/20 select-none">
                {i + 1}
              </span>
              <span style={{ paddingLeft: `${line.indent * 20}px` }}>
                {line.tokens.map((token, j) => (
                  <span key={j} style={{ color: token.color }}>
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Glow effect behind editor */}
      <div className="absolute -inset-4 bg-brand/10 rounded-2xl blur-3xl -z-10 animate-pulse-glow" />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern" />

      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 bg-brand/8 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/20 bg-brand/5 text-sm text-brand">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand/60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
          </span>
          Now in Public Beta
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
          <span className="block">Code Together.</span>
          <span className="block mt-2">
            <TypingText texts={["Think Faster.", "Ship Smarter.", "Build Better."]} />
          </span>
          <span className="block mt-2">Build With AI.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
          The collaborative, AI-powered IDE that lets your team code, debug, and
          deploy in real time — from anywhere in the world.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-brand hover:bg-brand/90 text-brand-foreground text-base px-8 h-12 glow-brand"
            >
              Start Coding Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-base px-8 h-12">
            <Play className="w-4 h-4 mr-1" />
            Watch Demo
          </Button>
        </div>

        {/* Social proof line */}
        <p className="text-sm text-muted-foreground">
          Trusted by <span className="text-foreground font-medium">2,000+</span> developers worldwide
        </p>
      </div>

      {/* Mock editor */}
      <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto opacity-0 animate-fade-in-up-delayed">
        <MockEditor />
      </div>
    </section>
  );
}
