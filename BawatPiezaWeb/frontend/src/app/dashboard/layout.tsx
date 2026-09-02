"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TileLoader from "@/components/TileLoader";
import { UserProvider } from "@/context/UserContext";

/**
 * Client-side session guard for every /dashboard/* route.
 * - No session        -> redirected to the login page (/)
 * - Session present   -> dashboard renders
 * The backend ALSO verifies the JWT (middleware/auth.ts), so hitting API
 * URLs directly without a token returns 401 regardless of the UI.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed">("checking");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace("/");
        return;
      }
      setStatus("allowed");
    })();

    // React instantly if the user signs out (or the token is revoked)
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const { supabase } = await import("@/lib/supabaseClient");
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
          supabase.auth.getSession().then(({ data: d }) => {
            if (!d.session) router.replace("/");
          });
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <TileLoader label="Verifying session" size="md" />
      </div>
    );
  }

  return <UserProvider>{children}</UserProvider>;
}
