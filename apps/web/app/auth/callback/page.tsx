"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const syncUserToMongoDB = async (email: string, username: string) => {
      try {
        await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }),
        });
      } catch (err) {
        console.error("Failed to sync user to MongoDB:", err);
      }
    };

    // Supabase handles the session exchange automatically when client-side client is loaded
    // and checks the URL hash/query parameters. We just listen for state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || "";
        const username =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split("@")[0];
        await syncUserToMongoDB(email, username);
        router.push("/dashboard");
      } else if (event === "SIGNED_OUT") {
        router.push("/auth/login");
      }
    });

    // Fallback: If no auth state change fires or is already signed in, check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email || "";
        const username =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          email.split("@")[0];
        await syncUserToMongoDB(email, username);
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-sm w-full p-8 rounded-2xl border border-brand/10 bg-card/50 backdrop-blur-md shadow-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -inset-px bg-gradient-to-r from-brand/20 to-purple-500/20 rounded-2xl blur-xl opacity-30 -z-10" />

        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Completing sign in...
        </h2>
        <p className="text-muted-foreground text-sm">
          Please wait while we secure your workspace and redirect you.
        </p>
      </motion.div>
    </div>
  );
}
