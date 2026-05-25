"use client";

import {
  Users,
  Bot,
  Terminal,
  Code2,
  GitBranch,
  Mic,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Code together with live cursors, selections, and presence — just like Figma, but for code.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Get instant explanations, bug fixes, and code generation powered by cutting-edge AI models.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Terminal,
    title: "Shared Terminal",
    description:
      "Run commands, view logs, and manage builds in a terminal shared with your entire team.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Code2,
    title: "Monaco Editor",
    description:
      "Full VS Code editing experience with IntelliSense, multi-file tabs, minimap, and extensions.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description:
      "Push, pull, commit, and manage branches — all without leaving your browser workspace.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Mic,
    title: "Voice Chat",
    description:
      "Talk to your teammates while you code with built-in low-latency voice communication.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="gradient-text">ship faster</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A fully integrated development environment built for teams that move fast.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative p-6 sm:p-8 rounded-2xl glass-card-hover"
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-5 shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2 group-hover:text-brand transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient line at bottom */}
                <div
                  className={`absolute bottom-0 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
