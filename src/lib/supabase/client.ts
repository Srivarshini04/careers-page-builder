import { createBrowserClient } from "@supabase/ssr";

import { supabaseAnonKey, supabaseUrl } from "./env";

/** Supabase client for Client Components. Uses the public anon key only. */
export function createClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
