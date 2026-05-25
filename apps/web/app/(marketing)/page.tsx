import { Navbar } from "@/components/navbar/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { RealtimeDemo } from "@/components/landing/realtime-demo";
import { AiDemo } from "@/components/landing/ai-demo";
import { TerminalDemo } from "@/components/landing/terminal-demo";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export const metadata = {
  title: "CodeBuddy — Collaborative AI-Powered IDE",
  description:
    "Code together in real time with AI assistance, shared terminals, and live cursors. The future of collaborative development.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <RealtimeDemo />
      <AiDemo />
      <TerminalDemo />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
