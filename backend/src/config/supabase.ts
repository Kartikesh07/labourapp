import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Used for operations requiring elevated privileges
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
