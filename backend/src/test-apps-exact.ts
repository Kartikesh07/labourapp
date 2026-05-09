import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const jobId = '944c7b3a-de3c-48d4-aa3d-faaa1304bc72';
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select('*, profiles(name, email, phone, avatar_url, worker_profiles(skills, experience, location))')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    console.log('Error:', error);
    console.log('DATA:', JSON.stringify(data, null, 2));

    const formattedData = data?.map((app: any) => ({
      ...app,
      worker_profiles: app.profiles?.worker_profiles || null
    }));
    console.log('FORMATTED:', JSON.stringify(formattedData, null, 2));
  } catch (e) {
    console.log('EXCEPTION:', e);
  }
}
run();