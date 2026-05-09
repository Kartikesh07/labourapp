import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const employer_id = '92f3cec0-83cd-42de-9d4d-0b0782292a21';

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('*')
    .eq('employer_id', employer_id)
    .order('created_at', { ascending: false });
    
  console.log('Get My Jobs data:', data);
  console.log('Get My Jobs error:', error);
}
run();