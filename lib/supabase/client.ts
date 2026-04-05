import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';

const getClient = () =>
  _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

/** Default export alias */
export function createClient() {
  return getClient();
}

/** Alias used by client components */
export function createBrowserClient() {
  return getClient();
}
