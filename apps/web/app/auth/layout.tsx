"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

/* ── Floating Code Particles ── */
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  symbol: string;
}

const CODE_SYMBOLS = [
  "</>",
  "{ }",
  "=>",
  "( )",
  "[ ]",
  "&&",
  "||",
  "++",
  "fn",
  "let",
  "if",
  "::",
  "!=",
  "==",
  "**",
  ";;",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 14 + 10,
    opacity: Math.random() * 0.15 + 0.05,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    symbol: CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)]!,
  }));
}

function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(18));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute font-mono text-white/20 select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity, p.opacity * 0.6, p.opacity],
            rotate: [0, 5, -5, 3, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        >
          {p.symbol}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Animated Grid Background ── */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
        }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ── Orbiting Dots ── */
function OrbitingDots() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-brand/10"
          style={{
            width: `${200 + i * 120}px`,
            height: `${200 + i * 120}px`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.div
            className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-brand/40"
            style={{ marginLeft: "-4px" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh">
      {/* ── Left Panel: Branded Background ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#0f0a1f] via-[#1a1035] to-[#0d0620] overflow-hidden items-center justify-center">
        {/* Layered effects */}
        <AnimatedGrid />
        <FloatingParticles />
        <OrbitingDots />

        {/* Radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand/15 border border-brand/25 backdrop-blur-sm">
                <Code2 className="w-6 h-6 text-brand" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Code<span className="gradient-text">Buddy</span>
              </span>
            </Link>
          </motion.div>

          {/* Mock Code Editor Window */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full"
          >
            <div className="rounded-xl border border-white/10 bg-[#1e1e2e]/80 backdrop-blur-xl shadow-2xl shadow-brand/5 overflow-hidden">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="flex-1 text-center text-[11px] text-white/25 font-mono">
                  welcome.tsx — CodeBuddy
                </span>
              </div>
              {/* Code */}
              <div className="p-4 font-mono text-xs leading-6">
                {[
                  { num: 1, code: '<span style="color:#c678dd">import</span> <span style="color:#e5c07b">{ collaborate }</span> <span style="color:#c678dd">from</span> <span style="color:#98c379">\'codebuddy\'</span>' },
                  { num: 2, code: '' },
                  { num: 3, code: '<span style="color:#c678dd">const</span> <span style="color:#61afef">team</span> = <span style="color:#c678dd">await</span> <span style="color:#61afef">collaborate</span>({' },
                  { num: 4, code: '  <span style="color:#e06c75">ai</span>: <span style="color:#d19a66">true</span>,' },
                  { num: 5, code: '  <span style="color:#e06c75">realtime</span>: <span style="color:#d19a66">true</span>,' },
                  { num: 6, code: '  <span style="color:#e06c75">magic</span>: <span style="color:#98c379">\'✨\'</span>' },
                  { num: 7, code: '})' },
                ].map((line) => (
                  <div key={line.num} className="flex">
                    <span className="w-8 text-right pr-4 text-white/15 select-none">
                      {line.num}
                    </span>
                    <span
                      dangerouslySetInnerHTML={{ __html: line.code || "&nbsp;" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 space-y-4"
          >
            <h2 className="text-xl font-semibold text-white leading-tight">
              Where teams build
              <span className="gradient-text"> together</span>
            </h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Real-time collaboration, AI-powered coding assistance, and shared
              terminals — all in one beautiful IDE.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 flex items-center gap-6"
          >
            {[
              { label: "2K+", sub: "Developers" },
              { label: "99.9%", sub: "Uptime" },
              { label: "50ms", sub: "Latency" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-sm font-semibold text-white/80">
                  {stat.label}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">
                  {stat.sub}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right Panel: Auth Form ── */}
      <div className="flex-1 flex flex-col relative bg-background">
        {/* Subtle background effects for the form side */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/3 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/3 rounded-full blur-[120px] pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center pt-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10 border border-brand/20">
              <Code2 className="w-4.5 h-4.5 text-brand" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Code<span className="gradient-text">Buddy</span>
            </span>
          </Link>
        </div>

        {/* Form area with page transition */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full max-w-md"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
