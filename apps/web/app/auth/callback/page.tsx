"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Loader2, Sparkles, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Developer");
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadingState, setShowLoadingState] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    const handleAuthFlow = async (emailStr: string, defaultUsername: string) => {
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        // 1. Check if the user profile exists in MongoDB
        const checkRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/check?email=${encodeURIComponent(emailStr)}`
        );
        if (!checkRes.ok) throw new Error("Failed to check user presence");
        const checkData = await checkRes.json();

        if (checkData.exists) {
          // 2. User exists, skip setup and redirect immediately
          router.push("/dashboard");
        } else {
          // 3. User does not exist, pause the onboarding & open Setup Dialog
          setEmail(emailStr);
          setUsername(defaultUsername.replace(/\s+/g, "").toLowerCase());
          setShowLoadingState(false);
          setIsOpen(true);
        }
      } catch (err: any) {
        console.error("Failed to authenticate user profile sync:", err);
        setErrorMsg("Something went wrong during profile setup. Please try again.");
        setShowLoadingState(false);
      }
    };

    // Listen to Supabase auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = session.user.email || "";
        const defaultName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          userEmail.split("@")[0];
        await handleAuthFlow(userEmail, defaultName);
      } else if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
    });

    // Fallback: Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userEmail = session.user.email || "";
        const defaultName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          userEmail.split("@")[0];
        await handleAuthFlow(userEmail, defaultName);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("Username cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg("");

      // 4. Save details directly to MongoDB
      const saveRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username: username.trim(), role }),
      });

      if (!saveRes.ok) throw new Error("Failed to save profile details");

      // 5. Success: Redirect to dashboard
      setIsOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error creating user profile:", err);
      setErrorMsg("Failed to save details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AnimatePresence mode="wait">
        {showLoadingState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-sm w-full p-8 rounded-2xl border border-brand/10 bg-card/50 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-brand/20 to-purple-500/20 rounded-2xl blur-xl opacity-30 -z-10" />

            <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
            <h2 className="text-xl font-bold tracking-tight mb-2">
              Securing session...
            </h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we check your developer workspace.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform border border-brand/10 bg-card/90 backdrop-blur-lg shadow-2xl relative overflow-hidden"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          showCloseButton={false}
        >
          {/* Subtle upper light gradient */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand/20 rounded-full blur-2xl -z-10" />

          <DialogHeader className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-xs text-brand w-fit">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Welcome to CodeBuddy
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-left">
              Complete your profile
            </DialogTitle>
            <DialogDescription className="text-left text-muted-foreground">
              Confirm or pick your unique workspace username to get started on your collaborative coding journey.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDetails} className="space-y-4 my-2">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1.5 text-left text-foreground/80"
              >
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors duration-200" />
                <Input
                  id="username"
                  type="text"
                  placeholder="choose_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 pl-10 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50 bg-background/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-left text-foreground/80">
                Choose your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("Developer")}
                  className={cn(
                    "h-11 px-4 rounded-lg border text-sm font-medium transition-all duration-300",
                    role === "Developer"
                      ? "border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10 cursor-default"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:border-brand/20 hover:text-foreground cursor-pointer"
                  )}
                >
                  Developer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("Interviewer")}
                  className={cn(
                    "h-11 px-4 rounded-lg border text-sm font-medium transition-all duration-300",
                    role === "Interviewer"
                      ? "border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10 cursor-default"
                      : "border-border/60 bg-background/50 text-muted-foreground hover:border-brand/20 hover:text-foreground cursor-pointer"
                  )}
                >
                  Interviewer
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-500 text-left bg-red-500/10 p-2.5 rounded-lg border border-red-500/15">
                {errorMsg}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full h-11 bg-brand hover:bg-brand/90 text-brand-foreground text-sm font-medium glow-brand transition-all duration-300 hover:shadow-lg hover:shadow-brand/25"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving details...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    Enter Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
