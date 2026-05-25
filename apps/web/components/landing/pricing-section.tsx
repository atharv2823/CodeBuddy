"use client";

import { Button } from "@workspace/ui/components/button";
import { Check, X } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for solo developers getting started.",
    features: [
      { text: "1 workspace", included: true },
      { text: "2 collaboration rooms", included: true },
      { text: "Basic AI assistant", included: true },
      { text: "Community support", included: true },
      { text: "Shared terminal", included: false },
      { text: "Voice chat", included: false },
      { text: "Custom themes", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For power users and small teams who ship fast.",
    features: [
      { text: "Unlimited workspaces", included: true },
      { text: "Unlimited rooms", included: true },
      { text: "Advanced AI assistant", included: true },
      { text: "Priority support", included: true },
      { text: "Shared terminal", included: true },
      { text: "Voice chat", included: true },
      { text: "Custom themes", included: true },
      { text: "Git integration", included: true },
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/user/month",
    description: "For engineering teams that need full control.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Team admin dashboard", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Audit logs", included: true },
      { text: "Custom AI models", included: true },
      { text: "On-premise option", included: true },
      { text: "99.9% SLA", included: true },
      { text: "Dedicated support", included: true },
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-semibold text-brand uppercase tracking-wider">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Simple,{" "}
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                plan.featured
                  ? "bg-card/80 backdrop-blur-xl border-2 border-brand/40 shadow-xl shadow-brand/10 scale-[1.02]"
                  : "glass-card-hover"
              }`}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand text-brand-foreground text-xs font-semibold">
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {plan.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              {/* CTA */}
              <Link href="/auth/signup" className="block mb-8">
                <Button
                  className={`w-full h-11 ${
                    plan.featured
                      ? "bg-brand hover:bg-brand/90 text-brand-foreground"
                      : ""
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Features list */}
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-brand flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span
                      className={
                        f.included ? "" : "text-muted-foreground/50"
                      }
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
