import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  console.log('USERS:', users.users.map(u => ({ id: u.id, email: u.email, meta: u.user_metadata })));
  
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
  console.log('PROFILES:', profiles);
  
  const { data: employers } = await supabaseAdmin.from('employer_profiles').select('*');
  console.log('EMPLOYERS:', employers);
  
  const { data: jobs } = await supabaseAdmin.from('jobs').select('*');
  console.log('JOBS:', jobs);
}
run();