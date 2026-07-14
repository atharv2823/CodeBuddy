"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function UserAvatar() {
  const [initial, setInitial] = useState("U");

  useEffect(() => {
    const fetchUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";
        setInitial(name.charAt(0).toUpperCase());
      }
    };

    fetchUserSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split("@")[0] ||
          "User";
        setInitial(name.charAt(0).toUpperCase());
      } else {
        setInitial("U");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-white">
      {initial}
    </div>
  );
}
