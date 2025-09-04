// lib/supabase/server.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (typeof window !== "undefined") {
  throw new Error("`server.ts` should not be imported in client-side code.");
}

if (!url || !serviceKey) {
  throw new Error("Missing Supabase server env (URL or SERVICE_ROLE_KEY).");
}

export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
