"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Sparkles,
  Check,
  X,
} from "lucide-react";

/* ── Animation Variants ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ── GitHub Icon SVG ── */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

/* ── Google Icon SVG ── */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ── Password Strength Meter ── */
function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: "8+ characters", met: password.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Number", met: /[0-9]/.test(password) },
      { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
    ],
    [password]
  );

  const strength = checks.filter((c) => c.met).length;

  const strengthColor =
    strength <= 1
      ? "bg-red-500"
      : strength === 2
        ? "bg-orange-500"
        : strength === 3
          ? "bg-yellow-500"
          : "bg-green-500";

  const strengthLabel =
    strength <= 1
      ? "Weak"
      : strength === 2
        ? "Fair"
        : strength === 3
          ? "Good"
          : "Strong";

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 space-y-2.5"
    >
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < strength ? strengthColor : "bg-muted"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            />
          ))}
        </div>
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            strength <= 1
              ? "text-red-500"
              : strength === 2
                ? "text-orange-500"
                : strength === 3
                  ? "text-yellow-500"
                  : "text-green-500"
          }`}
        >
          {strengthLabel}
        </span>
      </div>

      {/* Individual checks */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((check) => (
          <motion.div
            key={check.label}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {check.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground/50" />
            )}
            <span
              className={`text-[11px] ${
                check.met ? "text-green-500" : "text-muted-foreground/60"
              }`}
            >
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
    },
    []
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-xs text-brand mb-4">
          <Sparkles className="w-3 h-3" />
          Start for free
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Create your <span className="gradient-text">account</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Join 2,000+ developers building collaboratively with AI assistance.
        </p>
      </motion.div>

      {/* Social Login Buttons */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-11 gap-2 text-sm font-medium hover:border-brand/30 hover:bg-brand/5 transition-all duration-300"
          id="signup-github"
        >
          <GitHubIcon className="w-4 h-4" />
          GitHub
        </Button>
        <Button
          variant="outline"
          className="h-11 gap-2 text-sm font-medium hover:border-brand/30 hover:bg-brand/5 transition-all duration-300"
          id="signup-google"
        >
          <GoogleIcon className="w-4 h-4" />
          Google
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={item}
        className="relative flex items-center gap-4 my-6"
      >
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0">
          or continue with email
        </span>
        <Separator className="flex-1" />
      </motion.div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <motion.div variants={item}>
          <label
            htmlFor="signup-name"
            className="block text-sm font-medium mb-1.5"
          >
            Full name
          </label>
          <div className="relative group">
            <User
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === "name"
                  ? "text-brand"
                  : "text-muted-foreground"
              }`}
            />
            <Input
              id="signup-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
              className="h-11 pl-10 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50"
              required
            />
            {focusedField === "name" && (
              <motion.div
                layoutId="signup-field-glow"
                className="absolute -inset-px rounded-lg bg-brand/5 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div variants={item}>
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium mb-1.5"
          >
            Email address
          </label>
          <div className="relative group">
            <Mail
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === "email"
                  ? "text-brand"
                  : "text-muted-foreground"
              }`}
            />
            <Input
              id="signup-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className="h-11 pl-10 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50"
              required
            />
            {focusedField === "email" && (
              <motion.div
                layoutId="signup-field-glow"
                className="absolute -inset-px rounded-lg bg-brand/5 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={item}>
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium mb-1.5"
          >
            Password
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                focusedField === "password"
                  ? "text-brand"
                  : "text-muted-foreground"
              }`}
            />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className="h-11 pl-10 pr-10 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            {focusedField === "password" && (
              <motion.div
                layoutId="signup-field-glow"
                className="absolute -inset-px rounded-lg bg-brand/5 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>

          {/* Password Strength Indicator */}
          <PasswordStrength password={password} />
        </motion.div>

        {/* Terms Checkbox */}
        <motion.div variants={item} className="flex items-start gap-3 pt-1">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              id="signup-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="peer sr-only"
            />
            <label
              htmlFor="signup-terms"
              className="flex h-4 w-4 cursor-pointer items-center justify-center rounded border border-input bg-background transition-all duration-200 peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30"
            >
              {agreedToTerms && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </label>
          </div>
          <label
            htmlFor="signup-terms"
            className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="#"
              className="text-brand hover:text-brand/80 transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-brand hover:text-brand/80 transition-colors"
            >
              Privacy Policy
            </Link>
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={item} className="pt-2">
          <Button
            type="submit"
            disabled={isLoading || !agreedToTerms}
            className="w-full h-11 bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-medium glow-brand transition-all duration-300 hover:shadow-lg hover:shadow-brand/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            id="signup-submit"
          >
            {isLoading ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </motion.div>
            ) : (
              <span className="flex items-center gap-2">
                Create account
                <ArrowRight className="w-4 h-4 group-hover/button:translate-x-0.5 transition-transform" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Footer */}
      <motion.p
        variants={item}
        className="mt-8 text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-brand hover:text-brand/80 font-medium transition-colors"
        >
          Sign in
          <ArrowRight className="inline w-3 h-3 ml-1" />
        </Link>
      </motion.p>
    </motion.div>
  );
}
