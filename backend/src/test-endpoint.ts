import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const employer = users.users.find(u => u.email === 'employer@laborlink.com');
  const worker = users.users.find(u => u.email === 'worker@laborlink.com');

  const { data: signIn } = await supabaseAdmin.auth.signInWithPassword({
    email: 'employer@laborlink.com',
    password: 'Password123!',
  });
  
  const token = signIn.session!.access_token;
  
  const jobIdRes = await supabaseAdmin.from('jobs').select('id').eq('employer_id', employer!.id).single();
  const jobId = jobIdRes.data!.id;

  const res = await fetch(`http://127.0.0.1:3000/api/applications/job/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  console.log('Result:', JSON.stringify(json, null, 2));

  // Check what getJobApplicants does
  const data = json.data;
  console.log('First App profile:', data[0].profiles);
}
run();