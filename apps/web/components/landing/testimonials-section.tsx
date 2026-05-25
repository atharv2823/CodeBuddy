"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Senior Frontend Engineer",
    company: "Stripe",
    avatar: "PS",
    color: "#a78bfa",
    quote:
      "CodeBuddy completely changed how our team collaborates on code. The real-time cursors and AI assistant cut our review cycles in half.",
    stars: 5,
  },
  {
    name: "Marcus Chen",
    role: "Tech Lead",
    company: "Vercel",
    avatar: "MC",
    color: "#34d399",
    quote:
      "The shared terminal alone is worth it. We debug production issues together in seconds instead of context-switching through Slack.",
    stars: 5,
  },
  {
    name: "Olivia Wright",
    role: "Full Stack Developer",
    company: "Linear",
    avatar: "OW",
    color: "#f472b6",
    quote:
      "I was skeptical about browser-based IDEs, but CodeBuddy feels just as fast as VS Code. The AI features are the cherry on top.",
    stars: 5,
  },
  {
    name: "James Okafor",
    role: "Engineering Manager",
    company: "Notion",
    avatar: "JO",
    color: "#f59e0b",
    quote:
      "We onboard new developers 3x faster now. They can see exactly how the team writes code, in real time. It's like pair programming on steroids.",
    stars: 5,
  },
  {
    name: "Elena Volkov",
    role: "DevOps Engineer",
    company: "Cloudflare",
    avatar: "EV",
    color: "#60a5fa",
    quote:
      "The integrated terminal with build pipelines saved us hours every week. Watching deploys together makes the whole team feel connected.",
    stars: 4,
  },
  {
    name: "Daniel Kim",
    role: "Indie Hacker",
    company: "Self-employed",
    avatar: "DK",
    color: "#c084fc",
    quote:
      "As a solo developer, the AI assistant is like having a senior engineer on call 24/7. It catches bugs I'd miss and suggests better patterns.",
    stars: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Loved by{" "}
            <span className="gradient-text">developers</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Hear from teams who ship faster with CodeBuddy.
          </p>
        </div>

        {/* Masonry-style testimonial grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="break-inside-avoid group rounded-2xl glass-card-hover p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
                {Array.from({ length: 5 - t.stars }).map((_, i) => (
                  <Star
                    key={`empty-${i}`}
                    className="w-4 h-4 text-muted-foreground/30"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} at {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
