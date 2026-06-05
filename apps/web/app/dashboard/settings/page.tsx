"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Briefcase,
  Loader2,
  Sparkles,
  Shield,
  BadgeAlert,
  Save,
  CheckCircle,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Developer");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // 1. Get auth session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const userEmail = session.user.email || "";
        setEmail(userEmail);

        // 2. Fetch extended details (username, role) from MongoDB database
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/check?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.user) {
            setUsername(data.user.username);
            setRole(data.user.role || "Developer");
          } else {
            // Fallback to Supabase metadata if MongoDB doesn't have it yet
            setUsername(
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              userEmail.split("@")[0]
            );
          }
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      setIsSaving(true);
      setMessage(null);

      // 3. Save modifications directly to MongoDB
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username: username.trim(), role }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const initialLetter = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Profile <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Customize your developer profile preferences, manage workspace metadata, and confirm your collaboration role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-brand/10 bg-card/30 backdrop-blur-md relative overflow-hidden text-center p-6">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand/5 rounded-full blur-3xl -z-10" />
            <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-brand/20">
              {initialLetter}
            </div>
            <h3 className="text-lg font-bold">{username || "User"}</h3>
            <p className="text-xs text-muted-foreground truncate mb-4">{email}</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-[10px] uppercase font-bold tracking-wider text-brand">
              <Shield className="w-3.5 h-3.5" />
              {role}
            </div>
          </Card>
        </div>

        {/* Right Side: Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-brand/10 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">Profile Preferences</CardTitle>
              <CardDescription>Update your personal information and coding roles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs font-semibold p-3 rounded-lg border flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-red-500/10 border-red-500/20 text-red-500"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <BadgeAlert className="w-4 h-4 shrink-0" />
                    )}
                    {message.text}
                  </motion.div>
                )}

                {/* Email (Read-Only) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address (Linked via Supabase)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <Input
                      type="email"
                      value={email}
                      disabled
                      className="h-11 pl-10 bg-[#0f1016]/40 cursor-not-allowed text-muted-foreground/60 border-border/40"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Workspace Username
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand transition-colors duration-200" />
                    <Input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-11 pl-10 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50"
                      required
                    />
                  </div>
                </div>

                {/* Toggle Role Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Workspace Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("Developer")}
                      className={`h-11 px-4 rounded-lg border text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        role === "Developer"
                          ? "border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10"
                          : "border-border/60 bg-[#0f1016]/40 text-muted-foreground hover:border-brand/20 hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      Developer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("Interviewer")}
                      className={`h-11 px-4 rounded-lg border text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        role === "Interviewer"
                          ? "border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10"
                          : "border-border/60 bg-[#0f1016]/40 text-muted-foreground hover:border-brand/20 hover:text-foreground"
                      }`}
                    >
                      <Briefcase className="w-4 h-4 shrink-0" />
                      Interviewer
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-11 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold glow-brand transition-all duration-300 gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
