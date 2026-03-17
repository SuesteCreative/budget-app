
"use server";

import { createClient } from "@supabase/supabase-js";

export async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(`Supabase Admin Error: URL or Service Key is missing. URL: ${!!supabaseUrl}, Key: ${!!supabaseServiceKey}`);
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
