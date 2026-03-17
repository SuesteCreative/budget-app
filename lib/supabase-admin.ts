
"use server";

import { createClient } from "@supabase/supabase-js";

// Lazy initialization to prevent module-level crashes
let supabaseInstance: any = null;

export const getSupabaseAdmin = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = "https://jyrffzymewpigjctnsco.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5cmZmenltZXdwaWdqY3Ruc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDAyMywiZXhwIjoyMDg5MzM2MDIzfQ.9_7HpMV4K7l7n3qSv1OPuCz3HgThkcUorbo-nI10HH8";

  supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
};

// For backward compatibility in existing actions
export const supabaseAdmin = getSupabaseAdmin();
