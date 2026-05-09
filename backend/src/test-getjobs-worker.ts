import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const pageNum = 1;
  const limitNum = 10;
  const offset = 0;
  
  const res = await fetch('http://127.0.0.1:3000/api/auth/login', {
    method: 'POST', body: JSON.stringify({ email: 'newwork@cc.com', password: 'Password123!' }), headers: { 'Content-Type': 'application/json' }
  });
  const d = await res.json();
  const token = d.data?.session?.access_token;
  if(token) {
    await supabaseAdmin.auth.getUser(token);
  }

  let query = supabaseAdmin
    .from('jobs')
    .select('*, profiles!inner(name, avatar_url, employer_profiles!inner(company_name, company_logo_url))', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);

  const { data, count, error } = await query;
  console.log('Worker getJobs count:', count);
}
run();