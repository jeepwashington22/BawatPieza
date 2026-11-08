import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error(
    "Supabase configuration is missing from the monolith backend. Start BawatPiezaMobileApp/backend with its .env configured, then restart this app.",
  );
}

/**
 * Supabase browser client.
 * Uses the public ANON key - safe to ship to the browser.
 * RLS policies on tables gate access to authenticated users.
 */
export const supabase = createClient(url, anonKey);