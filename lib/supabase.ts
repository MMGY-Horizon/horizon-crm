import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const supabase = (() => {
  const url = assertEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = assertEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
})();

export const supabaseAdmin = (() => {
  const url = assertEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = assertEnv(
    supabaseServiceRoleKey,
    "SUPABASE_SERVICE_ROLE_KEY"
  );
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
})();