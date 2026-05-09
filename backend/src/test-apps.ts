import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabaseAdmin
    .from('applications')
    .select('*, profiles(name, email, phone, avatar_url, worker_profiles(skills, experience, location))');
    
  console.log('APPS: ', JSON.stringify(data, null, 2));
  console.log('Error: ', error);
}
run();