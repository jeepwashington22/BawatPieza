import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  throw new Error(
    "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env.local",
  );
}

/**
 * Supabase browser client.
 * Uses the public ANON key - safe to ship to the browser.
 * RLS policies on tables gate access to authenticated users.
 */
export const supabase = createClient(url, anonKey);