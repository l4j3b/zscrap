import type { Session } from '@remix-run/cloudflare';
import { createServerClient } from '@supabase/ssr';

import type { Database } from 'database.types';

export const createSupabaseServerClient = async ({
  session,
  supabaseUrl,
  supabaseKey,
}: {
  session: Session;
  supabaseUrl: string;
  supabaseKey: string;
}) => {
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(key) {
        return session.get(key);
      },
      async set(key, value, _options) {
        session.set(key, value);
      },
      async remove(key, _options) {
        session.unset(key);
      },
    },
  });

  return supabase;
};
